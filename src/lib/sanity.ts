import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'
import { LANGS } from './i18n'
import { overlayFetch } from './overlay'

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

const client = createClient({
  projectId: '2lbk0ta8',
  dataset: 'production',
  apiVersion: '2026-01-01',
  useCdn: false, // 建置時要拿最新內容，不要快取
  token,
  // 只取已發布的，草稿不會出現在網站上。
  // 本機想先看後台草稿的效果時：SANITY_PREVIEW_DRAFTS=1 npm run build（Cloudflare 上不要設）
  perspective: import.meta.env.SANITY_PREVIEW_DRAFTS === '1' ? 'drafts' : 'published',
})

// 本機預覽還沒寫進後台的譯文時（I18N_OVERLAY=1），查詢改在本機執行，見 overlay.ts
export const sanity: Pick<typeof client, 'fetch'> =
  import.meta.env.I18N_OVERLAY === '1'
    ? { fetch: ((query: string, params?: Record<string, unknown>) => overlayFetch(client, query, params)) as typeof client.fetch }
    : client

const builder = createImageUrlBuilder(client)

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

/**
 * 投影加上譯文：'{ a, b }' → '{ a, b, "i18n": translations{ "en": en{ a, b } } }'。
 * 譯文用和中文一樣的投影取出，取回後由 i18n.ts 的 localize 合併。
 * 有英文版的文件（含 -> 參照進來的）都要包。
 * 由中文算出來的值（例：hasRecap）不能從譯文算，否則譯文缺欄位時會蓋掉中文的結果：
 * 這種投影另外傳一份不含那些值的 translated。
 */
export function withI18n(projection: string, translated = projection): string {
  const strip = (p: string) => p.trim().replace(/^\{/, '').replace(/\}$/, '').trim()
  const inner = strip(projection)
  const tr = strip(translated)
  const langs = LANGS.filter((l) => l.prefix).map((l) => `"${l.code}": ${l.code}{ ${tr} }`).join(', ')
  return `{ ${inner}, "i18n": translations{ ${langs} } }`
}

const FIGURE = `{ "image": image, alt, caption }`

const RICH = `[]{
  ...,
  _type == "figure" => ${FIGURE},
  _type == "imageRow" => { ..., images[]${FIGURE} }
}`

// 活動卡片需要的欄位（活動列表、主題頁「相關活動」共用）
const AUTHOR = withI18n(`{ name, title, initial, accent }`)
const TYPE_REF = withI18n(`{ title, "slug": slug.current }`)

const EVENT_CARD = withI18n(`{
    title, "slug": slug.current, dateLabel, sortDate, place, icon, description,
    signupStatus, signupUrl, tag,
    "cover": cover${FIGURE},
    "videoUrl": video.url,
    "hasRecap": count(recap) > 0 || defined(video.url),
    "recapAuthor": recapAuthor->${withI18n('{ name, title }')},
    columnCategories,
    "activityType": activityType->${TYPE_REF}
  }`, `{ title, dateLabel, place, description, tag, "cover": cover${FIGURE} }`)

const PAIR = withI18n(`{ title, "slug": slug.current, "isRecap": count(recap) > 0 || defined(video.url) }`, `{ title }`)

// ── 查詢 ──────────────────────────────────────────────────

