// 活動資料：來自後台「內容 → 活動」。一個活動一頁（/events/{slug}），
// 活動前是宣傳與報名，辦完後在同一筆補上回顧。首頁「近期活動」與 /events 共用同一份清單。
import { sanity, Q } from './sanity'
import { localize, type Lang } from './i18n'
import { t, type UiKey } from './ui'

export type CmsEvent = {
  title: string
  slug: string
  dateLabel: string
  sortDate: string
  place?: string
  icon?: string
  description?: string
  tag?: string
  cover?: { image?: any; alt?: string; caption?: string }
  hasRecap?: boolean
  recapAuthor?: { name: string; nameEn?: string; title?: string } | null
  /** 有回顧時，除了「活動回顧」也列在這些專欄分類底下 */
  columnCategories?: string[]
  videoUrl?: string
  activityType?: { title: string; slug: string } | null
  signupStatus?: 'open' | 'free' | 'planning' | 'full'
  signupUrl?: string
  _untranslated?: boolean
  /** 由中文的日期文字算好的階段（譯文的日期文字可能是別的格式），見 withPhase */
  _phase?: EventPhase
}

export type EventPhase = 'current' | 'past'

// 後台的「排序用日期」不代表活動已結束（籌備中、每月定期的活動也會填過去的日期），
// 所以只有「日期顯示文字」以具體日期開頭（例：2026 · 06 · 28、2026 · 08 · 10 – 08 · 31）且排序日期已過，才算結束。
// 多天的活動，排序日期請填最後一天。
const SPECIFIC_DATE = /^\s*\d{4}\s*[·.\-/]\s*\d{1,2}\s*[·.\-/]\s*\d{1,2}/

// 以台灣時間的「今天」判斷（網站在建置時產生，後台發布會觸發重新建置）
const today = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10)

export function phaseOf(e: Pick<CmsEvent, 'dateLabel' | 'sortDate' | '_phase'>): EventPhase {
  return e._phase ?? (SPECIFIC_DATE.test(e.dateLabel) && e.sortDate < today ? 'past' : 'current')
}

/** 合併譯文之前先用中文資料算好階段 */
export const withPhase = <T extends Pick<CmsEvent, 'dateLabel' | 'sortDate'>>(e: T): T & { _phase: EventPhase } => ({ ...e, _phase: phaseOf(e) })

/** 卡片與活動頁上的狀態標籤：還沒結束看「報名狀態」；結束了看有沒有回顧 */
export type Badge = { kind: 'open' | 'free' | 'planning' | 'full' | 'recap' | 'ended'; label: string }

export function badgeOf(e: Pick<CmsEvent, 'dateLabel' | 'sortDate' | '_phase' | 'signupStatus' | 'hasRecap'>, lang: Lang = 'zh'): Badge | undefined {
  const kind: Badge['kind'] | undefined =
    phaseOf(e) === 'past' ? (e.hasRecap ? 'recap' : 'ended') : e.hasRecap ? 'recap' : e.signupStatus
  return kind ? { kind, label: t(lang, `badge.${kind}`) } : undefined
}

/** 活動頁「依狀態看活動」的按鈕：一顆可以包含好幾種標籤（「隨時加入」也算報名中） */
export const STATUS_FILTERS = [
  { key: 'status.open', kinds: ['open', 'free'] },
  { key: 'status.planning', kinds: ['planning'] },
  { key: 'status.full', kinds: ['full'] },
  { key: 'status.recap', kinds: ['recap'] },
  { key: 'status.ended', kinds: ['ended'] },
] as const satisfies readonly { key: UiKey; kinds: readonly string[] }[]

export const eventPaths = async () => (await sanity.fetch<{ slug: string }[]>(Q.events)).map((e) => ({ params: { slug: e.slug } }))

/** 依序：還沒結束的（日期近的在前）→ 已結束的（新的在前） */
export async function getEvents(lang: Lang = 'zh') {
  const all = localize((await sanity.fetch<CmsEvent[]>(Q.events)).map(withPhase), lang)
  const current = all.filter((e) => phaseOf(e) === 'current')
  const past = all.filter((e) => phaseOf(e) === 'past').reverse()
  return { list: [...current, ...past], current, past }
}
