// 活動資料：來自後台「內容 → 活動」。一個活動一頁（/events/{slug}），
// 活動前是宣傳與報名，辦完後在同一筆補上回顧。首頁「近期活動」與 /events 共用同一份清單。
import { sanity, Q } from './sanity'

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
  videoUrl?: string
  activityType?: { title: string; slug: string } | null
  signupStatus?: 'open' | 'free' | 'planning' | 'full'
  signupUrl?: string
}

export type EventPhase = 'current' | 'past'

// 後台的「排序用日期」不代表活動已結束（籌備中、每月定期的活動也會填過去的日期），
// 所以只有「日期顯示文字」以具體日期開頭（例：2026 · 06 · 28、2026 · 08 · 10 – 08 · 31）且排序日期已過，才算結束。
// 多天的活動，排序日期請填最後一天。
const SPECIFIC_DATE = /^\s*\d{4}\s*[·.\-/]\s*\d{1,2}\s*[·.\-/]\s*\d{1,2}/

// 以台灣時間的「今天」判斷（網站在建置時產生，後台發布會觸發重新建置）
const today = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10)

export function phaseOf(e: Pick<CmsEvent, 'dateLabel' | 'sortDate'>): EventPhase {
  return SPECIFIC_DATE.test(e.dateLabel) && e.sortDate < today ? 'past' : 'current'
}

/** 卡片與活動頁上的狀態標籤：還沒結束看「報名狀態」；結束了看有沒有回顧 */
export type Badge = { kind: 'open' | 'free' | 'planning' | 'full' | 'recap' | 'ended'; label: string }
const SIGNUP_LABEL = { open: '開放報名中', free: '隨時加入', planning: '籌備中', full: '已額滿' } as const

export function badgeOf(e: Pick<CmsEvent, 'dateLabel' | 'sortDate' | 'signupStatus' | 'hasRecap'>): Badge | undefined {
  if (phaseOf(e) === 'past') return e.hasRecap ? { kind: 'recap', label: '活動回顧' } : { kind: 'ended', label: '已結束' }
  if (e.hasRecap) return { kind: 'recap', label: '活動回顧' }
  return e.signupStatus ? { kind: e.signupStatus, label: SIGNUP_LABEL[e.signupStatus] } : undefined
}

/** 依序：還沒結束的（日期近的在前）→ 已結束的（新的在前） */
export async function getEvents() {
  const all = await sanity.fetch<CmsEvent[]>(Q.events)
  const current = all.filter((e) => phaseOf(e) === 'current')
  const past = all.filter((e) => phaseOf(e) === 'past').reverse()
  return { list: [...current, ...past], current, past }
}
