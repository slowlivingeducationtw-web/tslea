// 活動資料：來自後台「活動資訊」，首頁「近期活動」與 /events 共用同一份清單。
import { sanity, Q } from './sanity'

export type CmsEvent = {
  title: string
  dateLabel: string
  sortDate: string
  icon?: string
  description?: string
  tag?: string
}

export type EventPhase = 'current' | 'past'

// 後台的「排序用日期」不代表活動已結束（籌備中、每月定期的活動也會填過去的日期），
// 所以只有「日期顯示文字」是具體日期（例：2026 · 06 · 28）且已過，才算已辦理。
const SPECIFIC_DATE = /^\s*\d{4}\s*[·.\-/]\s*\d{1,2}\s*[·.\-/]\s*\d{1,2}\s*$/

// 以台灣時間的「今天」判斷（網站在建置時產生，後台發布會觸發重新建置）
const today = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10)

export function phaseOf(e: CmsEvent): EventPhase {
  return SPECIFIC_DATE.test(e.dateLabel) && e.sortDate < today ? 'past' : 'current'
}

export const PHASE_LABEL: Record<EventPhase, string> = {
  current: '即將舉行／持續進行',
  past: '已辦理',
}

export async function getEvents() {
  const all = await sanity.fetch<CmsEvent[]>(Q.events)
  const current = all.filter((e) => phaseOf(e) === 'current')
  // 已辦理的活動新的在前
  const past = all.filter((e) => phaseOf(e) === 'past').reverse()
  return { current, past }
}
