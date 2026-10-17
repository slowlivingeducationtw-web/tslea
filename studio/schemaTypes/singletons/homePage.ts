import { defineArrayMember, defineField, defineType } from 'sanity'
import { HREF_HELP, hrefValidation } from '../objects/navLink'

// 首頁由上到下：輪播 → 主張 → 我們怎麼一起學（在「慢活共學」編輯）→ 近期活動（自動）→ 探索更多 → 行動呼籲。
// 「認識學會」右側內文取自「認識學會」頁的前兩段。

const HERO_TONES = [
  { title: '森林綠', value: 'forest' },
  { title: '藍灰', value: 'mist' },
  { title: '陶土', value: 'clay' },
  { title: '橄欖綠', value: 'leaf' },
]
const TILE_TONES = [
  { title: '森林綠', value: 'forest' },
  { title: '藍灰', value: 'slate' },
  { title: '陶土', value: 'clay' },
  { title: '橄欖綠', value: 'olive' },
]

export const homePage = defineType({
  name: 'homePage',
  title: '首頁',
  type: 'document',
  groups: [
    { name: 'hero', title: '輪播', default: true },
    { name: 'statement', title: '主張' },
    { name: 'events', title: '近期活動' },
    { name: 'tiles', title: '探索更多' },
    { name: 'cta', title: '行動呼籲' },
    { name: 'seo', title: '搜尋設定' },
  ],
  fields: [
    defineField({
      name: 'heroSlides',
      title: '輪播頁',
      type: 'array',
      group: 'hero',
      description: '每 6 秒自動換一頁。可拖曳調整順序，建議 2～4 頁。',
      validation: (r) => r.min(1).max(5),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'heroSlide',
          fields: [
            defineField({ name: 'pre', title: '大標上方小字（選填）', type: 'string', description: '例：慢下來，' }),
            defineField({
              name: 'title',
              title: '大標',
              type: 'text',
              rows: 2,
              validation: (r) => r.required(),
              description: '按 Enter 可指定換行位置。手機上只會在「、」「・」「，」之後自動換行，不會把詞拆開。',
            }),
            defineField({ name: 'sub', title: '副標（選填）', type: 'text', rows: 2 }),
            defineField({ name: 'image', title: '背景照片', type: 'photo' }),
            defineField({
              name: 'video',
              title: '背景影片（選填）',
              type: 'object',
              description: '用學會 YouTube 影片的一小段，靜音循環播放當背景。影片載入前、或訪客的裝置設定「減少動態」時，會顯示上面的背景照片（沒放照片就用影片縮圖）。',
              options: { collapsible: true, collapsed: true },
              fields: [
                defineField({
                  name: 'url',
                  title: 'YouTube 網址',
                  type: 'url',
                  validation: (r) =>
                    r.uri({ scheme: ['https'] }).custom((v?: string) =>
                      !v || /youtube\.com|youtu\.be/.test(v) ? true : '請貼 YouTube 影片網址',
                    ),
                }),
                defineField({ name: 'start', title: '從第幾秒開始', type: 'number', description: '例：4 分 58 秒 → 298', validation: (r) => r.min(0) }),
                defineField({
                  name: 'end',
                  title: '播到第幾秒',
                  type: 'number',
                  description: '建議片段 8～20 秒，太長會多耗訪客的流量。',
                  validation: (r) =>
                    r.min(0).custom((v: number | undefined, ctx: any) =>
                      v == null || ctx.parent?.start == null || v > ctx.parent.start ? true : '要比開始秒數大',
                    ),
                }),
              ],
            }),
            defineField({
              name: 'tone',
              title: '底色',
              type: 'string',
              description: '沒有照片時顯示的顏色。',
              options: { list: HERO_TONES, layout: 'radio', direction: 'horizontal' },
              initialValue: 'forest',
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'sub', media: 'image', video: 'video.url' },
            prepare: ({ title, subtitle, media, video }) => ({ title, subtitle: video ? `🎬 背景影片・${subtitle ?? ''}` : subtitle, media }),
          },
        }),
      ],
    }),

    defineField({
      name: 'statement',
      title: '主張句',
      type: 'text',
      rows: 3,
      group: 'statement',
      description: '首頁左側的大字。按 Enter 可換行。',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'statementHighlight',
      title: '要強調的字詞',
      type: 'string',
      group: 'statement',
      description: '主張句裡要加上陶土色底線的字，例：學習。必須和主張句裡的字完全一樣。',
    }),

    defineField({ name: 'eventsTitle', title: '區塊標題', type: 'string', group: 'events', initialValue: '近期活動' }),
    defineField({
      name: 'eventsSub',
      title: '區塊副標',
      type: 'string',
      group: 'events',
      description: '活動本身請到「內容 → 活動資訊」編輯，首頁會自動顯示最近三筆。',
    }),

    defineField({ name: 'tilesTitle', title: '區塊標題', type: 'string', group: 'tiles', initialValue: '探索更多' }),
    defineField({
      name: 'tiles',
      title: '入口方塊',
      type: 'array',
      group: 'tiles',
      validation: (r) => r.max(6),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'tile',
          fields: [
            defineField({ name: 'title', title: '標題', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'text', title: '一句說明', type: 'string' }),
            defineField({ name: 'href', title: '連到哪裡', type: 'string', description: HREF_HELP, validation: hrefValidation }),
            defineField({ name: 'image', title: '背景照片', type: 'photo' }),
            defineField({
              name: 'tone',
              title: '底色',
              type: 'string',
              description: '沒有照片時顯示的顏色。',
              options: { list: TILE_TONES, layout: 'radio', direction: 'horizontal' },
              initialValue: 'forest',
            }),
          ],
          preview: { select: { title: 'title', subtitle: 'href', media: 'image' } },
        }),
      ],
    }),

    defineField({ name: 'ctaTitle', title: '標題', type: 'string', group: 'cta', initialValue: '一起慢下來' }),
    defineField({ name: 'ctaText', title: '說明', type: 'text', rows: 2, group: 'cta' }),
    defineField({
      name: 'ctaButtons',
      title: '按鈕',
      type: 'array',
      group: 'cta',
      description: '最多兩顆，第一顆是實心按鈕。',
      validation: (r) => r.max(2),
      of: [defineArrayMember({ type: 'navLink' })],
    }),

    defineField({
      name: 'seoTitle',
      title: '網頁標題',
      type: 'string',
      group: 'seo',
      description: '瀏覽器分頁與 Google 搜尋結果顯示的標題。',
    }),
    defineField({
      name: 'seoDescription',
      title: '搜尋結果說明',
      type: 'text',
      rows: 2,
      group: 'seo',
      validation: (r) => r.max(160),
    }),
  ],
  preview: { prepare: () => ({ title: '首頁' }) },
})
