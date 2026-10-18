// 用和後台「從臉書貼文匯入」按鈕相同的規則，從文字檔建立專欄文章草稿（不發布）。
// 執行（在 studio/ 底下）：npx sanity exec migrations/import-facebook-post.ts --with-user-token -- <貼文.txt> [圖片檔…]
// 第一張圖片當封面；替代文字建好後再到後台補。
import { createReadStream, readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { getCliClient } from 'sanity/cli'
import { parseFacebookPost } from '../importer/parseFacebookPost'
import { articleFields, toFigures } from '../importer/buildArticle'

const client = getCliClient({ apiVersion: '2024-01-01' })
const args = process.argv.slice(2)
const text = args.find((f) => /\.txt$/i.test(f))
const images = args.filter((f) => /\.(jpe?g|png|webp)$/i.test(f))

async function run() {
  if (!text) throw new Error('請給貼文的 .txt 檔')
  const p = parseFacebookPost(readFileSync(text, 'utf8'))
  const id = `drafts.article-${p.seriesKey ?? 'post'}-${p.publishedAt.slice(0, 7)}`
  const existing = await client.getDocument(id)

  const ids: string[] = []
  for (const f of images) ids.push((await client.assets.upload('image', createReadStream(f), { filename: basename(f) }))._id)
  const { fields, notes } = await articleFields(client, p, toFigures(p, ids), {
    docId: id,
    currentSlug: (existing as any)?.slug?.current,
  })

  await client.createOrReplace({ _id: id, _type: 'article', ...fields })
  console.log('已建立草稿：', fields.title, `（${id}）`)
  for (const n of notes) console.log('・', n)
}

run()
