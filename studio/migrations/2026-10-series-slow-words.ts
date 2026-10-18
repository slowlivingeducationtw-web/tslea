// 「慢活小語」：學會在節日、季節交替時發的短文（圖片都是「慢慢呼吸，慢慢○○，很好」）。
// 原本開成系列「慢活密碼」，後來改成獨立的分類「慢活小語」（words），所以：
//   〈真實，不虛〉分類改成慢活小語、拿掉系列；「慢活專欄」頁的系列簡介移除「慢活密碼」那筆
//   （分類與系列同名會在專欄頁出現兩顆一樣的按鈕）。有草稿改草稿，已發布的直接改正式版。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-series-slow-words.ts --with-user-token
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-01-01' })

// 草稿和正式版都在的話兩邊都改，才不會發布草稿時又變回去
async function both(id: string) {
  const docs = await Promise.all([client.getDocument(`drafts.${id}`), client.getDocument(id)])
  return docs.filter(Boolean) as any[]
}

async function run() {
  for (const d of await both('article-zhenshi')) await client.patch(d._id).set({ category: 'words' }).unset(['series']).commit()

  let removed = 0
  for (const page of await both('columnPage')) {
    const old = (page.series ?? []).filter((s: any) => s.name === '慢活密碼' || s.name === '慢活小語')
    removed += old.length
    if (old.length) await client.patch(page._id).unset(old.map((s: any) => `series[_key=="${s._key}"]`)).commit()
  }
  console.log('完成：真實，不虛 → 分類「慢活小語」；移除系列簡介', removed, '筆')
}

run()
