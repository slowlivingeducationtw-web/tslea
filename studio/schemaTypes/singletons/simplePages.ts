import { defineArrayMember, defineField, defineType } from 'sanity'
import { HREF_HELP, hrefValidation } from '../objects/navLink'
import { pageHeadFields } from './pageHead'

export const aboutPage = defineType({
  name: 'aboutPage',
  title: '認識學會',
  type: 'document',
  fields: [
    ...pageHeadFields(),
    defineField({
      name: 'body',
      title: '學會簡介',
      type: 'richText',
      description: '首頁「認識學會」右側會顯示前兩段，這一頁顯示全文。需要強調的字詞可用「重點標示」。',
    }),
    defineField({ name: 'image', title: '照片', type: 'photo' }),
    defineField({ name: 'plansTitle', title: '「正在推動」區塊標題', type: 'string', initialValue: '我們正在推動' }),
    defineField({
      name: 'plans',
      title: '正在推動的事',
      type: 'array',
      description: '取代原本的「年度計畫」頁。只列對外的重點，每項一句話；內部的會務、財務安排不要放。',
      validation: (r) => r.max(8),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'planHighlight',
          fields: [
            defineField({ name: 'icon', title: '圖示', type: 'string', description: '一個 emoji' }),
            defineField({ name: 'title', title: '名稱', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'text', title: '一句說明', type: 'string' }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'text', icon: 'icon' },
            prepare: ({ title, subtitle, icon }) => ({ title: `${icon || '·'} ${title}`, subtitle }),
          },
        }),
      ],
    }),
    defineField({ name: 'linksTitle', title: '下方區塊標題', type: 'string', initialValue: '組織與參與' }),
    defineField({
      name: 'links',
      title: '下方連結卡片',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'linkCard',
          fields: [
            defineField({ name: 'title', title: '標題', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'text', title: '一句說明', type: 'string' }),
            defineField({ name: 'href', title: '連到哪裡', type: 'string', description: HREF_HELP, validation: hrefValidation }),
          ],
          preview: { select: { title: 'title', subtitle: 'href' } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: '認識學會' }) },
})

export const joinPage = defineType({
  name: 'joinPage',
  title: '加入我們',
  type: 'document',
  fields: [
    ...pageHeadFields(),
    defineField({ name: 'cards', title: '參與方式', type: 'array', of: [defineArrayMember({ type: 'actionCard' })] }),
    defineField({ name: 'footnote', title: '頁尾補充說明', type: 'simpleText' }),
  ],
  preview: { prepare: () => ({ title: '加入我們' }) },
})

export const partnerPage = defineType({
  name: 'partnerPage',
  title: '與我們合作',
  type: 'document',
  fields: [
    ...pageHeadFields(),
    defineField({ name: 'cards', title: '合作方式', type: 'array', of: [defineArrayMember({ type: 'actionCard' })] }),
    defineField({ name: 'footnote', title: '頁尾補充說明', type: 'simpleText' }),
  ],
  preview: { prepare: () => ({ title: '與我們合作' }) },
})

export const eventsPage = defineType({
  name: 'eventsPage',
  title: '活動',
  type: 'document',
  description: '活動本身請到「內容 → 活動」新增與修改，這裡只放頁面上的文字。',
  fields: [
    ...pageHeadFields(),
    defineField({
      name: 'facebookNote',
      title: '在引言後加上 Facebook 粉專連結',
      type: 'boolean',
      initialValue: true,
      description: '粉專網址在「網站設定」。',
    }),
    defineField({ name: 'currentTitle', title: '活動列表標題', type: 'string', initialValue: '活動一覽' }),
    defineField({ name: 'emptyText', title: '沒有活動時顯示', type: 'string' }),
  ],
  preview: { prepare: () => ({ title: '活動' }) },
})

export const columnPage = defineType({
  name: 'columnPage',
  title: '慢活專欄',
  type: 'document',
  description: '文章本身請到「內容 → 專欄文章」編輯，這裡只放列表頁上方的文字。',
  fields: [
    ...pageHeadFields(),
    defineField({ name: 'emptyText', title: '分類沒有文章時顯示', type: 'simpleText' }),
  ],
  preview: { prepare: () => ({ title: '慢活專欄' }) },
})
