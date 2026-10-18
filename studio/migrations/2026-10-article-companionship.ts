// 建立「跟著旅人學慢活——陪伴，才是最難安排的行程」草稿（臉書貼文搬上網站；作者楊文鴻已存在，只建草稿）。
// 照片先裁掉臉書圖的白框與學會 logo 再上傳。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-article-companionship.ts --with-user-token -- <圖片檔>
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

async function run() {
  const a = await client.assets.upload('image', createReadStream(file), { filename: basename(file) })
  const image = { _type: 'image', asset: { _type: 'reference', _ref: a._id } }
  const alt = '從草坡上俯瞰澎湖七美雙心石滬，兩個心形石滬靜靜躺在碧綠的海灣裡，遠方海平線上有幾座小島'

  const body = [
    block('疫情是我們最好的老師。時間推移至 2020 年，筆者毅然決然帶著黃如玲返回台東，經營在地小旅行及民宿，每天下班可以回家陪伴黃如玲，彌補過去長時間外出帶團不在家，而留下的空白時光，同時將生活步調慢下來。'),
    block('回顧筆者生命歷程，投入旅遊業之前，圍繞在以自我為中心，汲汲營營追求自己的成就，宛如陀螺般不斷地旋轉，生活步調停不下來，完全忽略了陪伴家人也是生命中重要的事。'),
    block('筆者國中畢業負笈外縣市求學，高中畢業後，即從軍開啟職業軍人生涯，退伍後壯遊美國兩年，為了圓環遊世界的夢想，再轉職投入國際貿易的領域，繞著地球轉當起空中飛人。當時的心境，凡事求快求完美，即使路過很多美景，也無暇欣賞。'),
    { _key: key(), _type: 'figure', image, alt },
    block('期間看見母親年事已高，又在思考從事什麼樣的工作，才能兼顧陪伴母親晚年生活。自我盤點能力及評估未來發展，決定轉換跑道至旅遊業放手一搏，想不到此念一轉，竟然走出自己一片天。'),
    block('遇見牽手黃如玲後，有強大後勤支援及平台，事業更是如虎添翼。由於跳脫朝九晚五的工作框架，掌控自己的時間主控權，讓「陪伴」的行程更容易安排，最後用更多時間，陪伴母親走完人生最後一哩路。意想不到，「陪伴」竟然讓時間慢下來，也讓自己的心定下來。'),
    block('決定用餘生陪伴並牽手黃如玲，好好地且慢慢地享受生活。請問各位看倌，有多久沒有好好陪伴你的家人？'),
    block('不要讓「陪伴」成為最難安排的行程。', 'normal', ['highlight']),
  ]

  const doc = {
    _id: 'drafts.article-companionship',
    _type: 'article',
    title: '跟著旅人學慢活——陪伴，才是最難安排的行程',
    slug: { _type: 'slug', current: 'companionship' },
    excerpt: '從職業軍人、國際貿易的空中飛人，到回台東經營小旅行與民宿。楊導發現，「陪伴」竟然讓時間慢下來，也讓自己的心定下來——有多久沒有好好陪伴你的家人？',
    cover: { _type: 'figure', image, alt },
    body,
    category: 'travel',
    series: '慢活文字專欄｜每月一遊',
    author: { _type: 'reference', _ref: 'author-yang' },
    publishedAt: '2026-05-01',
    tags: ['跟著旅人學慢活', '陪伴', '台東', '澎湖', '慢活文字專欄'],
    accent: 'earth',
  }

  await client.createOrReplace(doc)
  console.log('已建立草稿：', doc.title)
}

run()
