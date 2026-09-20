import { defineField, defineType } from 'sanity'
import { ACCENTS } from '../shared'

export const author = defineType({
  name: 'author',
  title: '作者',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: '姓名',
      type: 'string',
      description: '含稱呼。例：郭純嵐（小嵐老師）',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'title',
      title: '稱銜',
      type: 'string',
      description: '顯示在姓名後面。例：臺灣慢活教育學會創會會員',
    }),
    defineField({
      name: 'initial',
      title: '頭像字',
      type: 'string',
      description: '顯示在圓形色塊裡的一個字。留空的話自動取姓名第一個字。',
      validation: (r) => r.max(1),
    }),
    defineField({
      name: 'accent',
      title: '代表色',
      type: 'string',
      options: { list: ACCENTS, layout: 'radio', direction: 'horizontal' },
      initialValue: 'sage',
    }),
    defineField({
      name: 'bio',
      title: '簡介（選填）',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'title' },
  },
})
