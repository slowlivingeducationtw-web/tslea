// 語言小工具的測試：npm test
import { deepStrictEqual } from 'node:assert'
import { langOf, stripLang, localizePath, localize, displayName } from '../src/lib/i18n.ts'

let failed = 0
const eq = (name: string, got: unknown, want: unknown) => {
  try { deepStrictEqual(got, want) } catch {
    failed++
    console.log(`✗ ${name}：得到 ${JSON.stringify(got)}，應為 ${JSON.stringify(want)}`)
  }
}

// ── 網址 ──
eq('langOf /en/about', langOf('/en/about'), 'en')
eq('langOf /en', langOf('/en'), 'en')
eq('langOf /english', langOf('/english'), 'zh')
eq('langOf /', langOf('/'), 'zh')
// 建置時 build.format 'file' 的網址帶 .html
eq('langOf /en.html', langOf('/en.html'), 'en')
eq('langOf /en/about.html', langOf('/en/about.html'), 'en')
eq('langOf /about.html', langOf('/about.html'), 'zh')
eq('stripLang /en/about', stripLang('/en/about'), '/about')
eq('stripLang /en', stripLang('/en'), '/')
eq('stripLang /about', stripLang('/about'), '/about')
eq('localizePath en /', localizePath('en', '/'), '/en')
eq('localizePath en /about', localizePath('en', '/about'), '/en/about')
eq('localizePath en 帶查詢與錨點', localizePath('en', '/events?type=breath#list'), '/en/events?type=breath#list')
eq('localizePath en 不重複加', localizePath('en', '/en/about'), '/en/about')
for (const x of ['https://facebook.com/x', 'mailto:a@b.org', '#donate', '/images/logo.png', '//cdn.x/y'])
  eq(`localizePath en 不動 ${x}`, localizePath('en', x), x)
eq('localizePath zh 去掉 /en', localizePath('zh', '/en/about'), '/about')

// ── 譯文合併 ──
eq('zh 移除 i18n', localize({ title: '慢', i18n: { en: { title: 'Slow' } } }, 'zh'), { title: '慢' })
eq('zh 移除 translations', localize({ title: '慢', translations: { en: { title: 'Slow' } } }, 'zh'), { title: '慢' })
eq('en 有譯文、空字串退回中文',
  localize({ title: '慢', place: '苗栗', i18n: { en: { title: 'Slow', place: '' } } }, 'en'),
  { title: 'Slow', place: '苗栗', _untranslated: false })
eq('en 無譯文 null', localize({ title: '慢', i18n: null }, 'en'), { title: '慢', _untranslated: true })
eq('en 只有校對欄位算無譯文',
  localize({ title: '慢', i18n: { en: { reviewed: false, sourceHash: 'x' } } }, 'en'),
  { title: '慢', _untranslated: true })
eq('沒有 i18n 鍵不加旗標', localize({ title: '慢' }, 'en'), { title: '慢' })
eq('巢狀物件合併',
  localize({ cover: { image: { asset: { _ref: 'img-1' } }, alt: '圖' }, i18n: { en: { cover: { alt: 'Photo' } } } }, 'en'),
  { cover: { image: { asset: { _ref: 'img-1' } }, alt: 'Photo' }, _untranslated: false })
eq('陣列依 _key 對齊、英文決定成員',
  localize({ items: [{ _key: 'a', t: '一', icon: '🌿' }, { _key: 'b', t: '二', icon: '🎨' }], i18n: { en: { items: [{ _key: 'b', t: 'Two' }] } } }, 'en'),
  { items: [{ _key: 'b', t: 'Two', icon: '🎨' }], _untranslated: false })
eq('陣列沒有 _key 整個取代',
  localize({ tags: ['慢', '活'], i18n: { en: { tags: ['slow'] } } }, 'en'),
  { tags: ['slow'], _untranslated: false })
eq('參照的子文件各自合併',
  localize({ title: '文', author: { name: '小明', title: '老師', i18n: null }, i18n: { en: { title: 'Post' } } }, 'en'),
  { title: 'Post', author: { name: '小明', title: '老師', _untranslated: true }, _untranslated: false })
eq('陣列裡的文件', localize([{ t: '一', i18n: { en: { t: 'One' } } }], 'en'), [{ t: 'One', _untranslated: false }])
eq('接受 translations 原始欄位',
  localize({ title: '慢', translations: { en: { title: 'Slow', reviewed: true } } }, 'en'),
  { title: 'Slow', _untranslated: false })

// ── 姓名：英文版有填英文姓名才用 ──
eq('英文姓名', displayName({ name: '王小明', nameEn: 'Hsiao-Ming Wang' }, 'en'), 'Hsiao-Ming Wang')
eq('英文姓名留空用中文', displayName({ name: '王小明', nameEn: '' }, 'en'), '王小明')
eq('中文頁不用英文姓名', displayName({ name: '王小明', nameEn: 'Hsiao-Ming Wang' }, 'zh'), '王小明')

