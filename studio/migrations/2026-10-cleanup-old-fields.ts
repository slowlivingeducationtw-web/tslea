// 2026-10：新版網站上線「之後」才執行，清掉已經沒有作用的舊欄位，
// 避免同事在後台看到「未知欄位」的警告，或改了舊欄位以為會生效。
// （上線前執行的話，舊版網站重新建置時會找不到「關於學會」內文。）
//
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-cleanup-old-fields.ts --with-user-token
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-01-01' })

async function run() {
  const about = await client.getDocument('aboutPage')
  if (!about?.body?.length) throw new Error('aboutPage 還沒有學會簡介內文，先不要清除 homePage.aboutBody')

  const themes = await client.getDocument('themesSection')
  const tx = client
    .transaction()
    .patch('homePage', (p) =>
      p.unset([
        'aboutBody', 'aboutLabel', 'aboutTitle', 'eventsLabel', 'eyebrow',
        'headlineAccent', 'headlineAfter', 'headlineBefore', 'heroTags', 'lead', 'subheadEn',
      ]),
    )
    .patch('eventsPage', (p) => p.unset(['pastTitle', 'recapsTitle']))
    .patch('donatePage', (p) => p.unset(['label']))
    .patch('themesSection', (p) =>
      p.unset(['intro', 'label', 'formats', 'annualTitle', 'annualItems', ...(themes?.themes ?? []).map((t: any) => `themes[_key=="${t._key}"].accent`)]),
    )
  const res = await tx.commit()
  console.log(`完成：${res.results.length} 筆異動`)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
