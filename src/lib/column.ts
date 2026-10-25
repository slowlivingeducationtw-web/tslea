// 慢活專欄文章：來自後台「內容 → 專欄文章」。列表頁與單篇頁共用。
import { sanity, Q } from './sanity'
import { getEvents } from './events'
import { localize, type Lang } from './i18n'

// 分類與後台 studio/schemaTypes/shared.ts 的 CATEGORIES 一致；tone 是卡片色塊（site.css 的設計變數）
export const CATEGORIES = [
  { value: 'health', label: '身心健康', tone: 'mist', icon: '🌿' },
  { value: 'art', label: '藝術陪伴', tone: 'clay', icon: '🎨' },
  { value: 'eco', label: '生態永續', tone: 'leaf', icon: '🌏' },
  { value: 'travel', label: '慢旅共學', tone: 'forest', icon: '🚂' },
  { value: 'words', label: '慢活小語', tone: 'leaf', icon: '🍃' },
  { value: 'other', label: '其他', tone: 'leaf', icon: '✍️' },
  // 只有網站有、後台文章選不到：專欄頁把有回顧的活動也列進來（getColumnItems），點了回到原本的活動頁
  { value: 'recap', label: '活動回顧', tone: 'clay', icon: '📸' },
] as const

// 認不得的分類算「其他」（不能用陣列最後一個，最後一個是活動回顧）
export const categoryOf = (v?: string) => CATEGORIES.find((c) => c.value === v) ?? CATEGORIES.find((c) => c.value === 'other')!

export type Article = {
  title: string
  slug: string
  excerpt?: string
  category: string
  series?: string
  publishedAt: string
  tags?: string[]
  cover?: { image?: any; alt?: string; caption?: string }
  author?: { name: string; nameEn?: string; title?: string } | null
  /** 不是專欄文章時的連結（活動回顧 → /events/{slug}） */
  href?: string
  /** 同時也算在這些分類底下（活動回顧勾了「也放進專欄分類」） */
  alsoIn?: string[]
  _untranslated?: boolean
}

/** 這篇算不算在某個分類底下（主分類或「也放進」的分類） */
export const inCategory = (a: Article, cat: string) => a.category === cat || !!a.alsoIn?.includes(cat)

/** 2026-09-14 → 2026.09.14 */
export const dateText = (d?: string) => (d ? d.slice(0, 10).replaceAll('-', '.') : '')

/** 系列的短名：「慢活文字專欄｜每月一字」→「每月一字」 */
export const seriesLabel = (s?: string) => (s ? s.split(/[｜|]/).pop()!.trim() : '')

/** 後台「頁面文案 → 慢活專欄 → 專欄系列簡介」的一筆 */
export type SeriesDef = { name: string; title?: string; intro?: string }

/**
 * 有文章的系列：後台有寫簡介的照後台順序排前面，其餘依文章數多到少。
 * 附上簡介、文章數與最新一篇。
 */
export function seriesOf(articles: Article[], defs: SeriesDef[] = []) {
  const count = new Map<string, number>()
  for (const a of articles) if (a.series) count.set(a.series, (count.get(a.series) ?? 0) + 1)
  const rank = (v: string) => {
    const i = defs.findIndex((d) => d.name === v)
    return i < 0 ? defs.length : i
  }
  return [...count.entries()]
    .sort((x, y) => rank(x[0]) - rank(y[0]) || y[1] - x[1])
    .map(([value, n]) => {
      const def = defs.find((d) => d.name === value)
      return {
        value,
        label: seriesLabel(value),
        title: def?.title,
        intro: def?.intro,
        count: n,
        latest: articles.find((a) => a.series === value), // getArticles 已是新到舊
      }
    })
}

export const seriesHref = (s: string) => `/column?series=${encodeURIComponent(s)}`

/** 專欄頁的完整清單：專欄文章＋有回顧的活動（分類「活動回顧」），依日期新到舊 */
export async function getColumnItems(lang: Lang = 'zh') {
  const [articles, { list }] = await Promise.all([getArticles(lang), getEvents(lang)])
  const recaps: Article[] = list
    .filter((e) => e.hasRecap)
    .map((e) => ({
      title: e.title,
      slug: e.slug,
      href: `/events/${e.slug}`,
      excerpt: e.description,
      category: 'recap',
      publishedAt: e.sortDate,
      cover: e.cover,
      author: e.recapAuthor,
      alsoIn: e.columnCategories,
      _untranslated: e._untranslated,
    }))
  return [...articles, ...recaps].sort((x, y) => y.publishedAt.localeCompare(x.publishedAt))
}

export const articlePaths = async () => (await sanity.fetch<string[]>(Q.articleSlugs)).map((slug) => ({ params: { slug } }))

export const getArticles = async (lang: Lang = 'zh') => localize(await sanity.fetch<Article[]>(Q.articles), lang)
