// 建立「跟著氣味學慢活——五月・台灣紅檜」草稿（臉書貼文搬上網站；格式同六月・爪哇香茅，只建草稿）。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-article-red-cypress-may.ts --with-user-token -- <圖片檔>
import { createReadStream } from 'node:fs'
import { basename } from 'node:path'
import { randomUUID } from 'node:crypto'
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2021-06-07' })
const file = process.argv[process.argv.length - 1]
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
  const a = await client.assets.upload('image', createReadStream(file), { filename: basename(file) })
  const image = { _type: 'image', asset: { _type: 'reference', _ref: a._id } }
  const alt = '跟著氣味學慢活——五月・台灣紅檜：上班前、晨光清新、睡眠品質差、放鬆按摩的精油配方'

  const doc = {
    _id: 'drafts.article-red-cypress-may',
    _type: 'article',
    title: '跟著氣味學慢活——五月・台灣紅檜',
    slug: { _type: 'slug', current: 'red-cypress-may' },
    excerpt: '五月充滿愛與花香。紅檜安靜沉穩的木質香氣，後味帶點甜，像在提醒忙著照顧別人的我們：慢一點沒關係，休息一下也沒關係。',
    cover: { _type: 'figure', image, alt },
    body: [
      verse(`五月是一個讓人覺得很溫柔很溫暖的月份，
或許是因為母親節的關係，
所以特別喜歡五月到處都充滿愛與花香的月份。

這個月，很想用「台灣紅檜」來陪伴大家。`),
      block('紅檜的氣味不像花香那麼張揚，它有種安靜沉穩的木質香氣，像山林裡的大樹，靜靜站著，後味帶有甜甜的味道，氣味非常多層次，讓人覺得特別的舒服和安心。'),
      verse(`有時候生活太忙，忙著照顧別人、忙著工作、忙著回應世界，
卻忘了留一點時間給自己。

紅檜的香氣，就像是在提醒自己：`),
      block('慢一點沒關係，休息一下也沒關係。', 'normal', ['highlight']),
      block('生活就像紅檜，有非常多的層次，慢慢的一切都會變甜、變好。'),
      block('五月，也不一定要安排什麼盛大的旅行，也許只是泡一杯茶、點上一點紅檜香氣、坐在窗邊發呆幾分鐘，或是用紅檜泡個腳、按個摩，都是一種照顧自己的方式。'),
      verse(`希望整個五月，
我們都可以用溫柔的紅檜，慢慢生活、好好呼吸。`),
      { _key: key(), _type: 'figure', image, alt, caption: '台灣紅檜的生活用法（點圖可放大）' },
    ],
    links: [{ _key: key(), _type: 'link', title: '📘 facebook 粉專：三義茅鄉炭坊', url: 'https://www.facebook.com/31mstfoil' }],
    category: 'health',
    series: '慢活文字專欄｜每月一味',
    author: { _type: 'reference', _ref: 'author-guo' },
    publishedAt: '2026-05-01',
    tags: ['跟著氣味學慢活', '精油', '台灣紅檜', '苗栗三義', '慢活文字專欄'],
    accent: 'earth',
  }

  await client.createOrReplace(doc)
  console.log('已建立草稿：', doc.title)
}

run()
