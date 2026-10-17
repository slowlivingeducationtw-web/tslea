import { defineField, defineType } from 'sanity'

// 影片：貼 YouTube 或 Facebook 影片網址，網站上直接播放。
// 影片檔本身放在學會的 YouTube 頻道，後台只存網址（不開放上傳影片檔）。
export const VIDEO_URL = /^(https?:\/\/)?((www|m)\.)?(youtube\.com|youtu\.be|facebook\.com|fb\.watch)\//i

export const videoEmbed = defineType({
  name: 'videoEmbed',
  title: '影片',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      title: '影片網址',
      type: 'url',
      description: '貼上 YouTube 或 Facebook 影片的網址。影片請先上傳到學會的 YouTube 頻道（可設為「不公開」）。',
      validation: (r) =>
        r.required().uri({ scheme: ['https', 'http'] }).custom((v?: string) =>
          !v || VIDEO_URL.test(v) ? true : '目前只支援 YouTube 或 Facebook 的影片網址',
        ),
    }),
    defineField({ name: 'caption', title: '影片說明（選填）', type: 'string' }),
  ],
  preview: {
    select: { url: 'url', caption: 'caption' },
    prepare: ({ url, caption }) => ({ title: caption || '影片', subtitle: url }),
  },
})
