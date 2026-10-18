// 建立活動〈苗農 SEL 第三堂課〉（2026-06-10）與活動回顧（謝啟彬理事撰文），只建草稿。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-event-miaonong-sel3.ts --with-user-token -- <學會投影片> <DeepMind影片> <智慧絲路舉手> <AI怎麼幫助我們>
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

async function run() {
  if (files.length !== 4) throw new Error('需要 4 張圖片')
  const up = async (f: string) => ({
    _type: 'image',
    asset: { _type: 'reference', _ref: (await client.assets.upload('image', createReadStream(f), { filename: basename(f) }))._id },
  })
  const [slide, deepmind, hands, aiHelp] = await Promise.all(files.map(up))
  const fig = (image: any, alt: string) => ({ _key: key(), _type: 'figure', image, alt })
  const slideAlt = '苗栗農工圖書館裡，講者站在投影幕前分享，投影片寫著臺灣慢活教育學會「智慧絲路：AI 時代的大秘寶」，穿橘色運動服的學生圍坐長桌聆聽'

  const recap = [
    block('6 月 10 日，苗農 SEL（社會情緒學習）迎來了第三堂課。這一次，我們帶著孩子與夥伴，從「AI 科技」與「閱讀」的獨特視角，展開了一場關於「社會覺察」與「負責任決策」的深度思維練習。'),
    block('在老師的引導下，我們打破了框架、打開了視野。當聊到「AI 與棋王」的世紀對弈時，大家開始重新思考——當人工智慧已經能在人類制定的遊戲規則中輕鬆勝出，那麼，人類對於「贏」的定義到底該是什麼？'),
    {
      _key: key(),
      _type: 'imageRow',
      images: [
        fig(deepmind, '講者站在投影幕前，幕上播放 DeepMind 紀錄片《The Thinking Game》，學生坐在長桌兩側'),
        fig(hands, '投影幕上是「智慧絲路：AI 時代的大秘寶」，學生們紛紛舉手回應講者的提問'),
      ],
    },
    block('我們發現，生活裡更重要的大事，從來都不是爭奪輸贏，而是學會如何「協作」與「運用資源」，進而創造整體社會的福祉。'),
    block('就像課堂影片中，DeepMind 創辦人 Demis Hassabis 帶領的團隊，他們運用 AI 成功解開了困擾科學界半世紀的「蛋白質摺疊模型」。最令人動容的是，他們沒有選擇壟斷，而是選擇將程式碼「完全開源」，讓全世界的生醫團隊都能共享這個成果，進而推動全球醫療的巨大進展。'),
    block('這正是最頂級的「社會覺察」與「負責任決策」——擁有強大的力量，選擇用利他的心去照亮世界。', 'normal', ['highlight']),
    fig(aiHelp, '講者拿著麥克風，介紹投影片「AI 可以怎麼幫助我們？」，畫面上是用 AI 製作的店家菜單與宣傳海報'),
    block('在苗農的 SEL 課堂裡，我們不只學情緒，更學著在大科技時代裡，如何保有一顆溫柔且懂得分享的心。'),
    block('由衷感謝苗栗市立圖書館對生命教育經費的無私挹注，感謝陳鵬文主持人引導、張勝洋老師與許宸豪老師分享，臺灣慢活教育學會協助。因為有您們的支持，讓苗農的孩子能站在科技與人文的肩膀上，看得更遠、走得更穩。', 'note'),
  ]

  const doc = {
    _id: 'drafts.event-miaonong-sel-3',
    _type: 'event',
    title: '苗農 SEL 第三堂課：AI 時代的社會覺察與負責任決策',
    slug: { _type: 'slug', current: 'miaonong-sel-3-2026' },
    activityType: { _type: 'reference', _ref: 'activity-talk' },
    dateLabel: '2026 · 06 · 10',
    sortDate: '2026-06-10',
    place: '苗栗縣 國立苗栗高級農工職業學校',
    description: '從 AI 與棋王的對弈、DeepMind 開源蛋白質摺疊模型的故事，陪苗農的孩子思考：在科技時代，「贏」的定義是什麼？如何用利他的心做出負責任的決定。',
    cover: { _type: 'figure', image: slide, alt: slideAlt },
    recap,
    recapAuthor: { _type: 'reference', _ref: 'author-hsieh' },
  }

  await client.createOrReplace(doc)
  console.log('已建立草稿：', doc.title)
}

run()
