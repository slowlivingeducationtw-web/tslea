// 建立「跟著文字學慢活——五月・香」草稿（臉書補發文搬上網站；只建草稿，同仁確認後在後台按發布）。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-article-xiang-may.ts --with-user-token -- <圖片資料夾>
import { createReadStream } from 'node:fs'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2021-06-07' })
const dir = process.argv[process.argv.length - 1]
const key = () => randomUUID().replace(/-/g, '').slice(0, 12)

const block = (text: string, style = 'normal', marks: string[] = []) => ({
  _key: key(),
  _type: 'block',
  style,
  markDefs: [],
  children: [{ _key: key(), _type: 'span', marks, text }],
})

async function upload(file: string) {
  const a = await client.assets.upload('image', createReadStream(join(dir, file)), { filename: file })
  return { _type: 'image', asset: { _type: 'reference', _ref: a._id } }
}

async function run() {
  const illus = await upload('751471664_122140367529054578_7244241525059250820_n.jpg')
  const forms = await upload('752786877_122140367457054578_1467948320917631796_n.jpg')
  const illusAlt = '插畫：「我從香港買回來的香很香」，三個「香」分別指地名香港、線香、香味'

  const body = [
    block('上個月我們聊了「禾」，放了個預告說要寫「香」字，無奈 5–6 月太忙，就耽擱至今。', 'note'),
    block('前面幾個月介紹的字都是「象形」字，是「獨體字」，也就是這個字不能拆分，單獨這個字就能表達完整的意思。「香」字是我們介紹的第一個「合體字」，表示這個字是由兩個以上的部件組合而成。'),
    block('合體字有「會意」與「形聲」兩種，「會意」是一個字所拆出的部件都給該字提供了其含義，例如：「香」字拆出「禾」與「日（甘）」兩個部件，「禾」與「甘」都給「香」字提供了他們的部件意義：稻穀與甘美，因此「香」字是個會意字。'),
    block('從甲骨文、金文來看，香的上方是「禾」（有一說是「黍」，「黍」由「禾」與「水」組成），下方是「口」，另有幾點裝飾；到了小篆的字形，《說文解字》：「香，芳也。从黍，从甘。」上面是「黍」，下方的「口」變成了「甘」，表示「黍／穀物」的芳香、甘美；後來「甘」演變成「日」形，成為現在的字形。'),
    {
      _key: key(),
      _type: 'figure',
      image: forms,
      alt: '「香」字的字形演變：甲骨文、金文、小篆、隸書、楷書',
      caption: '本圖引用自「中華語文知識庫——漢字源流」',
    },
    block('古代普遍的「燎祭」是燒柴、祭品以祭天，利用煙、香氣與神溝通；祭祀所用的香酒，叫做「鬯」（ㄔㄤˋ／chàng），以黑黍釀鬱草（一種香草）而成，供宗廟祭祀與降神使用，由此我們可以知道「香氣」的運用年代非常早。'),
    block('「香」字有許多涵義，除了表示美好的氣味以外，「用香料製成棒、線、球、餅狀或粉末，可點燃祭祀或淨化環境」的「香」，更是華人非常熟悉的東西。宋代文人「焚香」成為生活四藝（焚香、點茶、掛畫、插花）之一，是當時的文青沉澱心靈、吟詩會友時一種閒適脫俗的雅事，還逐漸發展出了「香道」。到現在薰香仍是許多人的愛好，帶給人們平靜與恬適。'),
    block('「我從『香』港買回來的『香』很『香』。」如果改用台語唸會發現三個「香」字唸法都不同，因為實際上是代表了三個不同的涵義：第一個「香」字是地名，第二個是拜拜用的「香」，而最後一個「香」字正確應寫作「芳」。南方方言比較古老，我們常常可以藉著方言了解到更多語言文字的歷史。是不是很有意思呢？'),
    { _key: key(), _type: 'figure', image: illus, alt: illusAlt },
    block('其實「香」也是一個部首，香部字都跟香氣有關。您知道有哪些香部字呢？'),
    block('🌿 今天的慢活任務：找到一個讓您感到舒適的香味，也許是點燃線香、也許是捧一束花、或灑一點精油，閉上眼，慢慢地在馨香中呼吸，吸～吐～吸～吐～感受平靜閒適的片刻。', 'normal', ['highlight']),
    block('（我最喜歡台灣紅檜的香氣，您呢？）'),
  ]

  const doc = {
    _id: 'drafts.article-xiang-may',
    _type: 'article',
    title: '跟著文字學慢活——五月・香',
    slug: { _type: 'slug', current: 'xiang-may' },
    excerpt: '「香」是我們介紹的第一個合體字：上面是「禾」，下面是「甘」，稻穀的芳香甘美。從燎祭、香酒到宋代文人焚香，「我從香港買回來的香很香」這句話裡的三個「香」，用台語唸竟然都不一樣？',
    cover: { _type: 'figure', image: illus, alt: illusAlt },
    body,
    links: [{ _key: key(), _type: 'link', title: '📘 facebook 粉專：小明的漢字研究基地', url: 'https://www.facebook.com/xiaoming.hanzi' }],
    category: 'art',
    series: '慢活文字專欄｜每月一字',
    author: { _type: 'reference', _ref: 'author-chen' },
    publishedAt: '2026-05-01',
    tags: ['跟著文字學慢活', '漢字', '香', '香道', '慢活文字專欄'],
    accent: 'sage',
  }

  await client.createOrReplace(doc)
  console.log('已建立草稿：', doc.title)
}

run()
