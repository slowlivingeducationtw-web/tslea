// 「跟著氣味學慢活」系列改歸「身心健康」（原本是藝術陪伴）。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-aroma-to-health.ts --with-user-token
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2021-06-07' })

async function run() {
  const ids: string[] = await client.fetch(`*[_type == "article" && title match "跟著氣味學慢活*"]._id`)
  for (const id of ids) {
    const d = await client.patch(id).set({ category: 'health' }).commit()
    console.log(d.title, '→', d.category)
  }
}

run()
