// 把 _private/translations/<語言>/*.json 的譯文寫進後台（使用者說「推上去」才執行）：
//   npx sanity exec migrations/i18n/apply.ts --with-user-token
// DRY_RUN=1：只檢查不寫入。FORCE=1：連已校對的也覆蓋。LANG_CODE 指定語言，預設 en。
// 任何一份譯文的形狀不對（少了項目、改到網址或圖片）就整批不寫。
// 已發布版與草稿都寫（草稿存在的話），全部放在同一個 transaction。寫完的檔案搬到 applied/<語言>/。
import { mkdirSync, readdirSync, readFileSync, renameSync } from 'node:fs'
import { resolve } from 'node:path'
import { getCliClient } from 'sanity/cli'
import { TRANSLATABLE } from '../../schemaTypes/i18n'
import { checkTranslationShape, planPatches, type TranslationFile } from './lib'

const client = getCliClient({ apiVersion: '2024-01-01' })
const lang = process.env.LANG_CODE || 'en'
const ROOT = resolve(process.cwd(), '..', '_private', 'translations')
const DIR = resolve(ROOT, lang)
const DONE = resolve(ROOT, 'applied', lang)

async function run() {
  const names = readdirSync(DIR).filter((f) => f.endsWith('.json'))
  const files = names.map((f) => ({ name: f, file: JSON.parse(readFileSync(resolve(DIR, f), 'utf8')) as TranslationFile }))

  // 先全部檢查
  const problems: string[] = []
  const plans = []
  for (const { name, file } of files) {
    const [published, draft] = await Promise.all([client.getDocument(file._id), client.getDocument(`drafts.${file._id}`)])
    if (published) {
      for (const f of TRANSLATABLE[file._type]?.fields ?? [])
        if (published[f] != null && file.translation[f] !== undefined)
          problems.push(...checkTranslationShape(published[f], file.translation[f], f).map((p) => `${name}：${p}`))
    }
    plans.push({ name, file, plan: planPatches({ lang, ...file }, published as any, draft as any, { force: process.env.FORCE === '1' }) })
  }
  if (problems.length) {
    console.log(`譯文形狀有 ${problems.length} 個問題，全部不寫入：`)
    for (const p of problems) console.log('  ' + p)
    process.exit(1)
  }

  const skipped = plans.filter((p) => p.plan.skip)
  const todo = plans.filter((p) => !p.plan.skip)
  for (const p of skipped) console.log(`略過 ${p.name}：${p.plan.skip}`)
  console.log(`要寫入 ${todo.length} 份（${todo.reduce((n, p) => n + p.plan.patches.length, 0)} 筆，含草稿）`)
  if (process.env.DRY_RUN === '1' || !todo.length) return

  const tx = client.transaction()
  for (const p of todo) for (const patch of p.plan.patches) tx.patch(patch.id, (x) => x.set(patch.set))
  await tx.commit()
  mkdirSync(DONE, { recursive: true })
  for (const p of todo) renameSync(resolve(DIR, p.name), resolve(DONE, p.name))
  console.log('已寫入：' + todo.map((p) => p.name).join('、'))
}

run()
