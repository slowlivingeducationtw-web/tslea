// 建立「跟著文字學慢活——四月・禾」草稿（臉書貼文搬上網站；格式同三月・木，只建草稿）。
// 部件卡圖片可以之後再補：不帶圖片執行＝只建文字；帶 1～3 張圖片＝第一張當封面，文末放部件卡（2～3 張並排）。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-article-he-april.ts --with-user-token -- [圖片檔…]
import { createReadStream } from 'node:fs'
import { basename } from 'node:path'
import { randomUUID } from 'node:crypto'
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2021-06-07' })
const files = process.argv.slice(2).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
const key = () => randomUUID().replace(/-/g, '').slice(0, 12)

const block = (text: string, style = 'normal', marks: string[] = []) => ({
  _key: key(),
  _type: 'block',
  style,
  markDefs: [],
  children: [{ _key: key(), _type: 'span', marks, text }],
})

async function run() {
  const figures = []
  for (const [i, file] of files.entries()) {
    const a = await client.assets.upload('image', createReadStream(file), { filename: basename(file) })
    figures.push({
      _key: key(),
      _type: 'figure',
      image: { _type: 'image', asset: { _type: 'reference', _ref: a._id } },
      alt: i === 0 ? '禾字部件卡：稻穗插畫、注音ㄏㄜˊ、拼音 hé，以及甲骨文、金文、戰國文字、小篆、隸書、楷書的字形演變' : `禾字部件卡（${i + 1}）`,
    })
  }
  const credit = '圖像引用自《漢字好好教 好好教漢字》部件卡'
  const cards =
    figures.length >= 2
      ? [{ _key: key(), _type: 'imageRow', images: figures, caption: credit }]
      : figures.map((f) => ({ ...f, caption: credit }))

  const body = [
    block('唐朝李紳寫了一首膾炙人口的〈憫農〉詩：「鋤禾日當午，汗滴禾下土。誰知盤中飧，粒粒皆辛苦。」我們在這首詩中看到農夫在大太陽下揮汗「鋤禾」，更懂得珍惜每一粒米得來不易。'),
    block('這個月我們來聊聊「禾」。'),
    block('「禾」字的構形是一株成熟的稻穀，稻穀成熟時，稻穗垂了下來，所以從甲骨文、金文、小篆都可以清楚看見這植物上方有垂下來的部分。'),
    block('一個漢字如果有「禾」部件，代表了好幾種意思。它既是成熟的稻穀，自然跟稻子有關，例如「稻、穀、秧、穗、穫」等字；古時候稻子一年只能收成一次，所以它也就隱約地跟「定期的」有關係，像是「租、稅、秋」，以前收租、收稅是收稻穀，並且時間到了就要收。'),
    block('還有一個字，一開始造字時是畫了一個「人」背著「禾」，表示豐收、豐年的意思，後來因為長時間演變的關係，字形變化比較大，現在的楷書已經看不出「人＋禾」的組合了。這樣你知道是哪個字嗎？來看看附圖吧！'),
    block('如果我們再多認識一個部件：「⺕」，它是一隻右手，要是用右手拿著一株「禾」，這是什麼字呢？'),
    block('是「秉」，所以「秉」有「握、持」的意思。如果拿著兩株「禾」是什麼字呢？代表什麼意思？且讓我賣個關子吧！過兩天來解答。'),
    block('🌾 今天的慢活任務：細嚼慢嚥，好好吃飯，心懷感恩，珍惜每一粒米。', 'normal', ['highlight']),
    block('預告：5 月我們來看看「香」字——「香」也有「禾」部件，難道說的是米香嗎？', 'note'),
    ...cards,
  ]

  const doc = {
    _id: 'drafts.article-he-april',
    _type: 'article',
    title: '跟著文字學慢活——四月・禾',
    slug: { _type: 'slug', current: 'he-april' },
    excerpt: '「鋤禾日當午，汗滴禾下土。」「禾」是一株稻穗垂下的成熟稻穀。有「禾」部件的字，有的跟稻子有關，有的跟「定期」有關——用右手拿著一株禾，又是什麼字呢？',
    ...(figures[0] ? { cover: { _type: 'figure', image: figures[0].image, alt: figures[0].alt } } : {}),
    body,
    links: [{ _key: key(), _type: 'link', title: '📘 facebook 粉專：小明的漢字研究基地', url: 'https://www.facebook.com/xiaoming.hanzi' }],
    category: 'art',
    series: '慢活文字專欄｜每月一字',
    author: { _type: 'reference', _ref: 'author-chen' },
    publishedAt: '2026-04-01',
    tags: ['跟著文字學慢活', '漢字', '禾', '慢活文字專欄'],
    accent: 'sage',
  }

  await client.createOrReplace(doc)
  console.log('已建立草稿：', doc.title, `（圖片 ${figures.length} 張）`)
}

run()