// ── 介面文字 ──
{
  const { UI, catLabel, seriesName } = await import('../src/lib/ui.ts')
  const { readFileSync } = await import('node:fs')
  // column.ts 會連 Sanity，不能直接 import；從原始碼讀出分類值
  const col = readFileSync(new URL('../src/lib/column.ts', import.meta.url), 'utf8')
  const catBlock = col.slice(col.indexOf('export const CATEGORIES'), col.indexOf('] as const', col.indexOf('export const CATEGORIES')))
  const CATEGORIES = [...catBlock.matchAll(/value: '([^']+)'/g)].map((m) => ({ value: m[1] }))
  if (CATEGORIES.length < 5) { failed++; console.log('✗ 讀不到 CATEGORIES') }
  const zh = Object.keys(UI.zh).sort(), en = Object.keys(UI.en).sort()
  eq('UI 中英鍵相同', en, zh)
  for (const lang of ['zh', 'en'] as const)
    for (const [k, v] of Object.entries(UI[lang])) if (!String(v).trim()) { failed++; console.log(`✗ UI.${lang}.${k} 是空的`) }
  const cjk = /[㐀-鿿]/
  for (const c of CATEGORIES) if (cjk.test(catLabel(c.value, 'en'))) { failed++; console.log(`✗ 分類 ${c.value} 沒有英文`) }
  eq('分類中文照舊', catLabel('health', 'zh'), '身心健康')
  // 後台的每個系列都要有英文名
  const shared = readFileSync(new URL('../studio/schemaTypes/shared.ts', import.meta.url), 'utf8')
  const seriesBlock = shared.slice(shared.indexOf('export const SERIES'), shared.indexOf(']', shared.indexOf('export const SERIES')))
  const values = [...seriesBlock.matchAll(/value: '([^']+)'/g)].map((m) => m[1])
  if (!values.length) { failed++; console.log('✗ 讀不到 SERIES') }
  for (const v of values) {
    if (cjk.test(seriesName(v, 'en'))) { failed++; console.log(`✗ 系列 ${v} 沒有英文`) }
    if (cjk.test(seriesName(v, 'en', true))) { failed++; console.log(`✗ 系列 ${v} 沒有英文短名`) }
  }
  eq('系列中文全名', seriesName('慢活文字專欄｜每月一字', 'zh'), '慢活文字專欄｜每月一字')
  eq('系列中文短名', seriesName('慢活文字專欄｜每月一字', 'zh', true), '每月一字')
}

// ── 查詢＋合併（groq-js 跑真的查詢，假資料）──
{
  const { parse, evaluate } = await import('groq-js')
  const { Q } = await import('../src/lib/queries.ts')
  const run = async (q: string, dataset: any[], params: Record<string, unknown> = {}) =>
    (await evaluate(parse(q, { params }), { dataset, params })).get()
  const tr = (en: any) => ({ translations: { en } })
  const events = [
    { _id: 'e1', _type: 'event', title: '介紹', slug: { current: 'intro' }, dateLabel: '2026 · 09 · 12', sortDate: '2026-09-12', ...tr({ title: 'Intro' }) },
    { _id: 'e2', _type: 'event', title: '回顧', slug: { current: 'recap' }, dateLabel: '2026 · 09 · 12', sortDate: '2026-09-12',
      pair: { _type: 'reference', _ref: 'e1' }, recap: [{ _type: 'block', _key: 'b', children: [] }], ...tr({ title: 'Recap' }) },
    { _id: 'e3', _type: 'event', title: '沒有配對', slug: { current: 'solo' }, dateLabel: '2026 · 01 · 01', sortDate: '2026-01-01', ...tr({ title: 'Solo' }) },
  ]
  // 介紹頁的「回顧」連結是反向找出來的；英文版要找到同一筆，沒有配對的不能憑空多出連結
  const pairOf = async (slug: string, lang: 'zh' | 'en') => localize(await run(Q.event, events, { slug }), lang).pair?.slug ?? null
  for (const [slug, want] of [['intro', 'recap'], ['recap', 'intro'], ['solo', null]] as const)
    for (const lang of ['zh', 'en'] as const) eq(`活動 ${slug} 的配對（${lang}）`, await pairOf(slug, lang), want)

  // 英文姓名：後台填了就要查得到
  const people = [{ _id: 'p1', _type: 'person', name: '王小明', role: '理事', group: 'director', term: 1, order: 1, ...tr({ nameEn: 'Hsiao-Ming Wang', role: 'Director' }) }]
  const p = localize(await run(Q.people, people), 'en')[0]
  eq('理監事英文姓名', displayName(p, 'en'), 'Hsiao-Ming Wang')
  eq('理監事中文姓名不變', displayName(localize(await run(Q.people, people), 'zh')[0], 'zh'), '王小明')
  const authors = [{ _id: 'a1', _type: 'author', name: '陳玉明', title: '作者', ...tr({ nameEn: 'Yu-Ming Chen', title: 'Author' }) },
    { _id: 'x1', _type: 'article', title: '文', slug: { current: 's' }, publishedAt: '2026-01-01', author: { _type: 'reference', _ref: 'a1' }, ...tr({ title: 'Post' }) }]
  const art = localize(await run(Q.article, authors, { slug: 's' }), 'en')
  eq('作者英文姓名', displayName(art.author, 'en'), 'Yu-Ming Chen')
  const recapAuthor = [{ ...authors[0] }, { ...events[1], recapAuthor: { _type: 'reference', _ref: 'a1' } }, events[0]]
  eq('活動回顧作者英文姓名', displayName(localize(await run(Q.event, recapAuthor, { slug: 'recap' }), 'en').recapAuthor, 'en'), 'Yu-Ming Chen')
}

console.log(failed ? `${failed} 項不符` : '全部通過')
process.exit(failed ? 1 : 0)
