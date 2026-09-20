import { defineField, defineType } from 'sanity'

export const boardAreaPage = defineType({
  name: 'boardAreaPage',
  title: '理監事專區',
  type: 'document',
  description:
    '⚠️ 這一頁是公開網頁，只放說明與連結。會議紀錄、內部文件、會員名冊一律放 Google 共用雲端硬碟，絕對不要貼在這裡。',
  fields: [
    defineField({ name: 'title', title: '頁面標題', type: 'string', initialValue: '理監事專區' }),
    defineField({ name: 'intro', title: '說明文字', type: 'text', rows: 3 }),
    defineField({
      name: 'driveUrl',
      title: '共用雲端硬碟連結（選填）',
      type: 'url',
      description: '填了之後頁面會出現一個按鈕。沒有權限的人點進去看不到內容，是安全的。',
    }),
    defineField({ name: 'accessNote', title: '如何取得權限', type: 'text', rows: 3 }),
    defineField({ name: 'whyNote', title: '為什麼文件不放在網站上', type: 'text', rows: 4 }),
  ],
  preview: { prepare: () => ({ title: '理監事專區' }) },
})
