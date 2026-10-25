// 網站語言：中文在根目錄，其他語言在 /{code}/ 底下（/en/about）。
// 語言清單要和後台 studio/schemaTypes/i18n.ts 的 LANGUAGES 一致。
// 這個檔案只放純函式（不用 import.meta.env），測試才能直接跑：npm test

export type Lang = 'zh' | 'en'

export const LANGS = [
  { code: 'zh', label: '繁體中文', short: '中文', htmlLang: 'zh-Hant-TW', hreflang: 'zh-Hant', ogLocale: 'zh_TW', prefix: '' },
  { code: 'en', label: 'English', short: 'English', htmlLang: 'en', hreflang: 'en', ogLocale: 'en_US', prefix: '/en' },
] as const satisfies readonly { code: Lang; label: string; short: string; htmlLang: string; hreflang: string; ogLocale: string; prefix: '' | `/${string}` }[]

export const DEFAULT_LANG: Lang = 'zh'

export const langInfo = (lang: Lang) => LANGS.find((l) => l.code === lang)!

const OTHER = LANGS.filter((l) => l.prefix)

export function langOf(pathname: string): Lang {
  const p = pathname.replace(/\.html$/, '') // 建置時網址帶 .html（build.format 'file'）
  return OTHER.find((l) => p === l.prefix || p.startsWith(l.prefix + '/'))?.code ?? DEFAULT_LANG
}

/** /en/about → /about；/en → / */
export function stripLang(path: string): string {
  const l = OTHER.find((l) => path === l.prefix || path.startsWith(l.prefix + '/') || path.startsWith(l.prefix + '?') || path.startsWith(l.prefix + '#'))
  if (!l) return path
  const rest = path.slice(l.prefix.length)
  return rest === '' || rest[0] !== '/' ? '/' + rest : rest
}

/**
 * 站內連結換成指定語言的版本，查詢字串與錨點保留。
 * 外部連結、mailto、同頁錨點、圖片等檔案（最後一段有副檔名）不動。
 */
export function localizePath(lang: Lang, href: string): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href
  const pathOnly = href.split(/[?#]/)[0]
  if (/\.[a-z0-9]+$/i.test(pathOnly.split('/').pop() ?? '')) return href
  const base = stripLang(href)
  const prefix = langInfo(lang).prefix
  if (!prefix) return base
  return base === '/' || base.startsWith('/?') || base.startsWith('/#') ? prefix + base.slice(1) : prefix + base
}

// ── 譯文合併 ──────────────────────────────────────────────
// 查詢把每份文件的 translations 投影成 "i18n"（見 sanity.ts 的 withI18n）。
// localize 把指定語言的譯文合併到中文資料上：空的欄位退回中文，陣列依 _key 對齊，
// 有 i18n 鍵但沒有譯文的文件標上 _untranslated: true。

export type Localized<T> = T extends (infer U)[] ? Localized<U>[] : T extends object ? T & { _untranslated?: boolean } : T

const META = new Set(['_type', '_key'])
const TR_META = new Set(['reviewed', 'sourceHash', '_type'])
const isObj = (v: unknown): v is Record<string, any> => typeof v === 'object' && v !== null && !Array.isArray(v)

function isEmpty(v: unknown): boolean {
  if (v == null) return true
  if (typeof v === 'string') return !v.trim()
  if (Array.isArray(v)) return v.length === 0
  if (isObj(v)) return Object.entries(v).every(([k, x]) => META.has(k) || isEmpty(x))
  return false
}

function merge(base: any, tr: any): any {
  if (isEmpty(tr)) return base
  if (Array.isArray(tr)) {
    if (!Array.isArray(base) || !tr.every((x) => isObj(x) && x._key)) return tr
    return tr.map((item) => merge(base.find((b: any) => isObj(b) && b._key === item._key), item))
  }
  if (isObj(tr) && isObj(base)) {
    const out: Record<string, any> = { ...base }
    for (const [k, v] of Object.entries(tr)) out[k] = merge(base[k], v)
    return out
  }
  return tr
}

const hasContent = (tr: unknown) => isObj(tr) && Object.entries(tr).some(([k, v]) => !TR_META.has(k) && !isEmpty(v))

// Noto Sans TC 的彎引號是全形字，英文裡會空一大格（society’s 看起來像 society ’ s）；
// 破折號前的空白改成不斷行空白，破折號才不會落到下一行開頭
const straightQuotes = (s: string) =>
  s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/ (?=[—–])/g, ' ')

export function localize<T>(value: T, lang: Lang): Localized<T> {
  if (Array.isArray(value)) return value.map((v) => localize(v, lang)) as any
  if (typeof value === 'string' && lang !== DEFAULT_LANG) return straightQuotes(value) as any
  if (!isObj(value)) return value as any
  const { i18n, translations, ...rest } = value as Record<string, any>
  const own: Record<string, any> = {}
  for (const [k, v] of Object.entries(rest)) own[k] = localize(v, lang)
  const tracked = 'i18n' in value || 'translations' in value
  if (lang === DEFAULT_LANG || !tracked) return own as any
  const tr = (i18n ?? translations)?.[lang]
  if (!hasContent(tr)) return { ...own, _untranslated: true } as any
  const clean: Record<string, any> = {}
  for (const [k, v] of Object.entries(tr)) if (!TR_META.has(k)) clean[k] = localize(v, lang)
  return { ...merge(own, clean), _untranslated: false } as any
}

/** 這份文件在目前語言是否有譯文（中文、或沒有追蹤翻譯的資料都算有） */
export const isTranslated = (doc: { _untranslated?: boolean } | null | undefined) => !doc?._untranslated

/** 人名：英文版有填「英文姓名」才用，否則用中文姓名（不自行音譯） */
export const displayName = (p: { name: string; nameEn?: string | null }, lang: Lang) =>
  lang !== DEFAULT_LANG && p.nameEn?.trim() ? p.nameEn.trim() : p.name
