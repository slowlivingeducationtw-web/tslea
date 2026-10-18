// 新增學會活動類別「慢活論壇」，〈苗栗青年藝術論壇〉歸到這一類，並加進選單「活動一覽 → 全部活動」底下。
// 類別直接發布（選單與活動頁篩選要用得到）；說明是初稿，同仁可在後台改。圖示圖片待補（先用 emoji）。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-activity-forum.ts --with-user-token
import { randomUUID } from 'node:crypto'
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-01-01' })
const key = () => randomUUID().replace(/-/g, '').slice(0, 12)

async function run() {
  await client.createIfNotExists({
    _id: 'activity-forum',
    _type: 'activityType',
    title: '慢活論壇',
    slug: { _type: 'slug', current: 'forum' },
    icon: '💬',
    order: 60,
    description: '邀請不同領域的講者與在地夥伴同台對話，從教育、藝術到地方生活，交流慢活的實踐與想像，讓更多人看見放慢腳步帶來的改變。',
  })

  for (const id of ['event-miaoli-art', 'drafts.event-miaoli-art']) {
    const ev: any = await client.getDocument(id)
    if (ev && !ev.activityType) await client.patch(id).set({ activityType: { _type: 'reference', _ref: 'activity-forum' } }).commit()
  }

  for (const id of ['navigation', 'drafts.navigation']) {
    const nav: any = await client.getDocument(id)
    if (!nav) continue
    const mainNav = (nav.mainNav ?? []).map((item: any) => {
      if (item.href !== '/events' || item.children?.some((c: any) => /type=forum/.test(c.href))) return item
      const children = [...item.children]
      const after = children.findIndex((c: any) => /type=talk/.test(c.href))
      children.splice(after + 1, 0, { _key: key(), _type: 'navSubLink', label: '慢活論壇', href: '/events?type=forum#list', indent: true })
      return { ...item, children }
    })
    await client.patch(id).set({ mainNav }).commit()
  }
  console.log('完成：慢活論壇')
}

run()
