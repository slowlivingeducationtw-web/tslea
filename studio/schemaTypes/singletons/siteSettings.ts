import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: '網站設定',
  type: 'document',
  description: '全站共用的資訊。改這裡，頁尾、各頁的寄信按鈕、搜尋結果會一起更新。',
  fields: [
    defineField({ name: 'orgName', title: '學會名稱', type: 'string', initialValue: '臺灣慢活教育學會' }),
    defineField({
      name: 'orgNameEn',
      title: '英文名稱',
      type: 'string',
      initialValue: 'Slow Living Education Society of Taiwan',
    }),
    defineField({ name: 'address', title: '地址', type: 'string', description: '顯示在頁尾。' }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      description: '頁尾「來信給我們」與「加入我們」「與我們合作」頁的寄信按鈕都寄到這裡。',
      validation: (r) => r.required().email(),
    }),
    defineField({
      name: 'facebook',
      title: 'Facebook 粉專網址',
      type: 'url',
      description: '頁尾按鈕與活動頁會連到這裡。',
    }),
    defineField({
      name: 'footerNote',
      title: '頁尾最下方小字',
      type: 'string',
      description: '版權文字後面的說明，例：非營利公益社會團體',
    }),
    defineField({
      name: 'registrationNo',
      title: '立案字號',
      type: 'string',
      description: '填入後會顯示在頁尾。',
    }),
    defineField({
      name: 'taxId',
      title: '統一編號',
      type: 'string',
      description: '填入後會顯示在頁尾。',
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
