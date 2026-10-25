// 語言小工具的測試：npm test
import { deepStrictEqual } from 'node:assert'
import { langOf, stripLang, localizePath, localize } from '../src/lib/i18n.ts'

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

console.log(failed ? `${failed} 項不符` : '全部通過')
process.exit(failed ? 1 : 0)
