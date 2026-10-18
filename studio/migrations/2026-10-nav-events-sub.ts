// 選單「活動一覽」：學會活動介紹／全部活動／近期活動（籌備中＋報名中）／活動回顧。
// 一度把六個活動類別、即將開放報名、報名中都列進選單（11 項），活動還少、有些類別是空的，2026-10 精簡成 4 項；
// 類別改在活動頁上方的圖示與篩選按鈕找。選單沒有草稿流程，直接改正式版（草稿若存在也一起改）。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-nav-events-sub.ts --with-user-token
import { randomUUID } from 'node:crypto'
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-01-01' })
const key = () => randomUUID().replace(/-/g, '').slice(0, 12)

async function run() {
  const EVENTS = [
    { label: '學會活動介紹', href: '/events#types' },
    { label: '全部活動', href: '/events#list' },
    { label: '近期活動', href: '/events?status=planning,open,free#list' },
    { label: '活動回顧', href: '/events?status=recap#list' },
  ]
  for (const id of ['navigation', 'drafts.navigation']) {
    const nav: any = await client.getDocument(id)
    if (!nav) continue
    const mainNav = (nav.mainNav ?? []).map((item: any) =>
      item.href === '/events' ? { ...item, children: EVENTS.map((c) => ({ _key: key(), _type: 'navSubLink', ...c })) } : item,
    )
    await client.patch(id).set({ mainNav }).commit()
    console.log('已更新', id)
  }
}

run()
