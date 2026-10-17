import { defineField, defineType } from 'sanity'
import { HREF_HELP } from './navLink'

// 「加入我們」「與我們合作」頁的卡片：標題、說明、一顆按鈕。
// 按鈕可以連到表單網址；還沒有表單時，填 Email 主旨，網站會自動產生寄信連結。
export const actionCard = defineType({
  name: 'actionCard',
  title: '卡片',
  type: 'object',
  fields: [
    defineField({ name: 'icon', title: '圖示', type: 'string', description: '一個 emoji，例：🌱' }),
    defineField({ name: 'title', title: '標題', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'text', title: '說明', type: 'text', rows: 4 }),
    defineField({ name: 'ctaLabel', title: '按鈕文字', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'href',
      title: '按鈕連結',
      type: 'string',
      description: `有線上表單時填表單網址。${HREF_HELP}`,
    }),
    defineField({
      name: 'emailSubject',
      title: 'Email 主旨（沒有表單時）',
      type: 'string',
      description: '「按鈕連結」留空時，按鈕會開啟寄信給學會，並自動帶入這個主旨，方便分類來信。',
    }),
    defineField({ name: 'note', title: '按鈕旁小字（選填）', type: 'string', description: '例：線上入會申請表 待補' }),
    defineField({
      name: 'anchor',
      title: '頁內定位名稱（英文，請勿隨意修改）',
      type: 'string',
      description: '選單會用「/partner#school」直接跳到這張卡片。改了這裡，選單連結也要一起改。',
      validation: (r) => r.regex(/^[a-z0-9-]+$/, { name: '小寫英文、數字或 -' }),
    }),
  ],
  validation: (r) =>
    r.custom((v: any) => (!v || v.href || v.emailSubject ? true : '請填「按鈕連結」或「Email 主旨」其中一個')),
  preview: { select: { title: 'title', icon: 'icon', subtitle: 'ctaLabel' }, prepare: ({ title, icon, subtitle }) => ({ title: `${icon || '·'} ${title}`, subtitle }) },
})
