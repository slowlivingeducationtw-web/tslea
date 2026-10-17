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
              description: '主題下方的「閱讀相關文章」會連到這個分類。',
              options: { list: CATEGORIES },
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
