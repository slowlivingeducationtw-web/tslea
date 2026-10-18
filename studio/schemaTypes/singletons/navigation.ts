import { defineArrayMember, defineField, defineType } from 'sanity'
import { HREF_HELP, hrefValidation } from '../objects/navLink'

// 頁首選單與頁尾連結。順序＝畫面上的順序，可拖曳調整。
export const navigation = defineType({
  name: 'navigation',
  title: '選單與頁尾',
  type: 'document',
  groups: [
    { name: 'header', title: '頁首選單', default: true },
    { name: 'footer', title: '頁尾' },
  ],
  fields: [
    defineField({
      name: 'mainNav',
      title: '主選單',
      type: 'array',
      group: 'header',
      description: '超過 6 項在一般筆電上會擠不下，請盡量精簡。',
      validation: (r) => r.max(7),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'navItem',
          fields: [
            defineField({ name: 'label', title: '顯示文字', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'href', title: '連到哪裡', type: 'string', description: HREF_HELP, validation: hrefValidation }),
            defineField({
              name: 'children',
              title: '子選單（選填）',
              type: 'array',
              description: '滑鼠移到主項目時展開；手機版直接列在下方。',
              of: [defineArrayMember({ type: 'navSubLink' })],
            }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'href', children: 'children' },
            prepare: ({ title, subtitle, children }) => ({
              title,
              subtitle: children?.length ? `${subtitle}・子選單 ${children.length} 項` : subtitle,
            }),
          },
        }),
      ],
    }),
    defineField({ name: 'headerCta', title: '右上角按鈕', type: 'navLink', group: 'header' }),

    defineField({
      name: 'footerGroups',
      title: '頁尾連結分組',
      type: 'array',
      group: 'footer',
      validation: (r) => r.max(4),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'footerGroup',
          fields: [
            defineField({ name: 'title', title: '分組標題', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'links', title: '連結', type: 'array', of: [defineArrayMember({ type: 'navLink' })] }),
          ],
          preview: { select: { title: 'title' } },
        }),
      ],
    }),
    defineField({
      name: 'facebookLabel',
      title: 'Facebook 按鈕文字',
      type: 'string',
      group: 'footer',
      description: '粉專網址在「網站設定」，留空網址就不顯示按鈕。',
    }),
  ],
  preview: { prepare: () => ({ title: '選單與頁尾' }) },
})
