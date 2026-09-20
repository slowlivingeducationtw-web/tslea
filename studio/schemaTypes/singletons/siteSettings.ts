import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: '網站設定',
  type: 'document',
  description: '全站共用的資訊。改這裡，頁尾、聯絡頁、搜尋結果會一起更新。',
  fields: [
    defineField({ name: 'orgName', title: '學會名稱', type: 'string', initialValue: '臺灣慢活教育學會' }),
    defineField({
      name: 'orgNameEn',
      title: '英文名稱',
      type: 'string',
      initialValue: 'Taiwan Slow Living Education Association',
    }),
    defineField({ name: 'address', title: '地址', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({
      name: 'registrationNo',
      title: '立案字號',
      type: 'string',
      description: '立案完成後填入，會顯示在頁尾。',
    }),
    defineField({
      name: 'taxId',
      title: '統一編號',
      type: 'string',
      description: '取得統編後填入。',
    }),
    defineField({
      name: 'defaultShareImage',
      title: '預設分享圖',
      type: 'image',
      description:
        '別人把網站連結貼到 LINE、Facebook 時顯示的圖。建議尺寸 1200 × 630。留空會使用目前的預設圖。',
    }),
  ],
  preview: { prepare: () => ({ title: '網站設定' }) },
})
