import { defineField, defineType } from 'sanity'

export const link = defineType({
  name: 'link',
  title: '相關連結',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: '顯示文字',
      type: 'string',
      description: '讀者看到的文字。例：📘 facebook 粉專：三義茅鄉炭坊',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'url',
      title: '網址',
      type: 'url',
      validation: (r) => r.required().uri({ scheme: ['http', 'https', 'mailto'] }),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'url' },
  },
})
