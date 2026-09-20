import { defineField, defineType } from 'sanity'

export const imageRow = defineType({
  name: 'imageRow',
  title: '並排圖片',
  type: 'object',
  description: '兩到三張圖片並排成一列。手機上會自動改為直向堆疊。',
  fields: [
    defineField({
      name: 'images',
      title: '圖片',
      type: 'array',
      of: [{ type: 'figure' }],
      validation: (r) => r.required().min(2).max(3),
    }),
    defineField({
      name: 'caption',
      title: '整列的圖說（選填）',
      type: 'string',
    }),
  ],
  preview: {
    select: { images: 'images', caption: 'caption' },
    prepare({ images, caption }) {
      return {
        title: `並排圖片（${images?.length || 0} 張）`,
        subtitle: caption,
        media: images?.[0]?.image,
      }
    },
  },
})
