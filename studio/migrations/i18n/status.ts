// 列出每份文件的翻譯狀態（唯讀）：
//   npx sanity exec migrations/i18n/status.ts --with-user-token
// 加 EXPORT=1 會把「尚未翻譯」與「中文改過」的中文內容匯出到 _private/translations/source/，給 Claude 翻譯。
// LANG_CODE 指定語言，預設 en。
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { getCliClient } from 'sanity/cli'
import { TRANSLATABLE, sourceHash } from '../../schemaTypes/i18n'
import { statusOf } from './lib'

const client = getCliClient({ apiVersion: '2024-01-01' })
const lang = process.env.LANG_CODE || 'en'
const OUT = resolve(process.cwd(), '..', '_private', 'translations', 'source')

const LABEL = { untranslated: '尚未翻譯', stale: '中文改過、英文可能過時', unreviewed: '已翻譯、尚未校對', ok: '已校對' } as const
const titleOf = (d: any) => d.title || d.name || d.label || d._id

async function run() {
  const docs: any[] = await client.fetch(`*[_type in $types && !(_id in path("drafts.**"))] | order(_type asc, _id asc)`, {
    types: Object.keys(TRANSLATABLE),
  })
  const groups: Record<string, any[]> = { untranslated: [], stale: [], unreviewed: [], ok: [] }
  for (const d of docs) groups[statusOf(d, lang)].push(d)
  for (const [k, list] of Object.entries(groups)) {
    console.log(`\n${LABEL[k as keyof typeof LABEL]}（${list.length}）`)
    for (const d of list) console.log(`  ${d._type}  ${titleOf(d)}  [${d._id}]`)
  }
  if (process.env.EXPORT === '1') {
    mkdirSync(OUT, { recursive: true })
    const todo = [...groups.untranslated, ...groups.stale]
    for (const d of todo) {
      const fields: Record<string, unknown> = {}
      for (const f of TRANSLATABLE[d._type].fields) if (d[f] != null) fields[f] = d[f]
      writeFileSync(resolve(OUT, `${d._id}.json`), JSON.stringify({ _id: d._id, _type: d._type, lang, sourceHash: sourceHash(d, d._type), fields }, null, 2))
    }
    console.log(`\n已匯出 ${todo.length} 份到 ${OUT}`)
  }
}

run()
