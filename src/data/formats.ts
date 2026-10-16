// 活動與共學形式：介紹「學會用哪些方式一起學」，不列個別活動。
// 個別活動（日期、籌備進度）一律寫在後台「活動資訊」，顯示在 /events，避免兩處重複。
// 只列已實際進行或已公告的形式；年度計畫裡尚未開辦的（線上工作坊、SEL 校園講座等）開辦後再加入。

export type LearningFormat = {
  icon: string
  title: string
  description: string
}

export const FORMATS: LearningFormat[] = [
  {
    icon: '🎙️',
    title: '共學講座',
    description: '由會員輪流擔任講者，分享自己的慢活實踐，留下影音紀錄讓大家隨時回顧。',
  },
  {
    icon: '🎬',
    title: '論壇與放映座談',
    description: '透過論壇、紀錄片放映與映後座談，邀請不同世代坐在一起對話與傾聽。',
  },
  {
    icon: '🚂',
    title: '慢旅共學',
    description: '以旅行作為學習方式，走入在地的生態、文化與人情，體驗慢活最真實的樣子。',
  },
  {
    icon: '✍️',
    title: '文字共學',
    description: '會員以文字分享慢活的日常智慧，刊載於慢活專欄，每一篇都是一次共學。',
  },
]
