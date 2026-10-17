import { defineArrayMember, defineType } from 'sanity'
import { HREF_HELP, hrefValidation } from './navLink'

// 頁面上的短段落（例如卡片下方的補充說明）。只有粗體與連結，
// 連結可以填站內路徑（/contact），這點和文章內文的「內文」不同。
export const simpleText = defineType({
  name: 'simpleText',
  title: '短段落',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{ title: '內文', value: 'normal' }],
      lists: [],
      marks: {
        decorators: [{ title: '粗體', value: 'strong' }],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: '連結',
            fields: [{ name: 'href', type: 'string', title: '連到哪裡', description: HREF_HELP, validation: hrefValidation }],
          },
        ],
      },
    }),
  ],
})
