import { defineField, defineType } from 'sanity'

export const figure = defineType({
  name: 'figure',
  title: '插圖',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: '圖片',
      type: 'image',
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'alt',
      title: '圖片說明文字（替代文字）',
      type: 'string',
      description:
        '描述圖片內容，給看不見圖片的人（螢幕閱讀器、圖片載入失敗時）閱讀，Google 也會讀。例：木字部件卡－書寫',
      validation: (r) => r.required().warning('沒有替代文字會影響無障礙與搜尋排名'),
    }),
    defineField({
      name: 'caption',
      title: '圖說（選填）',
      type: 'string',
      description: '顯示在圖片下方的小字。例：圖像引用自《漢字好好教 好好教漢字》部件卡',
    }),
  ],
  preview: {
    select: { media: 'image', title: 'alt', subtitle: 'caption' },
  },
})
