// 建立「跟著氣味學慢活——六月・爪哇香茅」草稿（臉書貼文搬上網站；格式同二月・澳洲茶樹，只建草稿）。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-article-citronella-june.ts --with-user-token -- <圖片檔>
import { createReadStream } from 'node:fs'
import { basename } from 'node:path'
import { randomUUID } from 'node:crypto'
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2021-06-07' })
const file = process.argv[process.argv.length - 1]
const key = () => randomUUID().replace(/-/g, '').slice(0, 12)

const verse = `六月，介於初夏與盛夏之間，
天氣開始悶熱、午後常帶著濕度，
容易讓人感到疲倦、煩躁，
蚊蟲也開始活躍，讓人覺得很困擾。

在台灣四十、五十年代
香茅曾是重要的經濟作物，
產量一度占全球香茅油市場約七成。
曬滿三合院前的香茅、
蒸餾時瀰漫的草本香氣，
承載著許多農村家庭共同的記憶，
也見證了臺灣香料產業的輝煌年代。

在忙碌、炎熱之中，讓「香茅」的清新
找回一份簡單、純粹的自在，
感受土地植物帶來的溫柔力量。

生活不必急，慢慢走，依然能抵達心之所向。`

const block = (text: string, style = 'normal', marks: string[] = []) => ({
  _key: key(),
  _type: 'block',
  style,
  markDefs: [],
  children: [{ _key: key(), _type: 'span', marks, text }],
})

async function run() {
  const a = await client.assets.upload('image', createReadStream(file), { filename: basename(file) })
  const image = { _type: 'image', asset: { _type: 'reference', _ref: a._id } }
  const alt = '跟著氣味學慢活——六月・爪哇香茅：癢癢走開、隨身防護、居家防護、運動後、淨化空氣、蟲蟲走開的精油配方'

  const doc = {
    _id: 'drafts.article-citronella-june',
    _type: 'article',
    title: '跟著氣味學慢活——六月・爪哇香茅',
    slug: { _type: 'slug', current: 'citronella-june' },
    excerpt: '六月悶熱潮濕，容易疲倦煩躁、蚊蟲也開始活躍。香茅曾是臺灣重要的經濟作物，讓它的清新找回一份簡單、純粹的自在。',
    cover: { _type: 'figure', image, alt },
    body: [
      { _key: key(), _type: 'verse', text: verse },
      { _key: key(), _type: 'figure', image, alt, caption: '爪哇香茅的生活用法（點圖可放大）' },
      block('✨ 小提醒', 'h4'),
      block('純精油濃度高，不建議直接大量接觸皮膚。', 'note'),
      block('家中若有寵物，避免大量空間擴香。', 'note'),
    ],
    links: [{ _key: key(), _type: 'link', title: '📘 facebook 粉專：三義茅鄉炭坊', url: 'https://www.facebook.com/31mstfoil' }],
    category: 'health',
    series: '慢活文字專欄｜每月一味',
    author: { _type: 'reference', _ref: 'author-guo' },
    publishedAt: '2026-06-01',
    tags: ['跟著氣味學慢活', '精油', '香茅', '苗栗三義', '慢活文字專欄'],
    accent: 'earth',
  }

  await client.createOrReplace(doc)
  console.log('已建立草稿：', doc.title)
}

run()
