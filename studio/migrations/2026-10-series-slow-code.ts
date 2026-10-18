// 新系列「慢活密碼」：學會在節日、季節交替時發的短文，圖片都是「慢慢呼吸，慢慢○○，很好」。
// 〈真實，不虛〉設成這個系列，並在「慢活專欄」頁的系列簡介加一筆（都寫進草稿，同仁確認後按發布）。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-series-slow-code.ts --with-user-token
import { randomUUID } from 'node:crypto'
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-01-01' })
const SERIES = '慢活密碼'

async function run() {
  await client.patch('drafts.article-zhenshi').set({ series: SERIES }).commit()

  const page: any = await client.getDocument('drafts.columnPage')
  if (!page) throw new Error('找不到「慢活專欄」頁面草稿')
  if (!(page.series ?? []).some((s: any) => s.name === SERIES)) {
    await client
      .patch('drafts.columnPage')
      .setIfMissing({ series: [] })
      .append('series', [
        {
          _key: randomUUID().replace(/-/g, '').slice(0, 12),
          _type: 'columnSeries',
          name: SERIES,
          title: '慢慢呼吸，慢慢○○，很好',
          intro: '學會在節日與季節交替時寫給大家的慢活短文。每一篇都藏著一組密碼：慢慢呼吸，慢慢○○，很好——這一次的密碼是什麼，讀了就知道。',
        },
      ])
      .commit()
  }
  console.log('完成：真實，不虛 → 系列「慢活密碼」，並加上系列簡介')
}

run()
