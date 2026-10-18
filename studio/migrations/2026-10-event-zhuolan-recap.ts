// 建立活動〈卓蘭高中．慢活．香息〉（2026-01-06，陳鵬文老師）與活動回顧（志工吳順卿攝影撰文），只建草稿。
// 作者吳順卿直接發布（只有草稿的作者會讓活動發布失敗）。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-event-zhuolan-recap.ts --with-user-token -- <藥草> <大合照> <品香> <小花大器> <師長笑容>
import { createReadStream } from 'node:fs'
import { basename } from 'node:path'
import { randomUUID } from 'node:crypto'
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-01-01' })
const files = process.argv.slice(2).filter((f) => /\.(jpe?g|png)$/i.test(f))
const key = () => randomUUID().replace(/-/g, '').slice(0, 12)

const block = (text: string, style = 'normal', marks: string[] = []) => ({
  _key: key(),
  _type: 'block',
  style,
  markDefs: [],
  children: [{ _key: key(), _type: 'span', marks, text }],
})
const verse = (text: string) => ({ _key: key(), _type: 'verse', text })

async function run() {
  if (files.length !== 5) throw new Error('需要 5 張圖片')
  await client.createIfNotExists({
    _id: 'author-wu-shunqing',
    _type: 'author',
    name: '吳順卿',
    title: '臺灣慢活教育學會志工',
    accent: 'sage',
  })

  const up = async (f: string) => ({
    _type: 'image',
    asset: { _type: 'reference', _ref: (await client.assets.upload('image', createReadStream(f), { filename: basename(f) }))._id },
  })
  const [herbs, group, incense, flowers, smiles] = await Promise.all(files.map(up))
  const fig = (image: any, alt: string, caption?: string) => ({ _key: key(), _type: 'figure', image, alt, ...(caption ? { caption } : {}) })
  const herbsAlt = '圖書館窗邊的長桌上，竹篩裡鋪著曬乾的藥草與香料，窗外是卓蘭的街景與遠山，窗台擺著紅色聖誕紅'

  const recap = [
    block('寒冷的天氣，澆不熄慢活教育學會推廣慢活理念、護愛生命的慈悲初心。'),
    block('清晨八點，鵬文老師即與陳媽一同抵達卓蘭高中（志工浩明和順卿於九點半加入），展開與兩班高中生及師長的三場生命對話。'),
    block('透過呼吸覺察的引導、藥浴包的手作體驗、共創「小花大器」的畫作，以及調製並品味專屬自己的香粉，讓師生在過程中練習靜心，安頓身心，慢慢回到當下。'),
    fig(incense, '陳鵬文老師坐在長桌前示範品香，師長們圍在桌邊專注觀看，後方螢幕寫著「慢活・香息」'),
    verse(`在一吸一吐之間——
遇見自己，
接收大自然溫柔而穩定的支持，
將過去一年的煩惱與焦慮慢慢吐出，
也把身體不再需要的情緒，一一放下。`),
    verse(`祝福他們，
將身體照顧好，
將學習與工作一點一滴累積，
迎向 2026 豐盛而安穩的一年。`),
    {
      _key: key(),
      _type: 'imageRow',
      images: [
        fig(flowers, '八張黑卡上用粉蠟筆畫的「小花大器」：各式花瓶插著橘、黃、白色的花，每張都有作者簽名'),
        fig(smiles, '師長們坐在桌邊，笑著拍手，桌上放著自己的畫作'),
      ],
      caption: '共創「小花大器」',
    },
    block('此次參與活動，深深感受到校長與圖書館主任對師生的用心與關愛。不論承辦鵬文老師課程的細膩安排，或清晨六點便開始準備點心與飲料的貼心舉動，都讓人動容。也親眼見證學生與老師們，在活動結束後所展現出的充實與放鬆，那份從內而外的安定，真實而美好。'),
    block('而我自己，也再次深刻體會到——'),
    verse(`生命即生活，
生活即生命，
生命影響生命，
是世間最美的流動。`),
    block('讚嘆！', 'normal', ['highlight']),
    fig(group, '陳鵬文老師與卓蘭高中師長、學會志工拿著感謝狀合影，大家比讚微笑', '陳鵬文老師與卓蘭高中師長、學會志工合影'),
  ]

  const doc = {
    _id: 'drafts.event-zhuolan-2026',
    _type: 'event',
    title: '卓蘭高中．慢活．香息',
    slug: { _type: 'slug', current: 'zhuolan-high-2026' },
    activityType: { _type: 'reference', _ref: 'activity-talk' },
    dateLabel: '2026 · 01 · 06',
    sortDate: '2026-01-06',
    place: '苗栗縣 國立卓蘭高級中學',
    description: '陳鵬文老師走進卓蘭高中，以呼吸覺察、藥浴包手作、「小花大器」共畫與調製香粉，陪伴師生在新年之初靜心、安頓身心。',
    cover: { _type: 'figure', image: herbs, alt: herbsAlt },
    recap,
    recapAuthor: { _type: 'reference', _ref: 'author-wu-shunqing' },
    columnCategories: ['health'],
  }

  await client.createOrReplace(doc)
  console.log('已建立草稿：', doc.title)
}

run()
