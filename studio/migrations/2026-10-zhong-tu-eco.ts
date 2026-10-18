// 《種土》放映側記：除了「活動回顧」，也放進慢活專欄的「生態永續」（活動的「也放進專欄分類」）。
// 已發布的直接改正式版，草稿若存在也一起改。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-zhong-tu-eco.ts --with-user-token
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-01-01' })

async function run() {
  for (const id of ['event-zhong-tu-screening', 'drafts.event-zhong-tu-screening']) {
    if (!(await client.getDocument(id))) continue
    await client.patch(id).set({ columnCategories: ['eco'] }).commit()
    console.log('已更新', id)
  }
}

run()
