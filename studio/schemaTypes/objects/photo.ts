import { defineField, defineType } from 'sanity'

// 頁面上的照片欄位（主視覺、主題、入口方塊）。留空時網站會顯示柔和色塊。
// 只收圖片，不開放任意檔案上傳。
export const photo = defineType({
  name: 'photo',
  title: '照片',
  type: 'image',
  options: { hotspot: true },
  description: '上傳前請確認照片中的人都同意公開，特別是學生與未成年人。可點「編輯」拖曳選擇照片的重點位置。',
  fields: [
    defineField({
      name: 'alt',
      title: '照片說明',
      type: 'string',
      description: '一句話描述照片內容，給看不到圖的讀者與搜尋引擎。例：學員在稻田旁進行自然觀察',
    }),
  ],
})
