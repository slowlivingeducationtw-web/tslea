import { defineField, defineType } from 'sanity'
import { ACCENTS } from '../shared'

export const themesSection = defineType({
  name: 'themesSection',
  title: '三大共學主題',
  type: 'document',
  description: '顯示在首頁，導覽列的「三大共學主題」會連到這一區。',
  fields: [
    defineField({ name: 'label', title: '英文小標', type: 'string', initialValue: 'Our Themes' }),
    defineField({ name: 'title', title: '區塊標題', type: 'string', initialValue: '三大共學主題' }),
    defineField({ name: 'intro', title: '引言（選填）', type: 'text', rows: 3 }),
    defineField({
      name: 'themes',
      title: '主題',
      type: 'array',
      validation: (r) => r.min(1).max(4),
      of: [
        {
          type: 'object',
          name: 'theme',
          fields: [
            defineField({ name: 'icon', title: '圖示', type: 'string', description: '一個 emoji' }),
            defineField({ name: 'title', title: '主題名稱', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'description', title: '說明', type: 'text', rows: 3 }),
            defineField({
              name: 'accent',
              title: '色調',
              type: 'string',
              options: { list: ACCENTS, layout: 'radio', direction: 'horizontal' },
              initialValue: 'sage',
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'description', icon: 'icon' },
            prepare: ({ title, subtitle, icon }) => ({ title: `${icon || '·'} ${title}`, subtitle }),
          },
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: '三大共學主題' }) },
})
