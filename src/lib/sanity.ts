import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'

// dataset 是私有的，所以查詢一定要帶 token。
// 這段只在「建置時」執行（Astro 產生靜態 HTML 的那一刻），
// token 不會出現在瀏覽器拿到的任何檔案裡。
const token = import.meta.env.SANITY_READ_TOKEN

if (!token) {
  throw new Error(
    '缺少 SANITY_READ_TOKEN。本機請在專案根目錄建立 .env（可複製 .env.example）；' +
      'Cloudflare 請在 Workers 專案的「建置變數」新增同名變數。',
  )
}

export const sanity = createClient({
  projectId: '2lbk0ta8',
  dataset: 'production',
  apiVersion: '2026-01-01',
  useCdn: false, // 建置時要拿最新內容，不要快取
  token,
  perspective: 'published', // 只取已發布的，草稿不會出現在網站上
})

const builder = createImageUrlBuilder(sanity)

/** 產生 Sanity CDN 的圖片網址，可指定寬度。 */
export function imageUrl(source: any, width?: number) {
  if (!source?.asset) return undefined
  let img = builder.image(source).auto('format')
  if (width) img = img.width(width)
  return img.url()
}

/** 取得圖片原始尺寸，用來填 width/height 避免版面跳動。 */
export function imageDims(source: any): { width: number; height: number } | undefined {
  const ref: string | undefined = source?.asset?._ref
  if (!ref) return undefined
  const m = ref.match(/-(\d+)x(\d+)-/)
  if (!m) return undefined
  return { width: Number(m[1]), height: Number(m[2]) }
}

// ── 共用片段 ──────────────────────────────────────────────

const FIGURE = `{ "image": image, alt, caption }`

const RICH = `[]{
  ...,
  _type == "figure" => ${FIGURE},
  _type == "imageRow" => { ..., images[]${FIGURE} }
}`

// ── 查詢 ──────────────────────────────────────────────────

export const Q = {
  siteSettings: `*[_type == "siteSettings"][0]`,

  home: `*[_type == "homePage"][0]{ ..., aboutBody${RICH} }`,

  themes: `*[_type == "themesSection"][0]`,

  events: `*[_type == "event"] | order(sortDate asc)`,

  people: `*[_type == "person"] | order(order asc){
    name, role, group, note, term
  }`,

  articles: `*[_type == "article"] | order(publishedAt desc){
    title, "slug": slug.current, excerpt, category, series, accent,
    publishedAt, tags,
    "cover": cover${FIGURE},
    author->{ name, title, initial, accent }
  }`,

  article: `*[_type == "article" && slug.current == $slug][0]{
    title, "slug": slug.current, excerpt, category, series, accent,
    publishedAt, tags,
    "cover": cover${FIGURE},
    body${RICH},
    links,
    author->{ name, title, initial, accent }
  }`,

  articleSlugs: `*[_type == "article" && defined(slug.current)].slug.current`,

  plansPage: `*[_type == "plansPage"][0]{ ..., tracks[]{ track, body${RICH} } }`,

  planItems: `*[_type == "planItem"] | order(order asc)`,

  donate: `*[_type == "donatePage"][0]`,

  contact: `*[_type == "contactPage"][0]`,

  boardArea: `*[_type == "boardAreaPage"][0]`,
}

/** 小幫手：查詢並在查不到必要內容時給出清楚的錯誤，而不是讓頁面默默空掉。 */
export async function fetchOne<T>(query: string, params?: Record<string, unknown>, what = '內容'): Promise<T> {
  const data = await sanity.fetch<T>(query, params ?? {})
  if (data == null) {
    throw new Error(`Sanity 查不到${what}。請確認後台是否已發布該筆資料。查詢：${query.slice(0, 80)}`)
  }
  return data
}
