// 選單：子選單項目改用 navSubLink（多了「縮排一層」），並在「慢活專欄」加上慢活小語、活動回顧，
// 各分類縮排在「全部文章」底下。選單沒有草稿流程，直接改正式版（草稿若存在也一起改）。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-nav-column-sub.ts --with-user-token
import { randomUUID } from 'node:crypto'
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-01-01' })
const key = () => randomUUID().replace(/-/g, '').slice(0, 12)

const COLUMN = [
  { label: '全部文章', href: '/column' },
  { label: '身心健康', href: '/column?cat=health', indent: true },
  { label: '藝術陪伴', href: '/column?cat=art', indent: true },
  { label: '生態永續', href: '/column?cat=eco', indent: true },
  { label: '慢旅共學', href: '/column?cat=travel', indent: true },
  { label: '慢活小語', href: '/column?cat=words', indent: true },
  { label: '活動回顧', href: '/column?cat=recap', indent: true },
]

async function run() {
  for (const id of ['navigation', 'drafts.navigation']) {
    const nav: any = await client.getDocument(id)
    if (!nav) continue
    const mainNav = (nav.mainNav ?? []).map((item: any) => {
      const children =
        item.href === '/column'
          ? COLUMN.map((c) => ({
              _key: item.children?.find((x: any) => x.href === c.href)?._key ?? key(),
              _type: 'navSubLink',
              ...c,
            }))
          : item.children?.map((c: any) => ({ ...c, _type: 'navSubLink' }))
      return children ? { ...item, children } : item
    })
    await client.patch(id).set({ mainNav }).commit()
    console.log('已更新', id)
  }
}

run()
