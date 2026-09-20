import { defineField, defineType } from 'sanity'

export const homePage = defineType({
  name: 'homePage',
  title: '首頁',
  type: 'document',
  groups: [
    { name: 'hero', title: '首屏', default: true },
    { name: 'about', title: '關於學會' },
    { name: 'events', title: '活動區塊' },
  ],
  fields: [
    defineField({
      name: 'eyebrow',
      title: '主標上方小字',
      type: 'string',
      group: 'hero',
      initialValue: 'Est. 2026 · 臺灣',
    }),
    defineField({
      name: 'headlineBefore',
      title: '主標（前段）',
      type: 'string',
      group: 'hero',
      description: '例：在學習中找到',
    }),
    defineField({
      name: 'headlineAccent',
      title: '主標（強調字）',
      type: 'string',
      group: 'hero',
      description: '這幾個字會用沙綠色顯示。例：慢活',
    }),
    defineField({
      name: 'headlineAfter',
      title: '主標（後段）',
      type: 'string',
      group: 'hero',
      description: '例：的節奏與喜悅',
    }),
    defineField({
      name: 'subheadEn',
      title: '英文副標',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'lead',
      title: '引言',
      type: 'text',
      rows: 4,
      group: 'hero',
      description: '主標下方那段話。換行會保留。',
    }),
    defineField({
      name: 'heroTags',
      title: '主題標籤',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      group: 'hero',
      description: '例：身心健康、藝術陪伴、生態永續',
    }),

    defineField({ name: 'aboutLabel', title: '英文小標', type: 'string', group: 'about', initialValue: 'About Us' }),
    defineField({ name: 'aboutTitle', title: '區塊標題', type: 'string', group: 'about', initialValue: '關於學會' }),
    defineField({
      name: 'aboutBody',
      title: '內文',
      type: 'richText',
      group: 'about',
      description: '需要強調的字詞可以用「重點標示」，會以沙綠色呈現。',
    }),

    defineField({ name: 'eventsLabel', title: '英文小標', type: 'string', group: 'events', initialValue: 'Events' }),
    defineField({ name: 'eventsTitle', title: '區塊標題', type: 'string', group: 'events', initialValue: '活動資訊' }),
  ],
  preview: { prepare: () => ({ title: '首頁' }) },
})
