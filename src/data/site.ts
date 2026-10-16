// 全站共用的導覽與聯絡資訊。頁首、頁尾、加入我們頁都從這裡取，避免各處寫法不一致。
// 聯絡資訊只放已確認的資料（與後台「網站設定」、聯絡我們頁一致）。

export const CONTACT = {
  email: 'slowlivingeducation@gmail.com',
  address: '苗栗縣苗栗市建台街一巷13號',
  facebook:
    'https://www.facebook.com/p/%E8%87%BA%E7%81%A3%E6%85%A2%E6%B4%BB%E6%95%99%E8%82%B2%E5%AD%B8%E6%9C%83-61581637359240/',
}

// 順序即閱讀順序：先認識學會，再看共學內容、活動與文章。「加入我們」是頁首右側的按鈕。
// children 是滑鼠移到主選單時展開的子選單；手機版直接列在主項目下方。
export type NavItem = { href: string; label: string; children?: { href: string; label: string }[] }

export const MAIN_NAV: NavItem[] = [
  {
    href: '/about',
    label: '認識學會',
    children: [
      { href: '/about', label: '學會簡介' },
      { href: '/board', label: '理監事名單' },
      { href: '/plans', label: '年度計畫' },
      { href: '/donate', label: '捐款支持' },
      { href: '/contact', label: '聯絡我們' },
    ],
  },
  {
    href: '/#learning',
    label: '慢活共學',
    children: [
      { href: '/#learning', label: '三大共學主題' },
      { href: '/#formats', label: '活動與共學形式' },
    ],
  },
  {
    href: '/events',
    label: '活動',
  },
  {
    href: '/column',
    label: '慢活專欄',
    children: [
      { href: '/column', label: '全部文章' },
      { href: '/column?cat=health', label: '身心健康' },
      { href: '/column?cat=art', label: '藝術陪伴' },
      { href: '/column?cat=eco', label: '生態永續' },
      { href: '/column?cat=travel', label: '慢旅共學' },
    ],
  },
  {
    href: '/partner',
    label: '與我們合作',
    children: [
      { href: '/donate', label: '個人捐款' },
      { href: '/partner#business', label: '企業合作' },
      { href: '/partner#school', label: '合作學校' },
      { href: '/partner#talk', label: '課程演講邀約' },
    ],
  },
]

// 頁尾分三組（參考 TFT）：參與方式／了解更多／聯絡資訊另列
export const FOOTER_GROUPS = [
  {
    title: '一起慢活',
    links: [
      { href: '/join', label: '加入我們' },
      { href: '/partner', label: '與我們合作' },
      { href: '/donate', label: '捐款支持' },
    ],
  },
  {
    title: '了解更多',
    links: [
      { href: '/about', label: '認識學會' },
      { href: '/board', label: '理監事名單' },
      { href: '/plans', label: '年度計畫' },
      { href: '/events', label: '活動' },
      { href: '/column', label: '慢活專欄' },
    ],
  },
]

/** 預先帶好主旨的 Email 連結，讓來信容易分類 */
export const mailto = (subject: string) =>
  `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}`
