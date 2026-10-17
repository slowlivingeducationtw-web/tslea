// 慢活專欄文章：來自後台「內容 → 專欄文章」。列表頁與單篇頁共用。
import { sanity, Q } from './sanity'

// 分類與後台 studio/schemaTypes/shared.ts 的 CATEGORIES 一致；tone 是卡片色塊（site.css 的設計變數）
export const CATEGORIES = [
  { value: 'health', label: '身心健康', tone: 'mist', icon: '🌿' },
  { value: 'art', label: '藝術陪伴', tone: 'clay', icon: '🎨' },
  { value: 'eco', label: '生態永續', tone: 'leaf', icon: '🌏' },
  { value: 'travel', label: '慢旅共學', tone: 'forest', icon: '🚂' },
  { value: 'other', label: '其他', tone: 'leaf', icon: '✍️' },
] as const

export const categoryOf = (v?: string) => CATEGORIES.find((c) => c.value === v) ?? CATEGORIES[CATEGORIES.length - 1]

export type Article = {
  title: string
  slug: string
  excerpt?: string
  category: string
  series?: string
  publishedAt: string
  tags?: string[]
  cover?: { image?: any; alt?: string; caption?: string }
  author?: { name: string; title?: string } | null
}

/** 2026-09-14 → 2026.09.14 */
export const dateText = (d?: string) => (d ? d.slice(0, 10).replaceAll('-', '.') : '')

export const getArticles = () => sanity.fetch<Article[]>(Q.articles)
