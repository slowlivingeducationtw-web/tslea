import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'
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

// 所有 GROQ 查詢在 queries.ts（不連 Sanity，測試可以直接跑）
export { Q, withI18n } from './queries'
import { Q } from './queries'

/** 小幫手：查詢並在查不到必要內容時給出清楚的錯誤，而不是讓頁面默默空掉。 */
export async function fetchOne<T>(query: string, params?: Record<string, unknown>, what = '內容'): Promise<T> {
  const data = await sanity.fetch<T>(query, params ?? {})
  if (data == null) {
    throw new Error(`Sanity 查不到${what}。請確認後台是否已發布該筆資料。查詢：${query.slice(0, 80)}`)
  }
  return data
}
