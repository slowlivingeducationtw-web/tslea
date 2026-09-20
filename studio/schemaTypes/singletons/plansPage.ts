import { defineField, defineType } from 'sanity'
import { PLAN_TRACKS } from '../shared'

export const plansPage = defineType({
  name: 'plansPage',
  title: '年度計畫（頁面文字）',
  type: 'document',
  description: '這裡管的是頁面上方的說明文字。各項計畫請到「年度計畫項目」新增。',
  fields: [
    defineField({ name: 'label', title: '英文小標', type: 'string', initialValue: 'Annual Plans' }),
    defineField({ name: 'title', title: '頁面標題', type: 'string', initialValue: '年度計畫' }),
    defineField({ name: 'intro', title: '頁面引言', type: 'text', rows: 3 }),
    defineField({
      name: 'tracks',
      title: '各主軸的導語',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'trackIntro',
          fields: [
            defineField({
              name: 'track',
              title: '主軸',
              type: 'string',
              options: { list: PLAN_TRACKS, layout: 'radio', direction: 'horizontal' },
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'body',
              title: '導語',
              type: 'richText',
              description: '顯示在該主軸項目清單的左側。需要強調的字詞用「重點標示」。',
            }),
          ],
          preview: {
            select: { track: 'track' },
            prepare: ({ track }) => ({
              title: PLAN_TRACKS.find((x) => x.value === track)?.title || '（未選主軸）',
            }),
          },
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: '年度計畫（頁面文字）' }) },
})
