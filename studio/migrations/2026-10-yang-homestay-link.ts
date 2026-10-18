// 楊導的兩篇文章文末加上「孟林民宿」粉專連結（台東慢旅行已發布，直接改正式版；陪伴那篇還是草稿）。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-yang-homestay-link.ts --with-user-token
import { randomUUID } from 'node:crypto'
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2021-06-07' })
const link = () => ({
  _key: randomUUID().replace(/-/g, '').slice(0, 12),
  _type: 'link',
  title: '📘 facebook 粉專：孟林民宿',
  url: 'https://www.facebook.com/scotthomestaytaitung',
})

async function run() {
  for (const id of ['article-taitung-slow-travel', 'drafts.article-companionship']) {
    await client.patch(id).setIfMissing({ links: [] }).append('links', [link()]).commit()
    console.log('已加上連結：', id)
  }
}

run()
