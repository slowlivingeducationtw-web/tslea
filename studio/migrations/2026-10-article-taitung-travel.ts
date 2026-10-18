// 建立「跟著旅人學慢活——用心去旅行，會改變生活節奏」草稿（臉書貼文搬上網站），並新增作者楊文鴻。
// 作者直接發布：作者只有草稿的話，引用他的文章會發布失敗（2026-10 放映側記踩過）。文章只建草稿，同仁確認後按發布。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-article-taitung-travel.ts --with-user-token -- <圖片資料夾>
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

async function figure(file: string, alt: string, caption?: string) {
  const a = await client.assets.upload('image', createReadStream(join(dir, file)), { filename: file })
  return { _key: key(), _type: 'figure', image: { _type: 'image', asset: { _type: 'reference', _ref: a._id } }, alt, ...(caption ? { caption } : {}) }
}

async function run() {
  await client.createIfNotExists({
    _id: 'author-yang',
    _type: 'author',
    name: '楊文鴻（楊導）',
    title: '臺灣慢活教育學會創會會員・資深專業領隊及導遊',
    initial: '楊',
    accent: 'earth',
    bio: '資深專業領隊及導遊，任職仁愛國際旅行社。',
  })

  const coast = await figure('coast.jpg', '台東海岸邊的大草原，大樹下望向太平洋，藍天白雲')
  const expo = await figure('expo.jpg', '2026 台東博覽會主視覺：藍色天空下的熱氣球與「台東博覽會 TAITUNG EXPO 2026」字樣', '2026 台東博覽會主視覺')
  const slogan = await figure('slogan.jpg', '台東海邊草地上，旅人坐在長椅望海，畫面寫著「SLOW FOR LIFE #Nature #Flavors #Motion」', '台東博覽會標語：SLOW FOR LIFE')
  const balloon = await figure('balloon.jpg', '三格藍色插圖：慢經濟的種子、滋養各地希望、熱氣球緩緩升空，展開驚嘆旅程', '台東博覽會：自然的孕育、人文的積累、Amazing Taitung 綻放精彩')

  const body = [
    block('筆者回顧這一生，過往就像一部電影，一幕幕在腦海中浮現。'),
    block('今年台東博覽會以「慢經濟」為主軸，以博覽會形式，結合熱氣球活動，於暑假期間推出，將台東這幾年推動慢經濟成果，以台東市區為展場，並以無圍牆形式展出。'),
    expo,
    block('在充滿 AI 產物求快的年代，凡事講求效率、產值，時間就是金錢。「慢與溫度」在台東反而發展出自成一格的生活風格，「慢」可以創造經濟發展，顛覆了傳統思維，這都來自台東將「缺點」變「優點」。'),
    block('在接待來台東旅遊的旅人時，筆者常與旅人分享，台東是「人抾賰的」（台語）。因為地形地勢，台東對外交通不便，旅人到花蓮造訪太魯閣峽谷，折返台北，或是搭車經過台東直達墾丁，偶爾有 1–2 位懷著好奇心停留一晚，稱台東是「人抾賰的」實在不為過。也是這個缺點，台東沒有被過度商業開發，在這幾年大家的努力下，台東反而成為慢經濟城市的首選。'),
    block('十年河東，十年河西。', 'blockquote'),
    block('疫情前，台東縣政府就在推動慢經濟，長期累積的慢能量，在疫情爆發後，所有人的生活被迫按下暫停鍵，生活步調不得不慢下來。台東的好山好水好健康，反而成了疫情後加速發展的慢經濟指標。'),
    slogan,
    block('時至今日，越來越多人開始反思，每天處在高壓的工作環境，犧牲健康付出生命代價，甚至形成「人在天堂，錢在銀行」的景象，令人不勝唏噓！'),
    block('許多人從台東的「慢」一點一滴找回失去的自我。'),
    block('近幾年台東也逐漸吸引西部上班族、退休族來台東長住，最後移居台東。甚至吸引更多外出青年返鄉或移居台東創業，這樣的故事，不管在海岸線、縱谷線及南迴線，比比皆是。'),
    balloon,
    block('曾經接待華裔美籍家庭一家四口人，短短三天兩夜，大家都很享受台東的「慢」，兩位在家自學的小孩，特別喜歡台東的海灘。'),
    block('遊程期間，家人間約定每天 10 點前不出門，僅是為了把握早餐相聚的時光，讓家庭教育延續至外出旅遊的一部份。'),
    coast,
    block('回顧這些故事，無非就是想跟大家說：「用心去旅行，真的會改變你的生活節奏。」', 'normal', ['highlight']),
    block('歡迎各位旅人 7/3–8/20 來台東參觀博覽會，已經愛上台東的旅人一定要來，還不太認識台東的旅人更應該要來。'),
    block('提醒🔔 台東的土很黏，不小心愛上台東的慢生活，退休族可能會移居，未婚的青年男女，也可能五子登科喔！', 'note'),
  ]

  const doc = {
    _id: 'drafts.article-taitung-slow-travel',
    _type: 'article',
    title: '跟著旅人學慢活——用心去旅行，會改變生活節奏',
    slug: { _type: 'slug', current: 'taitung-slow-travel' },
    excerpt: '今年台東博覽會以「慢經濟」為主軸。曾被說是「人抾賰的」台東，因為沒被過度開發，反而成為慢經濟城市的首選——用心去旅行，真的會改變你的生活節奏。',
    cover: { _type: 'figure', image: coast.image, alt: coast.alt },
    body,
    category: 'travel',
    series: '慢活文字專欄｜每月一遊',
    author: { _type: 'reference', _ref: 'author-yang' },
    publishedAt: '2026-07-01',
    tags: ['跟著旅人學慢活', '台東', '慢經濟', '台東博覽會', '慢活文字專欄'],
    accent: 'earth',
  }

  await client.createOrReplace(doc)
  console.log('已建立草稿：', doc.title)
}

run()
