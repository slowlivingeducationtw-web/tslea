import { defineArrayMember, defineType } from 'sanity'

// 文章內文用的富文本。刻意不開放標題以外的排版控制，
// 讓同事專心寫內容，版面由網站樣式決定。
export const richText = defineType({
  name: 'richText',
  title: '內文',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: '內文', value: 'normal' },
        { title: '小標題', value: 'h3' },
        { title: '次小標', value: 'h4' },
        { title: '引言', value: 'blockquote' },
        { title: '註解小字', value: 'note' },
      ],
      lists: [
        { title: '項目符號', value: 'bullet' },
        { title: '編號', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: '粗體', value: 'strong' },
          { title: '斜體', value: 'em' },
          { title: '重點標示', value: 'highlight' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: '連結',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: '網址',
                validation: (r: any) =>
                  r.required().uri({ scheme: ['http', 'https', 'mailto', 'tel'] }),
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({ type: 'verse' }),
    defineArrayMember({ type: 'figure' }),
    defineArrayMember({ type: 'imageRow' }),
  ],
})
