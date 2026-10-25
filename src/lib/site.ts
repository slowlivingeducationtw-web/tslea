// 全站共用的設定（聯絡資訊、選單、頁尾、共學主題），都來自後台。
// 每次建置只向 Sanity 查一次，頁首、頁尾與各頁共用同一份結果。
import { sanity, fetchOne, Q } from './sanity'
import { isTranslated, localize, type Lang } from './i18n'
import { withPhase } from './events'

export type Link = { label: string; href: string; _untranslated?: boolean }
export type NavItem = Link & { children?: (Link & { indent?: boolean })[] }

export type Settings = {
  orgName?: string
  orgNameEn?: string
  address?: string
  email: string
  facebook?: string
  footerNote?: string
  registrationNo?: string
  taxId?: string
  defaultShareImage?: any
}

export type Navigation = {
  mainNav?: NavItem[]
  headerCta?: Link
  footerGroups?: { title: string; links?: Link[] }[]
  facebookLabel?: string
}

export type Theme = {
  _key: string
  icon?: string
  title: string
  en?: string
  description?: string
  image?: any
  category?: string
  slug?: string
}
export type Themes = {
  title?: string
  themes?: Theme[]
  formatsTitle?: string
}

/** 學會活動類別（身呼吸、慢活日…）：活動與活動回顧的分類標籤 */
export type ActivityType = { _id: string; title: string; slug: string; image?: any; icon?: string; description?: string }
export type TypeRef = { title: string; slug: string } | null

// 建置時整批頁面共用一次查詢；本機預覽（dev）每次重新查，後台改了重新整理就看得到
const once = <T>(fn: () => Promise<T>) => {
  let p: Promise<T> | undefined
  return () => (import.meta.env.DEV ? fn() : (p ??= fn()))
}

// 快取的是後台原始資料（含譯文），每次依語言合併
const settings = once(() => fetchOne<Settings>(Q.siteSettings, {}, '網站設定'))
const navigation = once(() => fetchOne<Navigation>(Q.navigation, {}, '選單與頁尾'))
const themes = once(() => fetchOne<Themes>(Q.themes, {}, '慢活共學'))
const activityTypes = once(() => sanity.fetch<ActivityType[]>(Q.activityTypes))

export const getSettings = async (lang: Lang = 'zh') => localize(await settings(), lang)
export const getNavigation = async (lang: Lang = 'zh') => localize(await navigation(), lang)
export const getThemes = async (lang: Lang = 'zh') => localize(await themes(), lang)
export const getActivityTypes = async (lang: Lang = 'zh') => localize(await activityTypes(), lang)

// 三大主題頁（/themes/{slug}）：譯文在 themesSection 這一層
const themePages = once(() => sanity.fetch<{ themes?: any[] } | null>(Q.themePages))
export const themePaths = async () => ((await themePages())?.themes ?? []).map((t) => ({ params: { slug: t.slug as string } }))
export async function getThemePages(lang: Lang) {
  const fetched = await themePages()
  // 相關活動的「已結束」要用中文日期判斷，合併譯文前先算好（譯文裡的活動是另外的參照，不受影響）
  const raw = fetched && { ...fetched, themes: fetched.themes?.map((th) => ({ ...th, events: th.events?.map((e: any) => (e ? withPhase(e) : e)) })) }
  const loc = localize(raw, lang)
  return { themes: (loc?.themes ?? []) as any[], untranslated: !!loc?._untranslated, enTranslated: isTranslated(localize(raw, 'en')) }
}

// 活動卡片的色塊依「學會活動類別」的順序輪替；沒有類別的用綠色
const TYPE_TONES = ['mist', 'clay', 'leaf', 'forest'] as const
export const typeTone = (types: ActivityType[], slug?: string) => {
  const i = slug ? types.findIndex((t) => t.slug === slug) : -1
  return i >= 0 ? TYPE_TONES[i % TYPE_TONES.length] : 'leaf'
}

// 沒有照片時的色塊，依主題順序輪替（對應 site.css 的設計變數）
export const THEME_TONES = ['mist', 'clay', 'leaf'] as const
export const themeTone = (i: number) => THEME_TONES[i % THEME_TONES.length]

/** 預先帶好主旨的 Email 連結，讓來信容易分類 */
export const mailto = (email: string, subject: string) =>
  `mailto:${email}?subject=${encodeURIComponent(subject)}`

/** 卡片按鈕：有填連結就用連結，否則用 Email 主旨產生寄信連結 */
export const cardHref = (c: { href?: string; emailSubject?: string }, email: string) =>
  c.href?.trim() || mailto(email, c.emailSubject || '來自官網的詢問')

/** 外部連結另開新視窗 */
export const isExternal = (href: string) => /^https?:\/\//.test(href)

// 大標／重點句的 HTML 在 headline.ts（不連 Sanity，可以測試）
export { headlineHtml, highlightHtml } from './headline'
