// 把臉書「慢活文字專欄」貼文（整段複製）拆成文章欄位。純文字規則、不用 AI，
// 所以只認得學會固定的貼文格式：
//   開頭「慢活文字專欄｜每月一X，跟著X學慢活」
//   ╴╴╴ 分隔線
//   內文（# 標籤會拿掉 #，只留文字）
//   ╴╴╴ 分隔線
//   「編寫 / 姓名 / 稱銜」、「facebook 粉專：XXX」、「圖像引用自……」
//   文末的 #跟著X學慢活、#臺灣慢活教育學會
// 另一種是學會名義的「慢活小語」（照第一篇〈真實，不虛〉的格式）：
//   開頭「 標題 」（可有可無）、內文、結尾「慢慢呼吸／慢慢○○／很好」與「臺灣慢活教育學會 感恩祝福」
//   → 分類慢活小語、作者臺灣慢活教育學會，不用選系列
// 認不出來的地方放進 warnings，讓同仁在後台補。

export type Paragraph =
  | { kind: 'text'; text: string; style: 'normal' | 'note' | 'h4'; highlight?: boolean }
  | { kind: 'verse'; text: string }

export interface ParsedPost {
  title: string
  series?: string
  /** 網址代稱的開頭；慢活小語沒有系列但也用這個（words-2026-02） */
  seriesKey?: 'word' | 'scent' | 'travel' | 'words'
  category: string
  accent: string
  authorName?: string
  pageNames: string[]
  imageCredit?: string
  paragraphs: Paragraph[]
  excerpt: string
  tags: string[]
  publishedAt: string
  warnings: string[]
}

const SERIES = {
  每月一字: { key: 'word', category: 'art', accent: 'sage', prefix: '跟著文字學慢活' },
  每月一味: { key: 'scent', category: 'health', accent: 'earth', prefix: '跟著氣味學慢活' },
  每月一遊: { key: 'travel', category: 'travel', accent: 'earth', prefix: '跟著旅人學慢活' },
} as const

const MONTHS = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']

