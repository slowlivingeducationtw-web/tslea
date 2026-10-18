// 建立活動〈苗農 SEL 第二堂課〉（2026-05-26）與活動回顧（謝啟彬理事撰文），只建草稿。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-event-miaonong-sel2.ts --with-user-token -- <竹簡示範> <聞香包> <竹簡合照> <慢活密碼> <香包合照>
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
const numbered = (label: string, text: string) => ({
  _key: key(),
  _type: 'block',
  style: 'normal',
  listItem: 'number',
  level: 1,
  markDefs: [],
  children: [
    { _key: key(), _type: 'span', marks: ['strong'], text: label },
    { _key: key(), _type: 'span', marks: [], text: `：${text}` },
  ],
})

async function run() {
  if (files.length !== 5) throw new Error('需要 5 張圖片')
  const up = async (f: string) => ({
    _type: 'image',
    asset: { _type: 'reference', _ref: (await client.assets.upload('image', createReadStream(f), { filename: basename(f) }))._id },
  })
  const [bamboo, sniff, bambooGroup, code, sachetGroup] = await Promise.all(files.map(up))
  const fig = (image: any, alt: string, caption?: string) => ({ _key: key(), _type: 'figure', image, alt, ...(caption ? { caption } : {}) })
  const codeAlt = '桌上的竹篩寫著「臺灣慢活教育學會」，旁邊立著「慢活密碼 1234567」海報：每天練習、早晚兩次、每次 3 分鐘、正方形呼吸、吸氣 5 秒吐氣 5 秒、每分鐘 6 組呼吸、微笑喜悅'

  const recap = [
    block('從 5 月 6 日跨越到 5 月 26 日，走過苗農 SEL（社會情緒學習）的第二堂課，我們看見了改變正在悄悄發生。第三堂課預計在 6 月 10 日相見，而這趟旅程，是我們送給孩子與教職員工們最珍貴的禮物。'),
    block('在這個講求速度的時代，我們常常忘了停下來聽聽內心的聲音。SEL 不單是教育，更是一場關於愛的修煉。透過專業的五大核心能力，我們正在為孩子建構陪伴一生的心理韌性：'),
    numbered('自我覺察', '學會辨識情緒，溫柔地擁抱自己的優缺點。'),
    numbered('自我管理', '在衝動來臨時按下暫停鍵，優雅地調節並實踐目標。'),
    numbered('社會覺察', '看見別人的需要，用同理心跨越不同的文化與觀點。'),
    numbered('人際技巧', '搭起溝通的橋樑，建立健康、互信的正向關係。'),
    numbered('負責任的決策', '在紛擾的世界中，做出對自己與社會最好的選擇。'),
    {
      _key: key(),
      _type: 'imageRow',
      images: [
        fig(bamboo, '陳玉明老師站在投影幕前，笑著示範用冰棒棍和毛線編成竹簡'),
        fig(code, codeAlt),
      ],
      caption: '漢字知識與竹簡手作、慢活密碼 1234567 呼吸練習',
    },
    block('「一步步慢慢往前，不攀比、不急躁，用慢活的節奏往前走。」', 'blockquote'),
    block('這是我們的課堂宣言，也是對生命的承諾。我們希望能成為孩子與夥伴身旁的那棵大樹，陪伴他們認識情緒、學會同理。因為我們相信，當心穩了，腳步就踏實了。'),
    {
      _key: key(),
      _type: 'imageRow',
      images: [
        fig(bambooGroup, '師生在「打開漢字看見文化——漢字知識與竹簡手作」投影片前，舉起自己做的竹簡合影'),
        fig(sachetGroup, '師生圍坐在長桌邊，拿著親手做的香包比出手勢合影，桌上擺著裝藥草的竹篩'),
      ],
    },
    block('由衷感謝國教署優質化教育經費對生命教育的挹注，感謝臺灣慢活教育學會的專業推動，以及苗栗市圖書館的資源投入。因為有您們的同行，這條灌溉心靈的路上，繁花盛開。', 'note'),
  ]

  const doc = {
    _id: 'drafts.event-miaonong-sel-2',
    _type: 'event',
    title: '苗農 SEL 第二堂課：不攀比、不急躁，與大腦的溫柔對話',
    slug: { _type: 'slug', current: 'miaonong-sel-2-2026' },
    activityType: { _type: 'reference', _ref: 'activity-talk' },
    dateLabel: '2026 · 05 · 26',
    sortDate: '2026-05-26',
    place: '苗栗縣 國立苗栗高級農工職業學校',
    description: '苗農 SEL（社會情緒學習）第二堂課，透過漢字竹簡手作、聞香與呼吸練習，陪孩子與教職員工認識情緒、學會同理：一步步慢慢往前，不攀比、不急躁。',
    cover: { _type: 'figure', image: sniff, alt: '參與的夥伴閉上眼睛，雙手捧著香包湊近鼻子細細聞香' },
    recap,
    recapAuthor: { _type: 'reference', _ref: 'author-hsieh' },
  }

  await client.createOrReplace(doc)
  console.log('已建立草稿：', doc.title)
}

run()
