// 「慢慢呼吸，慢慢○○，很好」三篇（真實、飛翔、對齊）統一放進分類與系列「慢活小語」，
// 並在「慢活專欄」頁的系列簡介加上慢活小語（首頁系列卡片用）。已發布的直接改，草稿若存在也一起改。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-slow-words-series.ts --with-user-token
import { randomUUID } from 'node:crypto'
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-01-01' })

async function run() {
  const ids: string[] = await client.fetch(`*[_type=="article" && title match "慢慢呼吸" && title match "很好"]._id`)
  for (const id of ids) {
    await client.patch(id).set({ category: 'words', series: '慢活小語' }).commit()
    console.log('已更新', id)
  }
  for (const id of ['columnPage', 'drafts.columnPage']) {
    const page: any = await client.getDocument(id)
    if (!page || (page.series ?? []).some((s: any) => s.name === '慢活小語')) continue
    await client
      .patch(id)
      .setIfMissing({ series: [] })
      .append('series', [
        {
          _key: randomUUID().replace(/-/g, '').slice(0, 12),
          _type: 'columnSeries',
          name: '慢活小語',
          title: '慢慢呼吸，慢慢○○，很好',
          intro: '學會在節日與季節交替時寫給大家的慢活短文。每一篇都從一個詞出發：慢慢呼吸，慢慢○○，很好。',
        },
      ])
      .commit()
    console.log('已加上系列簡介', id)
  }
}

run()
