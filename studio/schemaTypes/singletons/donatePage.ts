import { defineField, defineType } from 'sanity'

export const donatePage = defineType({
  name: 'donatePage',
  title: '捐款支持',
  type: 'document',
  fields: [
    defineField({ name: 'label', title: '英文小標', type: 'string', initialValue: 'Support Us' }),
    defineField({ name: 'title', title: '頁面標題', type: 'string', initialValue: '捐款支持' }),
    defineField({ name: 'intro', title: '頁面引言', type: 'text', rows: 3 }),
    defineField({
      name: 'uses',
      title: '您的捐款用於',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'use',
          fields: [
            defineField({ name: 'icon', title: '圖示', type: 'string', description: '一個 emoji' }),
            defineField({ name: 'title', title: '項目', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'description', title: '說明', type: 'text', rows: 2 }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'description', icon: 'icon' },
            prepare: ({ title, subtitle, icon }) => ({ title: `${icon || '·'} ${title}`, subtitle }),
          },
        },
      ],
    }),

    defineField({ name: 'accountName', title: '戶名', type: 'string', initialValue: '臺灣慢活教育學會' }),
    defineField({
      name: 'bankName',
      title: '銀行',
      type: 'string',
      description:
        '⚠️ 填入真實銀行與帳號之前，請先確認學會是否已取得《公益勸募條例》所需的勸募許可字號。向不特定多數人公開募款需要主管機關許可，目前頁面顯示「待立案後公告」是安全的狀態。有疑問請先詢問理事長或法律顧問。',
    }),
    defineField({
      name: 'accountNo',
      title: '帳號',
      type: 'string',
      description: '⚠️ 同上——填入真實帳號前，請先確認勸募許可字號。',
    }),
    defineField({ name: 'receiptNote', title: '捐款收據說明', type: 'text', rows: 3 }),
    defineField({
      name: 'notes',
      title: '注意事項',
      type: 'array',
      of: [{ type: 'string' }],
      description: '每一行會以 ✦ 開頭顯示。',
    }),
  ],
  preview: { prepare: () => ({ title: '捐款支持' }) },
})
