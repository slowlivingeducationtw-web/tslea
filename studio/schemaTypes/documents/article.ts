import { defineField, defineType } from 'sanity'
import { CATEGORIES, ACCENTS } from '../shared'

export const article = defineType({
  name: 'article',
  title: '專欄文章',
  type: 'document',
  groups: [
    { name: 'content', title: '內容', default: true },
    { name: 'meta', title: '分類與作者' },
    { name: 'seo', title: '搜尋與分享' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: '標題',
      type: 'string',
      group: 'content',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: '網址代稱',
      type: 'slug',
      group: 'seo',
      description:
        '決定這篇文章的網址，例如填 tea-tree-february 就會是 /column/tea-tree-february。請用英文小寫與連字號，發布後盡量不要再改（改了舊網址就會失效）。',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'excerpt',
      title: '摘要',
      type: 'text',
      rows: 3,
      group: 'content',
      description:
        '列表頁會顯示這段，Google 搜尋結果和社群分享也會用它。建議 60～120 字，寫得像邀請而不是摘錄。',
      validation: (r) => r.required().max(200),
    }),
    defineField({
      name: 'cover',
      title: '封面圖',
      type: 'figure',
      group: 'content',
    }),
    defineField({
      name: 'body',
      title: '內文',
      type: 'richText',
      group: 'content',
    }),
    defineField({
      name: 'links',
      title: '相關連結',
      type: 'array',
      of: [{ type: 'link' }],
      group: 'content',
      description: '顯示在文章最後。例：作者的 Facebook 粉專。',
    }),

    defineField({
      name: 'category',
      title: '分類',
      type: 'string',
      group: 'meta',
      description: '決定文章出現在專欄頁哪個篩選分類下。',
      options: { list: CATEGORIES, layout: 'radio' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'series',
      title: '系列名稱（選填）',
      type: 'string',
      group: 'meta',
      description: '同一個專欄系列的標記。例：慢活文字專欄｜每月一味',
    }),
    defineField({
      name: 'author',
      title: '作者',
      type: 'reference',
      to: [{ type: 'author' }],
      group: 'meta',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: '發布日期',
      type: 'date',
      group: 'meta',
      options: { dateFormat: 'YYYY-MM-DD' },
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'tags',
      title: '標籤',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'meta',
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'accent',
      title: '色調',
      type: 'string',
      group: 'meta',
      description: '決定這篇文章卡片的邊框與按鈕顏色。',
      options: { list: ACCENTS, layout: 'radio', direction: 'horizontal' },
      initialValue: 'sage',
    }),
  ],
  orderings: [
    {
      title: '發布日期（新到舊）',
      name: 'publishedDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      date: 'publishedAt',
      media: 'cover.image',
    },
    prepare({ title, author, date, media }) {
      return { title, subtitle: [date, author].filter(Boolean).join('　·　'), media }
    },
  },
})
