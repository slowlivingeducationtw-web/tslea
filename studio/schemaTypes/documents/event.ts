import { defineField, defineType } from 'sanity'

// 活動：一筆一頁（/events/{網址代稱}）。
// 「活動介紹／報名」與「活動回顧」各自一筆，用「對應的介紹／回顧」互相連結，頁面上會互相顯示連結。
const SIGNUP = [
  { title: '開放報名中（醒目的陶土色，會顯示報名按鈕）', value: 'open' },
  { title: '隨時加入（不用報名，例：每月講座、長期徵稿）', value: 'free' },
  { title: '籌備中（先預告）', value: 'planning' },
  { title: '已額滿', value: 'full' },
]

export const event = defineType({
  name: 'event',
  title: '活動',
  type: 'document',
  groups: [
    { name: 'basic', title: '基本資訊', default: true },
    { name: 'intro', title: '活動介紹' },
    { name: 'recap', title: '活動回顧（辦完後填）' },
  ],
  fields: [
    defineField({ name: 'title', title: '活動名稱', type: 'string', group: 'basic', validation: (r) => r.required() }),
    defineField({
      name: 'activityType',
      title: '活動類別',
      type: 'reference',
      to: [{ type: 'activityType' }],
      weak: true,
      group: 'basic',
      description: '屬於哪一類學會活動（例：慢活日）。活動頁可以依類別篩選。',
    }),
    defineField({
      name: 'dateLabel',
      title: '日期顯示文字',
      type: 'string',
      group: 'basic',
      description: '網站上實際顯示的文字。例：2026 · 12 · 14、2026 · 08 · 10 – 08 · 31（每週一）、每月定期。以「年 · 月 · 日」開頭的活動，排序日期過了會自動改標「已結束」。',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'sortDate',
      title: '排序用日期',
      type: 'date',
      group: 'basic',
      description: '不會顯示在網站上，用來排列先後、判斷是否已結束。多天的活動填最後一天；籌備中的活動填預計日期。',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'place', title: '地點（選填）', type: 'string', group: 'basic' }),
    defineField({
      name: 'signupStatus',
      title: '報名狀態',
      type: 'string',
      group: 'basic',
      description: '顯示在活動卡片最上方。活動日期過了之後就不再顯示。',
      options: { list: SIGNUP, layout: 'radio' },
    }),
    defineField({
      name: 'signupUrl',
      title: '報名連結',
      type: 'url',
      group: 'basic',
      description: '報名表單的網址（例：Google 表單）。報名狀態是「開放報名中」時，會出現「我要報名」按鈕。',
      hidden: ({ document }) => document?.signupStatus !== 'open',
      validation: (r) => r.uri({ scheme: ['https', 'http'] }),
    }),
    defineField({
      name: 'slug',
      title: '網址代稱',
      type: 'slug',
      group: 'basic',
      description: '這個活動頁面的網址，例：填 slow-day-2026 就是 /events/slow-day-2026。用英文小寫與連字號，發布後盡量不要改。',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'description',
      title: '一句話介紹',
      type: 'text',
      rows: 3,
      group: 'intro',
      description: '顯示在活動卡片上，也是分享到 LINE、Facebook 時的說明。',
    }),
    defineField({
      name: 'cover',
      title: '海報或活動照片',
      type: 'figure',
      group: 'intro',
      description: '卡片和活動頁最上方的大圖。上傳有人物的照片前，請確認當事人同意公開，學生與未成年人尤其要取得同意。',
    }),
    defineField({
      name: 'icon',
      title: '圖示（沒有照片時用）',
      type: 'string',
      group: 'intro',
      description: '一個 emoji。例：🎭 🚂 🎙️',
      validation: (r) => r.max(4),
    }),
    defineField({
      name: 'intro',
      title: '活動介紹',
      type: 'richText',
      group: 'intro',
      description: '活動頁的完整介紹：內容、對象、時間流程、費用、注意事項等。',
    }),

    defineField({
      name: 'pair',
      title: '對應的活動介紹／回顧',
      type: 'reference',
      to: [{ type: 'event' }],
      weak: true,
      group: 'recap',
      description: '回顧文請選它的活動介紹（報名）那一筆，反過來也可以；只要在其中一筆設定，兩頁都會出現互相的連結。',
    }),
    defineField({
      name: 'video',
      title: '活動影片',
      type: 'videoEmbed',
      group: 'recap',
      description: '活動紀錄影片，會放在活動頁最上方。有影片的活動，卡片會標成「活動回顧」。',
    }),
    defineField({
      name: 'recap',
      title: '活動回顧',
      type: 'richText',
      group: 'recap',
      description: '活動辦完後寫在這裡，可以插入照片。填了之後，卡片會改標「活動回顧」。',
    }),
    defineField({
      name: 'recapAuthor',
      title: '回顧撰文（選填）',
      type: 'reference',
      to: [{ type: 'author' }],
      weak: true,
      group: 'recap',
    }),
    defineField({
      name: 'links',
      title: '相關連結',
      type: 'array',
      of: [{ type: 'link' }],
      group: 'recap',
      description: '顯示在活動頁最後。例：Facebook 貼文、影片紀錄。',
    }),

    // 舊欄位：只在有舊資料時顯示
    defineField({
      name: 'tag',
      title: '舊分類標籤',
      type: 'string',
      group: 'basic',
      hidden: ({ value }) => !value,
      description: '舊版的自由文字標籤。沒有選「活動類別」時才會顯示在卡片上，請改用上面的活動類別。',
    }),
    defineField({ name: 'showInMarquee', type: 'boolean', hidden: true }),
    defineField({ name: 'showAsCard', type: 'boolean', hidden: true }),
  ],
  orderings: [
    { title: '日期（新到舊）', name: 'dateDesc', by: [{ field: 'sortDate', direction: 'desc' }] },
    { title: '日期（舊到新）', name: 'dateAsc', by: [{ field: 'sortDate', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', dateLabel: 'dateLabel', icon: 'icon', type: 'activityType.title', status: 'signupStatus', recap: 'recap', video: 'video.url', media: 'cover.image' },
    prepare({ title, dateLabel, icon, type, status, recap, video, media }) {
      const S: Record<string, string> = { open: '開放報名中', free: '隨時加入', planning: '籌備中', full: '已額滿' }
      const badge = recap?.length || video ? '有回顧' : S[status]
      return { title: media ? title : `${icon || '·'} ${title}`, subtitle: [badge, dateLabel, type].filter(Boolean).join('　·　'), media }
    },
  },
})
