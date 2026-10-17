import { defineField, defineType } from 'sanity'

// 學會活動類別（例：身呼吸、慢活日）。是活動與活動回顧的分類標籤，
// 也顯示在首頁「我們怎麼一起學」與「活動」頁最上方。
export const activityType = defineType({
  name: 'activityType',
  title: '學會活動類別',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: '名稱', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'image',
      title: '圖示圖片',
      type: 'image',
      description: '正方形、透明背景的 PNG 最好看（約 300 × 300 以上）。沒放圖片時顯示下面的 emoji。',
    }),
    defineField({ name: 'icon', title: '圖示（emoji，沒有圖片時用）', type: 'string' }),
    defineField({ name: 'description', title: '說明', type: 'text', rows: 4 }),
    defineField({
      name: 'order',
      title: '排列順序',
      type: 'number',
      description: '數字小的排前面。',
      initialValue: 100,
    }),
    defineField({
      name: 'slug',
      title: '網址代稱',
      type: 'slug',
      description: '活動頁篩選用的英文名稱，例：slow-day → /events?type=slow-day。建立後請不要再改。',
      options: { source: 'title', maxLength: 40 },
      validation: (r) => r.required(),
    }),
  ],
  orderings: [{ title: '排列順序', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', subtitle: 'description', media: 'image', icon: 'icon' },
    prepare: ({ title, subtitle, media, icon }) => ({ title: media ? title : `${icon || '·'} ${title}`, subtitle, media }),
  },
})
