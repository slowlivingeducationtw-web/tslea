// 選單「活動一覽」比照慢活專欄分層：學會活動介紹／全部活動（底下五個活動類別）／即將開放報名／報名中／活動回顧。
// 類別從後台「學會活動類別」依排列順序帶入。選單沒有草稿流程，直接改正式版（草稿若存在也一起改）。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-nav-events-sub.ts --with-user-token
import { randomUUID } from 'node:crypto'
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-01-01' })
const key = () => randomUUID().replace(/-/g, '').slice(0, 12)

async function run() {
  const types: { title: string; slug: string }[] = await client.fetch(
    `*[_type=="activityType" && defined(slug.current) && !(_id in path("drafts.**"))] | order(order asc){ title, "slug": slug.current }`,
  )
  const EVENTS = [
    { label: '學會活動介紹', href: '/events#types' },
    { label: '全部活動', href: '/events#list' },
    ...types.map((t) => ({ label: t.title, href: `/events?type=${t.slug}#list`, indent: true })),
    { label: '即將開放報名', href: '/events?status=planning#list' },
    { label: '報名中', href: '/events?status=open,free#list' },
    { label: '活動回顧', href: '/events?status=recap#list' },
  ]
  for (const id of ['navigation', 'drafts.navigation']) {
    const nav: any = await client.getDocument(id)
    if (!nav) continue
    const mainNav = (nav.mainNav ?? []).map((item: any) =>
      item.href === '/events' ? { ...item, children: EVENTS.map((c) => ({ _key: key(), _type: 'navSubLink', ...c })) } : item,
    )
    await client.patch(id).set({ mainNav }).commit()
    console.log('已更新', id, `（活動類別 ${types.length} 個）`)
  }
}

run()
