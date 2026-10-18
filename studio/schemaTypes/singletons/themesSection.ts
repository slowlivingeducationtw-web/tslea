import { defineArrayMember, defineField, defineType } from 'sanity'
import { CATEGORIES } from '../shared'

// 首頁「我們怎麼一起學」：三大共學主題（01–03）＋學會活動標題（類別本身是 activityType 文件）。
// 文件 id 沿用 themesSection。
export const themesSection = defineType({
  name: 'themesSection',
  title: '慢活共學',
  type: 'document',
  description: '共學主題顯示在首頁「我們怎麼一起學」。',
  fields: [
    defineField({ name: 'title', title: '區塊標題', type: 'string', initialValue: '我們怎麼一起學' }),
    defineField({
      name: 'themes',
      title: '共學主題',
      type: 'array',
      description: '依順序編號 01、02、03。',
      validation: (r) => r.min(1).max(4),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'theme',
          fields: [
            defineField({ name: 'icon', title: '圖示', type: 'string', description: '一個 emoji，沒有照片時顯示' }),
            defineField({ name: 'title', title: '主題名稱', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'en', title: '英文名稱', type: 'string', description: '例：Body & Mind' }),
            defineField({ name: 'description', title: '說明', type: 'text', rows: 3 }),
            defineField({ name: 'image', title: '照片', type: 'photo' }),
            defineField({
              name: 'category',
              title: '對應的專欄分類',
              type: 'string',
              description: '主題頁下方的「相關文章」會列出這個分類的專欄文章。',
              options: { list: CATEGORIES },
            }),
            defineField({
              name: 'slug',
              title: '主題頁網址代稱',
              type: 'slug',
              description: '例：health → /themes/health。用英文小寫，建立後請不要再改。',
              options: { source: (_doc: any, ctx: any) => ctx.parent?.title },
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'body',
              title: '主題頁內容',
              type: 'richText',
              description: '點進主題頁看到的完整介紹：這個主題在關心什麼、學會怎麼做。可以插入照片、影片。',
            }),
            defineField({
              name: 'events',
              title: '相關活動',
              type: 'array',
              description: '挑幾個和這個主題有關的活動，會列在主題頁下方。',
              of: [defineArrayMember({ type: 'reference', to: [{ type: 'event' }], weak: true })],
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'description', icon: 'icon', media: 'image' },
            prepare: ({ title, subtitle, icon, media }) => ({ title: `${icon || '·'} ${title}`, subtitle, media }),
          },
        }),
      ],
    }),
    defineField({
      name: 'formatsTitle',
      title: '學會活動標題',
      type: 'string',
      initialValue: '學會活動',
      description: '各個類別請到「內容 → 學會活動類別」編輯。',
    }),
  ],
  preview: { prepare: () => ({ title: '慢活共學' }) },
})