export const Q = {
  siteSettings: `*[_type == "siteSettings"][0]${withI18n('{ ... }')}`,

  navigation: `*[_id == "navigation"][0]${withI18n('{ ... }')}`,

  home: `*[_id == "homePage"][0]${withI18n(`{
    heroSlides, statement, statementHighlight, eventsTitle, eventsSub, columnTitle, columnSub,
    tilesTitle, tiles, ctaTitle, ctaText, ctaButtons, seoTitle, seoDescription
  }`)}`,

  themes: `*[_id == "themesSection"][0]${withI18n('{ title, themes[]{ ..., "slug": slug.current }, formatsTitle }')}`,

  // 主題頁（/themes/{slug}）：完整介紹＋挑選的相關活動（未發布的活動會是 null，頁面上濾掉）
  // 譯文在 themesSection 這一層，所以整份取回、合併後再拿 .themes。
  // 譯文那邊不取相關活動：活動清單照中文版，每個活動再各自合併自己的譯文
  themePages: `*[_id == "themesSection"][0]${withI18n(`{ "themes": themes[defined(slug.current)]{
    _key, icon, title, en, description, image, category, "slug": slug.current,
    body${RICH},
    "events": events[]->${EVENT_CARD}
  } }`, `{ "themes": themes[defined(slug.current)]{ _key, title, description, image, "slug": slug.current, body${RICH} } }`)}`,

  aboutPage: `*[_id == "aboutPage"][0]${withI18n(`{ ..., body${RICH} }`)}`,

  joinPage: `*[_id == "joinPage"][0]${withI18n('{ ... }')}`,

  partnerPage: `*[_id == "partnerPage"][0]${withI18n('{ ... }')}`,

  eventsPage: `*[_id == "eventsPage"][0]${withI18n('{ ... }')}`,

  columnPage: `*[_id == "columnPage"][0]${withI18n('{ ... }')}`,

  // 活動列表與卡片（一個活動一頁；hasRecap＝已補上活動回顧）
  events: `*[_type == "event" && defined(slug.current)] | order(sortDate asc)${EVENT_CARD}`,

  event: `*[_type == "event" && slug.current == $slug][0]${withI18n(`{
    title, "slug": slug.current, dateLabel, sortDate, place, icon, description,
    signupStatus, signupUrl, tag,
    "cover": cover${FIGURE},
    intro${RICH},
    recap${RICH},
    video,
    links,
    "recapAuthor": recapAuthor->${withI18n('{ name, title }')},
    // 對應的介紹／回顧：只要其中一筆設定，兩邊都找得到
    "pair": coalesce(
      pair->${PAIR},
      *[_type == "event" && pair._ref == ^._id][0]${PAIR}
    ),
    "activityType": activityType->${TYPE_REF}
  }`)}`,

  activityTypes: `*[_type == "activityType" && defined(slug.current)] | order(order asc)${withI18n(`{
    _id, title, "slug": slug.current, image, icon, description
  }`)}`,

  people: `*[_type == "person"] | order(order asc)${withI18n(`{
    name, role, group, note, term, speech
  }`)}`,

  articles: `*[_type == "article"] | order(publishedAt desc)${withI18n(`{
    title, "slug": slug.current, excerpt, category, series, accent,
    publishedAt, tags,
    "cover": cover${FIGURE},
    "author": author->${AUTHOR}
  }`)}`,

  article: `*[_type == "article" && slug.current == $slug][0]${withI18n(`{
    title, "slug": slug.current, excerpt, category, series, accent,
    publishedAt, tags,
    "cover": cover${FIGURE},
    body${RICH},
    links,
    "author": author->${AUTHOR}
  }`)}`,


  articleSlugs: `*[_type == "article" && defined(slug.current)].slug.current`,

  donate: `*[_type == "donatePage"][0]${withI18n('{ ... }')}`,

  contact: `*[_type == "contactPage"][0]${withI18n('{ ... }')}`,

  boardArea: `*[_type == "boardAreaPage"][0]${withI18n('{ ... }')}`,
}

/** 小幫手：查詢並在查不到必要內容時給出清楚的錯誤，而不是讓頁面默默空掉。 */
export async function fetchOne<T>(query: string, params?: Record<string, unknown>, what = '內容'): Promise<T> {
  const data = await sanity.fetch<T>(query, params ?? {})
  if (data == null) {
    throw new Error(`Sanity 查不到${what}。請確認後台是否已發布該筆資料。查詢：${query.slice(0, 80)}`)
  }
  return data
}
