import { defineField, defineType } from 'sanity'
import { PLAN_TRACKS } from '../shared'

export const planItem = defineType({
  name: 'planItem',
  title: '年度計畫項目',
  type: 'document',
  fields: [
    defineField({
      name: 'track',
      title: '所屬主軸',
      type: 'string',
      options: { list: PLAN_TRACKS, layout: 'radio' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'icon',
      title: '圖示',
      type: 'string',
      description: '一個 emoji。例：🏛️ 📋 🤝 📣',
      validation: (r) => r.max(4),
    }),
    defineField({
      name: 'title',
      title: '項目名稱',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'description',
      title: '說明',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'year',
      title: '年度',
      type: 'string',
      description: '民國年。例：115、116。可以填多個年度共用的計畫，例：115-116',
      initialValue: '115-116',
    }),
    defineField({
      name: 'order',
      title: '排序',
      type: 'number',
      description: '數字小的排前面。同一主軸內有效。',
      initialValue: 10,
    }),
  ],
  orderings: [
    { title: '主軸與排序', name: 'trackOrder', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', icon: 'icon', track: 'track', year: 'year' },
    prepare({ title, icon, track, year }) {
      const t = PLAN_TRACKS.find((x) => x.value === track)?.title || ''
      return { title: `${icon || '·'} ${title}`, subtitle: `${t}　·　${year}` }
    },
  },
})
