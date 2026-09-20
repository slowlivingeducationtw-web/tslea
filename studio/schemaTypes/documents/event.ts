import { defineField, defineType } from 'sanity'

export const event = defineType({
  name: 'event',
  title: '活動資訊',
  type: 'document',
  description: '同一筆資料可以同時出現在首頁的跑馬燈和活動卡片，用下方兩個開關控制。',
  fields: [
    defineField({
      name: 'title',
      title: '活動名稱',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'dateLabel',
      title: '日期顯示文字',
      type: 'string',
      description:
        '網站上實際顯示的文字，可以不是標準日期。例：2026 · 06 · 28、2026 · Q3（籌備中）、每月定期',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'sortDate',
      title: '排序用日期',
      type: 'date',
      description: '不會顯示在網站上，只用來決定活動的先後順序。籌備中的活動請填預計日期。',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'icon',
      title: '圖示',
      type: 'string',
      description: '一個 emoji。例：🎭 🚂 🎙️ 🏫',
      validation: (r) => r.max(4),
    }),
    defineField({
      name: 'description',
      title: '說明',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'tag',
      title: '分類標籤',
      type: 'string',
      description: '顯示在卡片下方。例：藝術陪伴、慢旅共學、共學活動',
    }),
    defineField({
      name: 'showInMarquee',
      title: '顯示在跑馬燈',
      type: 'boolean',
      description: '首頁活動區塊上方那一條橫向捲動的文字。',
      initialValue: true,
    }),
    defineField({
      name: 'showAsCard',
      title: '顯示為活動卡片',
      type: 'boolean',
      description: '首頁的活動卡片。',
      initialValue: true,
    }),
  ],
  orderings: [
    { title: '日期（近到遠）', name: 'dateAsc', by: [{ field: 'sortDate', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', dateLabel: 'dateLabel', icon: 'icon', tag: 'tag' },
    prepare({ title, dateLabel, icon, tag }) {
      return { title: `${icon || '·'} ${title}`, subtitle: [dateLabel, tag].filter(Boolean).join('　·　') }
    },
  },
})
