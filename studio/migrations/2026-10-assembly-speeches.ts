// 首次會員大會（2026-03-21）理監事當選致詞：全文在 migrations/data/2026-assembly-speeches.txt。
// 致詞寫進每位理監事資料的「當選致詞」，顯示在理監事頁（/board#speeches）；名單已發布，直接改正式版。
// 〈首次會員大會〉的活動回顧只放一段說明與連結（寫進草稿，同仁確認後按發布），不重複放全文。
// 之後補交的致詞可以直接在後台那個人的資料裡填，不必再跑這支。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-assembly-speeches.ts --with-user-token
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-01-01' })
const key = () => randomUUID().replace(/-/g, '').slice(0, 12)
const EVENT = 'event-member-assembly-2026'

async function run() {
  const raw = readFileSync(new URL('./data/2026-assembly-speeches.txt', import.meta.url), 'utf8').replace(/\r\n?/g, '\n')
  const speeches = raw
    .split(/^=== /m)
    .slice(1)
    .map((s) => {
      const [name, ...rest] = s.split('\n')
      return { name: name.trim(), text: rest.join('\n').trim() }
    })

  const people: { _id: string; name: string }[] = await client.fetch(
    `*[_type=="person" && term == 1]{ _id, name }`,
  )
  const missing = speeches.filter((s) => !people.some((p) => p.name === s.name))
  if (missing.length) throw new Error(`理監事名單裡找不到：${missing.map((s) => s.name).join('、')}`)

  for (const s of speeches) {
    for (const p of people.filter((p) => p.name === s.name)) await client.patch(p._id).set({ speech: s.text }).commit()
  }
  console.log('已寫入當選致詞：', speeches.length, '位')

  const linkKey = key()
  const recap = [
    {
      _key: key(),
      _type: 'block',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _key: key(),
          _type: 'span',
          marks: [],
          text: '2026 年 3 月 21 日，臺灣慢活教育學會舉辦首次會員大會，選出第一屆理監事。每一位理監事代表都寫下了自己的當選致詞，分享心中的慢活。',
        },
      ],
    },
    {
      _key: key(),
      _type: 'block',
      style: 'normal',
      markDefs: [{ _key: linkKey, _type: 'link', href: '/board#speeches' }],
      children: [{ _key: key(), _type: 'span', marks: [linkKey], text: '閱讀理監事當選致詞 →' }],
    },
  ]
  const base: any = (await client.getDocument(`drafts.${EVENT}`)) ?? (await client.getDocument(EVENT))
  await client.createOrReplace({ ...base, _id: `drafts.${EVENT}`, recap })
  console.log('已更新草稿：', base.title)
}

run()
