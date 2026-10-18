// 「頁面文案 → 慢活專欄」加上三個專欄系列的小簡介（寫進草稿，同仁確認後按發布）。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-column-series-intros.ts --with-user-token
import { randomUUID } from 'node:crypto'
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-01-01' })
const key = () => randomUUID().replace(/-/g, '').slice(0, 12)

const series = [
  {
    name: '慢活文字專欄｜每月一字',
    title: '跟著文字學慢活',
    intro: '《漢字好好教 好好教漢字》作者之一陳玉明（小明老師），每月帶讀一個漢字，從甲骨文到楷書看古人怎麼造字，也在字裡找到慢下來的生活提醒。',
  },
  {
    name: '慢活文字專欄｜每月一味',
    title: '跟著氣味學慢活',
    intro: '三義茅鄉炭坊的郭純嵐（小嵐老師），每月選一種植物香氣，分享它的故事與生活配方，練習用嗅覺照顧自己、好好呼吸。',
  },
  {
    name: '慢活文字專欄｜每月一遊',
    title: '跟著旅人學慢活',
    intro: '資深領隊導遊、台東民宿主人楊文鴻（楊導），分享旅途中遇見的人與故事，看見用心旅行如何改變生活的節奏。',
  },
]

async function run() {
  const draft = await client.getDocument('drafts.columnPage')
  const base = draft ?? (await client.getDocument('columnPage'))
  if (!base) throw new Error('找不到「慢活專欄」頁面')
  await client.createOrReplace({
    ...base,
    _id: 'drafts.columnPage',
    series: series.map((s) => ({ _key: key(), _type: 'columnSeries', ...s })),
  })
  console.log(draft ? '已更新既有草稿' : '已從正式版建立草稿', '：專欄系列簡介 3 筆')
}

run()
