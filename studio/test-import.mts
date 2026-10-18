// 用臉書原文測試匯入規則：npm run test:import
import { readFileSync } from 'node:fs'
import { parseFacebookPost } from './importer/parseFacebookPost'

const today = new Date('2026-10-18')
const cases: [string, Record<string, unknown>][] = [
  ['red-cypress', { title: '跟著氣味學慢活——五月・台灣紅檜', category: 'health', authorName: '郭純嵐（小嵐老師）', publishedAt: '2026-05-01' }],
  ['companionship', { title: '跟著旅人學慢活——陪伴，才是最難安排的行程', category: 'travel', authorName: '楊文鴻（楊導）' }],
  ['camphor', { title: '跟著氣味學慢活——四月・台灣芳樟', category: 'health', publishedAt: '2026-04-01' }],
  ['zhenshi', { title: '真實，不虛', category: 'words', authorName: '臺灣慢活教育學會', series: undefined }],
  ['flying', { title: '慢慢呼吸，慢慢飛翔，很好', category: 'words', authorName: '臺灣慢活教育學會' }],
  ['he', { title: '跟著文字學慢活——四月・禾', category: 'art', publishedAt: '2026-04-01', imageCredit: '圖像引用自《漢字好好教 好好教漢字》部件卡' }],
]

let failed = 0
for (const [name, want] of cases) {
  const p: any = parseFacebookPost(readFileSync(new URL(`./importer/fixtures/${name}.txt`, import.meta.url), 'utf8'), today)
  for (const [k, v] of Object.entries(want)) {
    if (p[k] !== v) { failed++; console.log(`✗ ${name}.${k}：得到 ${JSON.stringify(p[k])}，應為 ${JSON.stringify(v)}`) }
  }
  if (p.paragraphs.some((x: any) => /[#＃]/.test(x.text))) { failed++; console.log(`✗ ${name}：內文還有 #`) }
  if (p.paragraphs.some((x: any) => /[一-鿿] [一-鿿]/.test(x.text))) { failed++; console.log(`✗ ${name}：中文字之間有多餘空格`) }
  if (p.category === 'words') {
    const last = p.paragraphs[p.paragraphs.length - 1]
    if (last?.style !== 'note' || !/^臺灣慢活教育學會　/.test(last.text)) { failed++; console.log(`✗ ${name}：落款沒有變成小字`) }
    if (p.paragraphs[0]?.text.startsWith('「')) { failed++; console.log(`✗ ${name}：標題留在內文`) }
    if (p.warnings.some((w: string) => /系列|作者/.test(w))) { failed++; console.log(`✗ ${name}：不該要求選系列或作者`) }
  }
  if (process.argv.includes('-v')) console.log(name, JSON.stringify(p, null, 1))
}
// 臉書複製時空行夾零寬字元：不能變成空白段落或空白摘要
{
  const raw = readFileSync(new URL('./importer/fixtures/companionship.txt', import.meta.url), 'utf8').replace(/\n\n/g, '\n\u200b\n')
  const p = parseFacebookPost(raw, today)
  if (p.paragraphs.some((x) => !x.text.trim()) || !p.excerpt.trim()) { failed++; console.log('✗ 零寬字元造成空白段落或空白摘要') }
}
console.log(failed ? `${failed} 項不符` : '全部通過')
process.exit(failed ? 1 : 0)
