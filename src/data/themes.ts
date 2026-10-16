// 三大共學主題。首頁主題卡、活動卡片的主題標籤都從這裡取。
// `category` 對應後台專欄文章的「分類」值，主題卡會連到 /column?cat=<category>。

export type ThemeSlug = 'health' | 'art' | 'eco'

export type Theme = {
  slug: ThemeSlug
  title: string
  en: string
  summary: string
  icon: string
  /** 卡片底色，對應 site.css 的設計變數 */
  tone: 'mist' | 'clay' | 'leaf'
  category: string
}

export const THEMES: Theme[] = [
  {
    slug: 'health',
    title: '身心健康',
    en: 'Body & Mind',
    summary: '正念、身體覺察、情緒照顧與生活平衡。',
    icon: '🌿',
    tone: 'mist',
    category: 'health',
  },
  {
    slug: 'art',
    title: '藝術陪伴',
    en: 'Art & Companionship',
    summary: '藝術創作、感官體驗、表達與陪伴。',
    icon: '🎨',
    tone: 'clay',
    category: 'art',
  },
  {
    slug: 'eco',
    title: '生態永續',
    en: 'Ecology & Sustainability',
    summary: '自然觀察、環境教育與友善生活實踐。',
    icon: '🌏',
    tone: 'leaf',
    category: 'eco',
  },
]

export const themeBySlug = (slug: string) => THEMES.find((t) => t.slug === slug)