const isSeparator = (l: string) => /^[╴─—\-_=~.。・]{5,}$/.test(l)
const isHashtagLine = (l: string) => /^[#＃]/.test(l)
// 「 • 純精油濃度高……」這種項目符號行，放進網站時變成註解小字（同六月・爪哇香茅的小提醒）
const BULLET = /^[•・●▪◦‧\-–]\s*/
// 「✨ 小提醒」這種短短的小標
const isMiniHeading = (l: string) => /^(✨|🔔|📌|💡)?\s*(小提醒|提醒|注意事項|使用方式|配方)[：:]?$/.test(l)
// 拿掉 #，順便清掉 hashtag 前後為了斷詞留下的空格（「因為 #母親節 的關係」→「因為母親節的關係」）
const CJK = '[\\u3000-\\u9fff\\uff00-\\uffef]'
const stripTags = (s: string) =>
  s
    .replace(/[#＃](?=\S)/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(new RegExp(`(${CJK}) (?=${CJK})`, 'g'), '$1')
    .trim()
const pad = (n: number) => String(n).padStart(2, '0')

// 標題裡的「五月」→ 5；年份取最近一次的那個月（十月時看到「十一月」＝去年）
function dateFromMonth(month: number, today: Date) {
  const y = month > today.getMonth() + 1 ? today.getFullYear() - 1 : today.getFullYear()
  return `${y}-${pad(month)}-01`
}

export function parseFacebookPost(raw: string, today = new Date()): ParsedPost {
  const warnings: string[] = []
  // 臉書複製出來的空行常夾著看不見的零寬字元（U+200B），不清掉會變成空白段落、空白摘要
  const lines = raw
    .replace(/\r\n?/g, '\n')
    .replace(/[\u200b-\u200d\u2060\ufeff]/g, '')
    .replace(/\u00a0/g, ' ')
    .split('\n')
    .map((l) => l.trim())

  // ── 開頭：系列，或慢活小語的「 標題 」 ──
  let series: string | undefined
  let meta: (typeof SERIES)[keyof typeof SERIES] | undefined
  const head = lines.find((l) => l)
  const sm = head?.match(/慢活文字專欄\s*[｜|]\s*(每月一.)/)
  const bracketTitle = head?.match(/^「\s*(.+?)\s*」$/)?.[1]
  // 慢活小語：結尾有「慢慢呼吸／慢慢○○／很好」或「臺灣慢活教育學會 感恩祝福」
  const codeAt = lines.findIndex((l, i) => l === '慢慢呼吸' && /^慢慢\S+$/.test(lines[i + 1] ?? '') && /^很好[。！]?$/.test(lines[i + 2] ?? ''))
  const code = codeAt >= 0 ? lines[codeAt + 1].replace(/^慢慢/, '') : undefined
  const signOff = lines.findIndex((l) => /^臺灣慢活教育學會\s*(感恩祝福|祝福|敬上)/.test(l))
  const words = !sm && (codeAt >= 0 || signOff >= 0)
  if (sm && sm[1] in SERIES) {
    meta = SERIES[sm[1] as keyof typeof SERIES]
    series = `慢活文字專欄｜${sm[1]}`
  } else if (!words) {
    warnings.push('第一行認不出是哪個專欄系列，請手動選「分類」與「系列」。')
  }

  // ── 結尾：作者區塊（最後一個「編寫 /」之後都是作者資訊） ──
  const credit = lines.findIndex((l) => /^(編寫|撰文|文)\s*[\/／]/.test(l))
  let authorName: string | undefined
  const pageNames: string[] = []
  let imageCredit: string | undefined
  let bodyEnd = lines.length
  if (words) {
    authorName = '臺灣慢活教育學會'
  } else if (credit >= 0) {
    bodyEnd = credit
    authorName = lines[credit].split(/[\/／]/)[1]?.trim()
    for (const l of lines.slice(credit + 1)) {
      const pm = l.match(/(?:facebook|臉書|FB)\s*粉[專絲]頁?\s*[：:]\s*(.+)$/i)
      if (pm) pageNames.push(pm[1].trim())
      if (/^圖[像片]?(引用|來源|出處)/.test(l)) imageCredit = l.replace(/[（(]如附圖[)）]/, '').trim()
    }
  } else {
    warnings.push('找不到「編寫 / 姓名」，請手動選「作者」。')
  }

  // ── 內文：開頭那行（系列或「 標題 」）之後到作者區塊之前；認不出的開頭就是內文第一段 ──
  const start = head && (sm || bracketTitle) ? lines.indexOf(head) + 1 : 0
  let body = lines.slice(start, bodyEnd)
  while (body.length && (!body[body.length - 1] || isSeparator(body[body.length - 1]))) body.pop()

  // 標題：明寫的「跟著X學慢活——……」、《書名號標題》，或「X年X月份，我們來認識「X」字」
  let title = words ? bracketTitle ?? (code ? `慢慢呼吸，慢慢${code}，很好` : '') : ''
  let month: number | undefined
  let year: number | undefined
  const titleAt = body.findIndex((l) => /^跟著.{1,4}學慢活\s*[—–\-－]{1,3}/.test(l) || /^《.+》$/.test(l))
  if (titleAt >= 0) {
    const t = body[titleAt]
    title = /^《/.test(t)
      ? `${meta?.prefix ?? '慢活專欄'}——${t.replace(/^《\s*|\s*》$/g, '')}`
      : t.replace(/\s*[—–\-－]{1,3}\s*/, '——').replace(/[·．･]/g, '・')
    body.splice(titleAt, 1)
  }
  const ym = body.join('\n').match(/(\d{4})\s*年\s*(\d{1,2})\s*月份?[^\n]*?「[#＃]?([^」]{1,4})」字/)
  if (ym) {
    year = +ym[1]
    month = +ym[2]
    if (!title) title = `${meta?.prefix ?? '跟著文字學慢活'}——${MONTHS[month - 1]}月・${ym[3]}`
  }
  if (!month) {
    const mm = title.match(/——\s*(十[一二]?|[一二三四五六七八九])月/)
    if (mm) month = MONTHS.indexOf(mm[1]) + 1
  }
  if (!title) {
    title = meta?.prefix ? `${meta.prefix}——` : ''
    warnings.push('認不出標題，請手動補完「標題」。')
  }
  // 那句「2026年4月份，我們來認識「禾」字。」已經變成標題和日期，不必留在內文
  if (ym) body = body.filter((l) => !(/^\d{4}\s*年\s*\d{1,2}\s*月份?/.test(l) && l.length <= 30))

  let publishedAt: string
  if (month && year) publishedAt = `${year}-${pad(month)}-01`
  else if (month) publishedAt = dateFromMonth(month, today)
  else {
    publishedAt = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
    warnings.push('貼文沒寫月份，「發布日期」先填今天，請改成臉書發文的月份。')
  }

  // 分段：空行隔開；整段都是短句＝詩體（保留換行），否則一行一段
  const paragraphs: Paragraph[] = []
  const tagWords: string[] = []
  const groups: string[][] = [[]]
  for (const l of body) {
    if (!l || isSeparator(l)) groups.push([])
    else groups[groups.length - 1].push(l)
  }
  const blocks = groups.filter((g) => g.length)

  // 文末單獨的 # 標籤行：系列標籤丟掉，其他（例如下期預告）變註解小字
  while (blocks.length && blocks[blocks.length - 1].every(isHashtagLine)) {
    const g = blocks.pop()!
    const kept = g.filter((l) => !/^[#＃](跟著.{1,4}學慢活|臺灣慢活教育學會|台灣慢活教育學會)$/.test(l))
    tagWords.unshift(...kept.map(stripTags))
  }

  for (const g of blocks) {
    const texts = g.map(stripTags).filter(Boolean)
    if (!texts.length) continue
    const hasBullets = texts.some((t) => BULLET.test(t))
    if (texts.length > 1 && !hasBullets && texts.every((t) => t.length <= 40)) {
      paragraphs.push({ kind: 'verse', text: texts.join('\n') })
      continue
    }
    for (const t of texts) {
      // 慢活小語的落款「臺灣慢活教育學會 感恩祝福」→ 註解小字
      if (words && /^臺灣慢活教育學會/.test(t)) {
        paragraphs.push({ kind: 'text', text: t.replace(/^臺灣慢活教育學會\s*/, '臺灣慢活教育學會　'), style: 'note' })
        continue
      }
      if (isMiniHeading(t)) {
        paragraphs.push({ kind: 'text', text: t, style: 'h4' })
        continue
      }
      if (BULLET.test(t)) {
        paragraphs.push({ kind: 'text', text: t.replace(BULLET, ''), style: 'note' })
        continue
      }
      const highlight = /^(🌿|🌾|✨)?\s*(今天的)?慢活任務/.test(t)
      const note = /^(提醒|小提醒|✨\s*小提醒|附註|備註)/.test(t)
      paragraphs.push({ kind: 'text', text: t, style: note ? 'note' : 'normal', ...(highlight ? { highlight } : {}) })
    }
  }
  if (tagWords.length) paragraphs.push({ kind: 'text', style: 'note', text: tagWords.join('　') })

  if (!paragraphs.length) warnings.push('沒有抓到內文，請確認貼上的是完整貼文。')

  // 摘要：從開頭的一般文字／詩體接起來，至少 50 字（「春天來了～」這種開場太短），太長截斷
  let excerpt = ''
  for (const p of paragraphs) {
    if (excerpt.length >= 50) break
    if (p.kind === 'verse' || (p.kind === 'text' && p.style === 'normal')) excerpt += p.text.replace(/\n+/g, '')
  }
  if (excerpt.length > 120) excerpt = excerpt.slice(0, 118) + '……'

  const tags = words
    ? ['慢活小語', '慢慢呼吸', code].filter(Boolean) as string[]
    : ([meta?.prefix, '慢活文字專欄'].filter(Boolean) as string[])

  return {
    title,
    series,
    seriesKey: words ? 'words' : meta?.key,
    category: words ? 'words' : meta?.category ?? 'other',
    accent: meta?.accent ?? 'sage',
    authorName,
    pageNames,
    imageCredit,
    paragraphs,
    excerpt,
    tags,
    publishedAt,
    warnings,
  }
}
