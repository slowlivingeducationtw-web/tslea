// 建立「真實，不虛」草稿（學會 2026 農曆年後的臉書祝福文），並新增作者「臺灣慢活教育學會」。
// 作者直接發布（只有草稿的作者會讓文章發布失敗）；文章只建草稿，同仁確認後按發布。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-article-zhenshi.ts --with-user-token -- <圖片檔>
import { createReadStream } from 'node:fs'
import { basename } from 'node:path'
import { randomUUID } from 'node:crypto'
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-01-01' })
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
  await client.createIfNotExists({
    _id: 'author-tslea',
    _type: 'author',
    name: '臺灣慢活教育學會',
    initial: '慢',
    accent: 'sage',
  })

  const a = await client.assets.upload('image', createReadStream(file), { filename: basename(file) })
  const image = { _type: 'image', asset: { _type: 'reference', _ref: a._id } }
  const alt = '水面倒映著樹枝與高樓，畫面寫著：慢慢呼吸，慢慢真實，很好'

  const body = [
    block('農曆年假即將結束，慶祝的燈火煙硝即將散去，每個人又將投入日常的生活。'),
    verse(`年復一年的慶典，
日復一日的生活，
春夏秋冬的更替，
生老病死的循環，`),
    block('在這些那些看起來都很像的日常，其實都蘊含著不可思議的驚喜，其中一個驚喜，就是「發現真實」。'),
    block('回到日常說是生活，也是一種練習。', 'normal', ['highlight']),
    block('人類有一種特殊的能力，那就是在重複的事情裡，一次又一次發現過去所不知道的內容。這是觀察的能力，一種生命智慧的運作，一種進步，一種驚喜，一種發現「原來如此」，一種感受「豁然開朗」的超能力。'),
    verse(`重複的年節，
重複的日常，
重複的季節，
重複的人生，`),
    verse(`倘若，我們可以慢下來，
我們會發現，每一個當下，其實都不是重複；

倘若，我們可以慢下來，
我們會發現，重複，是我們設想的結果；

倘若，我們可以慢下來，
我們會發現，我們一直活在想像裡；

倘若，
你真的發現了這一切，
你會看見，
真實走過來，
你會看見，
你走過來。

倘若，
你真的慢下來。`),
    { _key: key(), _type: 'figure', image, alt },
    verse(`慢慢呼吸
慢慢真實
很好`),
    block('臺灣慢活教育學會　感恩祝福', 'note'),
  ]

  const doc = {
    _id: 'drafts.article-zhenshi',
    _type: 'article',
    title: '真實，不虛',
    slug: { _type: 'slug', current: 'zhenshi' },
    excerpt: '年復一年的慶典、日復一日的生活，看起來都很像的日常裡，其實蘊含著不可思議的驚喜。倘若我們可以慢下來，會發現每一個當下，其實都不是重複。',
    cover: { _type: 'figure', image, alt },
    body,
    category: 'health',
    author: { _type: 'reference', _ref: 'author-tslea' },
    publishedAt: '2026-02-22',
    tags: ['慢活', '覺察', '農曆新年', '日常練習'],
    accent: 'sage',
  }

  await client.createOrReplace(doc)
  console.log('已建立草稿：', doc.title)
}

run()
