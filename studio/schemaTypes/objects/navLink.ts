import { defineField, defineType } from 'sanity'

// 選單、頁尾、按鈕共用的連結。網站內的頁面填「/about」這種以斜線開頭的路徑；
// 外部網站填完整網址；Email 填「mailto:信箱」。
export const HREF_HELP =
  '網站內的頁面填斜線開頭的路徑，例：/about、/partner#school；外部網站填完整網址（https://…）；寄信填 mailto:信箱。'

export const hrefValidation = (r: any) =>
  r.required().custom((v: string | undefined) =>
    !v || /^(\/|https?:\/\/|mailto:|tel:|#)/.test(v.trim())
      ? true
      : '請以「/」開頭（站內頁面），或填完整網址 https://…、mailto:…',
  )

export const navLink = defineType({
  name: 'navLink',
  title: '連結',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: '顯示文字', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'href', title: '連到哪裡', type: 'string', description: HREF_HELP, validation: hrefValidation }),
  ],
  preview: { select: { title: 'label', subtitle: 'href' } },
})

// 子選單的項目：多一個「縮排一層」，例：慢活專欄 → 全部文章 → 身心健康、藝術陪伴……
// 2026-10 從 navLink 改成這個型別（migrations/2026-10-nav-column-sub.ts 轉換了舊資料）。
export const navSubLink = defineType({
  name: 'navSubLink',
  title: '子選單項目',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: '顯示文字', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'href', title: '連到哪裡', type: 'string', description: HREF_HELP, validation: hrefValidation }),
    defineField({
      name: 'indent',
      title: '縮排一層',
      type: 'boolean',
      description: '勾選後顯示在上一個沒縮排的項目底下，例：分類放在「全部文章」底下。',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'href', indent: 'indent' },
    prepare: ({ title, subtitle, indent }) => ({ title: indent ? `　└ ${title}` : title, subtitle }),
  },
})
