import { defineField } from 'sanity'

// 各頁共用的開頭欄位：頁面大標、引言、搜尋結果說明。
export const pageHeadFields = (group?: string) => [
  defineField({ name: 'title', title: '頁面大標', type: 'string', group, validation: (r) => r.required() }),
  defineField({ name: 'lead', title: '引言', type: 'text', rows: 3, group, description: '大標下方的一段話。' }),
  defineField({
    name: 'seoDescription',
    title: '搜尋結果說明',
    type: 'text',
    rows: 2,
    group,
    description: 'Google 搜尋結果、LINE／Facebook 分享時顯示的介紹，約 50～120 字。',
    validation: (r) => r.max(160),
  }),
]
