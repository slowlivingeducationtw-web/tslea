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
  // 只取已發布的，草稿不會出現在網站上。
  // 本機想先看後台草稿的效果時：SANITY_PREVIEW_DRAFTS=1 npm run build（Cloudflare 上不要設）
  perspective: import.meta.env.SANITY_PREVIEW_DRAFTS === '1' ? 'drafts' : 'published',
})

const builder = createImageUrlBuilder(sanity)

/** 產生 Sanity CDN 的圖片網址，可指定寬度。 */
export function imageUrl(source: any, width?: number) {
  if (!source?.asset) return undefined
  let img = builder.image(source).auto('format')
  if (width) img = img.width(width)
  return img.url()
}

/** 分享圖（LINE、Facebook）：裁成 1200 × 630，會依後台設定的重點位置裁切。 */
export function shareImageUrl(source: any) {
  if (!source?.asset) return undefined
  return builder.image(source).width(1200).height(630).fit('crop').format('jpg').url()
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

// 活動卡片需要的欄位（活動列表、主題頁「相關活動」共用）
const EVENT_CARD = `{
    title, "slug": slug.current, dateLabel, sortDate, place, icon, description,
    signupStatus, signupUrl, tag,
    "cover": cover${FIGURE},
    "videoUrl": video.url,
    "hasRecap": count(recap) > 0 || defined(video.url),
    "recapAuthor": recapAuthor->{ name, title },
    "activityType": activityType->{ title, "slug": slug.current }
  }`

// ── 查詢 ──────────────────────────────────────────────────

export const Q = {
  siteSettings: `*[_type == "siteSettings"][0]`,

  navigation: `*[_id == "navigation"][0]`,

  home: `*[_id == "homePage"][0]{
    heroSlides, statement, statementHighlight, eventsTitle, eventsSub, columnTitle, columnSub,
    tilesTitle, tiles, ctaTitle, ctaText, ctaButtons, seoTitle, seoDescription
  }`,

  themes: `*[_id == "themesSection"][0]{ title, themes[]{ ..., "slug": slug.current }, formatsTitle }`,

  // 主題頁（/themes/{slug}）：完整介紹＋挑選的相關活動（未發布的活動會是 null，頁面上濾掉）
  themePages: `*[_id == "themesSection"][0].themes[defined(slug.current)]{
    _key, icon, title, en, description, image, category, "slug": slug.current,
    body${RICH},
    "events": events[]->${EVENT_CARD}
  }`,

  aboutPage: `*[_id == "aboutPage"][0]{ ..., body${RICH} }`,

  joinPage: `*[_id == "joinPage"][0]`,

  partnerPage: `*[_id == "partnerPage"][0]`,

  eventsPage: `*[_id == "eventsPage"][0]`,

  columnPage: `*[_id == "columnPage"][0]`,

  // 活動列表與卡片（一個活動一頁；hasRecap＝已補上活動回顧）
  events: `*[_type == "event" && defined(slug.current)] | order(sortDate asc)${EVENT_CARD}`,

  event: `*[_type == "event" && slug.current == $slug][0]{
    title, "slug": slug.current, dateLabel, sortDate, place, icon, description,
    signupStatus, signupUrl, tag,
    "cover": cover${FIGURE},
    intro${RICH},
    recap${RICH},
    video,
    links,
    "recapAuthor": recapAuthor->{ name, title },
    // 對應的介紹／回顧：只要其中一筆設定，兩邊都找得到
    "pair": coalesce(
      pair->{ title, "slug": slug.current, "isRecap": count(recap) > 0 || defined(video.url) },
      *[_type == "event" && pair._ref == ^._id][0]{ title, "slug": slug.current, "isRecap": count(recap) > 0 || defined(video.url) }
    ),
    "activityType": activityType->{ title, "slug": slug.current }
  }`,

  activityTypes: `*[_type == "activityType" && defined(slug.current)] | order(order asc){
    _id, title, "slug": slug.current, image, icon, description
  }`,

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
