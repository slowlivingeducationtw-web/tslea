// 介面上固定的小字（按鈕、麵包屑、無障礙標籤…）。內容文字在後台，不放這裡。
// 每種語言的鍵要一樣多（npm test 會檢查）。加新語言：在 UI 加一份、src/lib/i18n.ts 的 LANGS 加一行。
import type { Lang } from './i18n'

const zh = {
  'org.name': '臺灣慢活教育學會',
  'org.logoAlt': '臺灣慢活教育學會 Slow Living Education Society of Taiwan',
  'org.description': '臺灣慢活教育學會以「身心健康」「藝術陪伴」「生態永續」三大共學主題，推廣慢活教育與終身學習。',
  'org.country': '臺灣',
  'title.suffix': '｜臺灣慢活教育學會',
  'a11y.home': '臺灣慢活教育學會 首頁',
  'a11y.mainNav': '主要導覽',
  'a11y.subMenu': ' 子選單',
  'a11y.openMenu': '開啟選單',
  'a11y.closeMenu': '關閉選單',
  'a11y.newWindow': '（另開新視窗）',
  'a11y.newWindowFor': '（{title}，另開新視窗）',
  'lang.label': '語言 Language',
  'untranslated.note': 'English translation in progress — the original Chinese is shown below.',
  'untranslated.chip': 'Translation in progress',
  'footer.facebook': 'Facebook 粉絲專頁',
  'footer.registrationNo': '立案字號：',
  'footer.taxId': '統一編號：',
  'card.readMore': '閱讀全文',
  'card.readRecap': '閱讀回顧',
  'card.seeEvent': '看活動內容',
  'card.video': '▶ 影片',
  'card.signup': '我要報名',
  'side.more': '看全部',
  'photo.placeholder': '照片待補',
  'pt.zoom': '放大圖片',
  'pt.video': '影片',
  'pt.close': '關閉 ✕',
  'hero.label': '學會主視覺',
  'hero.slide': '第 {n} 頁，共 {total} 頁',
  'hero.prev': '上一頁',
  'hero.next': '下一頁',
  'hero.dots': '選擇頁面',
  'hero.show': '顯示第 {n} 頁',
  'hero.videoTitle': '背景影片',
  'badge.open': '開放報名中',
  'badge.free': '隨時加入',
  'badge.planning': '籌備中',
  'badge.full': '已額滿',
  'badge.recap': '活動回顧',
  'badge.ended': '已結束',
  'status.open': '報名中',
  'status.planning': '即將開放報名',
  'status.full': '已額滿',
  'status.recap': '活動回顧',
  'status.ended': '已結束',
}

export type UiKey = keyof typeof zh

const en: Record<UiKey, string> = {
  'org.name': 'Slow Living Education Society of Taiwan',
  'org.logoAlt': 'Slow Living Education Society of Taiwan 臺灣慢活教育學會',
  'org.description': 'The Slow Living Education Society of Taiwan promotes slow living education and lifelong learning through three themes: body & mind, art & companionship, and ecology & sustainability.',
  'org.country': 'Taiwan',
  'title.suffix': ' | Slow Living Education Society of Taiwan',
  'a11y.home': 'Slow Living Education Society of Taiwan — Home',
  'a11y.mainNav': 'Main navigation',
  'a11y.subMenu': ' submenu',
  'a11y.openMenu': 'Open menu',
  'a11y.closeMenu': 'Close menu',
  'a11y.newWindow': ' (opens in a new window)',
  'a11y.newWindowFor': ' ({title}, opens in a new window)',
  'lang.label': 'Language 語言',
  'untranslated.note': 'English translation in progress — the original Chinese is shown below.',
  'untranslated.chip': 'Translation in progress',
  'footer.facebook': 'Facebook Page',
  'footer.registrationNo': 'Registration No.: ',
  'footer.taxId': 'Tax ID: ',
  'card.readMore': 'Read more',
  'card.readRecap': 'Read the recap',
  'card.seeEvent': 'See details',
  'card.video': '▶ Video',
  'card.signup': 'Sign up',
  'side.more': 'See all',
  'photo.placeholder': 'Photo coming soon',
  'pt.zoom': 'Enlarge image',
  'pt.video': 'Video',
  'pt.close': 'Close ✕',
  'hero.label': 'Featured',
  'hero.slide': 'Slide {n} of {total}',
  'hero.prev': 'Previous slide',
  'hero.next': 'Next slide',
  'hero.dots': 'Choose a slide',
  'hero.show': 'Show slide {n}',
  'hero.videoTitle': 'Background video',
  'badge.open': 'Registration open',
  'badge.free': 'Join anytime',
  'badge.planning': 'Coming soon',
  'badge.full': 'Fully booked',
  'badge.recap': 'Event recap',
  'badge.ended': 'Ended',
  'status.open': 'Open for registration',
  'status.planning': 'Opening soon',
  'status.full': 'Fully booked',
  'status.recap': 'Event recaps',
  'status.ended': 'Ended',
}

export const UI: Record<Lang, Record<UiKey, string>> = { zh, en }

/** 取介面文字；{name} 會換成 vars 裡的值 */
export function t(lang: Lang, key: UiKey, vars?: Record<string, string | number>): string {
  const s = UI[lang][key] ?? UI.zh[key]
  return vars ? s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? '')) : s
}

// 專欄分類的英文（值與 column.ts 的 CATEGORIES 一致；中文名照用 CATEGORIES 的 label）
const CAT_EN: Record<string, string> = {
  health: 'Body & Mind',
  art: 'Art & Companionship',
  eco: 'Ecology & Sustainability',
  travel: 'Slow Travel Learning',
  words: 'Slow Living Notes',
  other: 'Other',
  recap: 'Event Recaps',
}
const CAT_ZH: Record<string, string> = {
  health: '身心健康', art: '藝術陪伴', eco: '生態永續', travel: '慢旅共學', words: '慢活小語', other: '其他', recap: '活動回顧',
}

export function catLabel(value: string | undefined, lang: Lang): string {
  const v = value && CAT_ZH[value] ? value : 'other'
  return lang === 'en' ? CAT_EN[v] : CAT_ZH[v]
}

// 專欄系列的英文（值與 studio/schemaTypes/shared.ts 的 SERIES 一致）
const SERIES_EN: Record<string, { full: string; short: string }> = {
  '慢活文字專欄｜每月一字': { full: 'Slow Living in Words | A Character a Month', short: 'A Character a Month' },
  '慢活文字專欄｜每月一味': { full: 'Slow Living in Words | A Scent a Month', short: 'A Scent a Month' },
  '慢活文字專欄｜每月一遊': { full: 'Slow Living in Words | A Journey a Month', short: 'A Journey a Month' },
  慢活小語: { full: 'Slow Living Notes', short: 'Slow Living Notes' },
}

/** 系列名稱：short 為按鈕上的短名（中文是「｜」後面那段） */
export function seriesName(series: string | undefined, lang: Lang, short = false): string {
  if (!series) return ''
  if (lang === 'en' && SERIES_EN[series]) return SERIES_EN[series][short ? 'short' : 'full']
  return short ? series.split(/[｜|]/).pop()!.trim() : series
}
