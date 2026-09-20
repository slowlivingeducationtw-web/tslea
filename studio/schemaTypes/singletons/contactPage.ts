import { defineField, defineType } from 'sanity'

export const contactPage = defineType({
  name: 'contactPage',
  title: '聯絡我們',
  type: 'document',
  fields: [
    defineField({ name: 'label', title: '英文小標', type: 'string', initialValue: 'Contact' }),
    defineField({ name: 'title', title: '頁面標題', type: 'string', initialValue: '聯絡我們' }),
    defineField({ name: 'subtitle', title: '副標', type: 'string' }),
    defineField({
      name: 'cards',
      title: '聯絡資訊卡片',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'card',
          fields: [
            defineField({ name: 'icon', title: '圖示', type: 'string', description: '一個 emoji' }),
            defineField({ name: 'title', title: '標題', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'body', title: '內容', type: 'text', rows: 2 }),
            defineField({ name: 'link', title: '連結（選填）', type: 'link' }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'body', icon: 'icon' },
            prepare: ({ title, subtitle, icon }) => ({ title: `${icon || '·'} ${title}`, subtitle }),
          },
        },
      ],
    }),
    defineField({
      name: 'notes',
      title: '說明項目',
      type: 'array',
      of: [{ type: 'string' }],
      description: '每一行會以 ✦ 開頭顯示。',
    }),
  ],
  preview: { prepare: () => ({ title: '聯絡我們' }) },
})
