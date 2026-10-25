// 英文版的建置檢查：npm run build 之後執行 npm run check:i18n
// (a) 每個中文頁都有 /en 對應頁
// (b) 中文頁和改版前的基準（.work/dist-before，見 docs/superpowers/plans/2026-10-25-english-site.md Task 0）文字、連結相同
// (c) noindex 的頁不在 sitemap，其餘都在
// (d) /en/board-area 是 noindex
// (e) 英文頁的站內連結都留在 /en 底下
// 另外列出「已翻譯的英文頁裡還有一長串中文」的地方，供人工檢查（不擋）
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const DIST = 'dist'
const BEFORE = '.work/dist-before'
const SITE = 'https://slowlivingeducation.org'
const zhOnly = process.argv.includes('--zh-only')

const walk = (d) =>
  readdirSync(d).flatMap((f) => {
    const p = join(d, f)
    if (statSync(p).isDirectory()) return f === '_astro' ? [] : walk(p)
    return p.endsWith('.html') ? [p] : []
  })
const rel = (f, root = DIST) => relative(root, f).split(sep).join('/')
const read = (f) => readFileSync(f, 'utf8')
const isRedirect = (h) => /<meta http-equiv="refresh"/i.test(h)
const isNoindex = (h) => /<meta name="robots" content="noindex/i.test(h)
// 網址 ↔ 檔案（build.format 'file'：/about → about.html，/ → index.html，/en → en.html）
const urlOf = (r) => '/' + r.replace(/\.html$/, '').replace(/(^|\/)index$/, '')

// 只比內容區（頁首有新的切換鈕、頁尾不比），script、style 拿掉，連結保留網址
function content(h) {
  const i = h.indexOf('<div class="page"')
  const j = h.lastIndexOf('<footer')
  return (i >= 0 ? h.slice(i, j > i ? j : undefined) : h)
    .replace(/<script\b[\s\S]*?<\/script>/g, '')
    .replace(/<style\b[\s\S]*?<\/style>/g, '')
    .replace(/<a\b[^>]*?href="([^"]*)"[^>]*>/g, ' [$1] ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
const head = (h) =>
  [/<title>[\s\S]*?<\/title>/, /<meta name="description"[^>]*>/, /<link rel="canonical"[^>]*>/].map((re) => h.match(re)?.[0] ?? '').join('\n')

let failed = 0
const fail = (msg) => { failed++; console.log('✗ ' + msg) }

const files = walk(DIST)
const zh = files.filter((f) => !rel(f).startsWith('en/') && rel(f) !== 'en.html')
const en = files.filter((f) => rel(f).startsWith('en/') || rel(f) === 'en.html')

// (b)
if (!existsSync(BEFORE)) fail(`找不到基準 ${BEFORE}`)
else
  for (const f of zh) {
    const r = rel(f)
    const b = join(BEFORE, r)
    if (!existsSync(b)) { console.log(`· 新的中文頁 ${r}（基準沒有）`); continue }
    const now = read(f), was = read(b)
    if (head(now) !== head(was)) fail(`${r} 的標題／說明／canonical 變了`)
    const x = content(now), y = content(was)
    if (x !== y) {
      let k = 0
      while (x[k] === y[k]) k++
      fail(`${r} 內容變了\n    現在：${x.slice(Math.max(0, k - 80), k + 80)}\n    之前：${y.slice(Math.max(0, k - 80), k + 80)}`)
    }
  }

if (!zhOnly) {
  // (a)
  for (const f of zh) {
    if (isRedirect(read(f))) continue
    const r = rel(f)
    const e = r === 'index.html' ? 'en.html' : 'en/' + r
    if (!existsSync(join(DIST, e))) fail(`${r} 沒有英文版 ${e}`)
  }

  // (c)
  const sitemap = readdirSync(DIST).filter((f) => /^sitemap-\d+\.xml$/.test(f)).map((f) => read(join(DIST, f))).join('\n')
  const listed = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, '') || '/'))
  for (const f of files) {
    const h = read(f)
    if (isRedirect(h)) continue
    const u = urlOf(rel(f)) || '/'
    if (isNoindex(h) && listed.has(u)) fail(`${u} 是 noindex 卻在 sitemap`)
    if (!isNoindex(h) && !listed.has(u)) fail(`${u} 不在 sitemap`)
  }

  // (d)
  const ba = join(DIST, 'en/board-area.html')
  if (!existsSync(ba) || !isNoindex(read(ba))) fail('en/board-area 不是 noindex')

  // (e)
  const OK = /^\/(en(\/|$|[?#])|images\/|_astro\/|favicon|apple-touch-icon)|\.[a-z0-9]+([?#]|$)/i
  for (const f of en) {
    const h = read(f).replace(/<link rel="alternate"[^>]*>/g, '').replace(/<a [^>]*data-lang-link[^>]*>/g, '')
    for (const m of h.matchAll(/<a\b[^>]*?href="(\/[^"]*)"/g))
      if (!OK.test(m[1]) && !m[1].startsWith('//')) fail(`${rel(f)} 有連回中文站的連結 ${m[1]}`)
  }

  // 只印不擋：已翻譯的英文頁裡連續 20 字以上的中文
  for (const f of en) {
    const h = read(f)
    if (isNoindex(h)) continue
    const runs = content(h).match(/[㐀-鿿＀-￯，。、「」：；！？（）《》・ ]{20,}/g)
    if (runs) console.log(`· ${rel(f)} 還有中文：${runs.slice(0, 3).map((s) => s.trim().slice(0, 40)).join(' ／ ')}`)
  }
}

console.log(failed ? `${failed} 項不符` : '全部通過')
process.exit(failed ? 1 : 0)
