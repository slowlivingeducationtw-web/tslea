import { defineField, defineType } from 'sanity'

export const verse = defineType({
  name: 'verse',
  title: '詩體段落',
  type: 'object',
  description: '會完整保留你按下的每一個換行，適合詩、短句、分行的文字。一般散文請用普通段落。',
  fields: [
    defineField({
      name: 'text',
      title: '內容',
      type: 'text',
      rows: 12,
      description: '換行會原樣呈現在網站上。空一行就是段落之間的間隔。',
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { text: 'text' },
    prepare({ text }) {
      return { title: '詩體段落', subtitle: (text || '').split('\n')[0] }
    },
  },
})
