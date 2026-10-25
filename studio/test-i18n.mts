// 翻譯欄位的測試：npm run test:i18n
import { schemaTypes } from './schemaTypes/index.ts'
import { TRANSLATABLE, LANGUAGES, sourceHash } from './schemaTypes/i18n.ts'

let failed = 0
const fail = (msg: string) => { failed++; console.log('✗ ' + msg) }
const types = new Map((schemaTypes as any[]).filter((t) => t.type === 'document').map((t) => [t.name, t]))

const EXPECTED = 'siteSettings navigation homePage themesSection aboutPage joinPage partnerPage eventsPage columnPage donatePage contactPage boardAreaPage article author person event activityType'.split(' ')
for (const name of EXPECTED) if (!TRANSLATABLE[name]) fail(`TRANSLATABLE 缺少 ${name}`)

for (const [name, { fields }] of Object.entries(TRANSLATABLE)) {
  const type = types.get(name)
  if (!type) { fail(`TRANSLATABLE 的 ${name} 不是文件類型`); continue }
  const own = type.fields.filter((f: any) => f.name !== 'translations')
  for (const f of fields) if (!own.some((x: any) => x.name === f)) fail(`${name}.${f} 不存在`)

  const tr = type.fields.find((f: any) => f.name === 'translations')
  if (!tr) { fail(`${name} 沒有 translations 欄位`); continue }
  for (const lang of LANGUAGES.slice(1)) {
    const sub = tr.fields.find((f: any) => f.name === lang.code)
    if (!sub) { fail(`${name}.translations 沒有 ${lang.code}`); continue }
    const names = sub.fields.map((f: any) => f.name)
    for (const f of [...fields, 'reviewed', 'sourceHash']) if (!names.includes(f)) fail(`${name}.translations.${lang.code} 缺 ${f}`)
    if ((name === 'person' || name === 'author') && !names.includes('nameEn')) fail(`${name} 缺 nameEn`)
    for (const f of sub.fields) {
      if (!fields.includes(f.name)) continue
      for (const k of ['validation', 'group', 'initialValue']) if (f[k] !== undefined) fail(`${name}.translations.${lang.code}.${f.name} 還有 ${k}`)
    }
  }
  if (!type.groups?.some((g: any) => g.name === 'translations')) fail(`${name} 沒有翻譯分頁`)
  if (tr.group !== 'translations') fail(`${name}.translations 不在翻譯分頁`)
}

// 原本沒有分頁的文件：中文欄位放進預設的「中文」分頁
{
  const about = types.get('aboutPage')
  const main = about.groups?.find((g: any) => g.name === 'main')
  if (!main?.default) fail('aboutPage 沒有預設的 main 分頁')
  for (const f of about.fields) if (f.name !== 'translations' && f.group !== 'main') fail(`aboutPage.${f.name} 不在 main`)
}

// 中文版本指紋
{
  const a = { _type: 'aboutPage', title: '認識學會', lead: '慢', slug: { current: 'x' } }
  const b = { lead: '慢', slug: { current: 'x' }, title: '認識學會', _type: 'aboutPage' }
  if (sourceHash(a, 'aboutPage') !== sourceHash(b, 'aboutPage')) fail('key 順序不同，指紋卻不同')
  if (sourceHash(a, 'aboutPage') === sourceHash({ ...a, lead: '快' }, 'aboutPage')) fail('改了可翻欄位，指紋沒變')
  const ev = { _type: 'event', title: '慢活日', slug: { current: 'a' }, body: [{ _key: 'k', x: { b: 1, a: 2 } }] }
  if (sourceHash(ev, 'event') !== sourceHash({ ...ev, slug: { current: 'b' } }, 'event')) fail('改了不可翻欄位，指紋卻變了')
}

console.log(failed ? `${failed} 項不符` : '全部通過')
process.exit(failed ? 1 : 0)
