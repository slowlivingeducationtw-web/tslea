// 把 parseFacebookPost 的結果變成專欄文章欄位：找作者、粉專網址、網址代稱、排圖片。
// 後台按鈕（ImportFacebookAction）和命令列腳本（migrations/import-facebook-post.ts）共用，規則只寫一份。
import type { SanityClient } from '@sanity/client'
import type { ParsedPost } from './parseFacebookPost'

export const key = () => Math.random().toString(36).slice(2, 14)

const block = (text: string, style = 'normal', marks: string[] = []) => ({
  _key: key(),
  _type: 'block',
  style,
  markDefs: [],
  children: [{ _key: key(), _type: 'span', text, marks }],
})

export type Figure = { _key: string; _type: 'figure'; image: any; caption?: string }

// 圖片放哪裡：每月一字的部件卡（2～3 張）並排放文末，和三月・木一樣；
// 其他的一張放文末，多張平均穿插在段落之間。
export function buildBody(p: ParsedPost, figures: Figure[]) {
  const text: any[] = p.paragraphs.map((x) =>
    x.kind === 'verse'
      ? { _key: key(), _type: 'verse', text: x.text }
      : block(x.text, x.style, x.highlight ? ['highlight'] : []),
  )
  if (!figures.length) return text
  if (p.seriesKey === 'word' && figures.length >= 2 && figures.length <= 3) {
    const row: any = { _key: key(), _type: 'imageRow', images: figures.map(({ caption, ...f }) => f) }
    if (p.imageCredit) row.caption = p.imageCredit
    return [...text, row]
  }
  if (figures.length === 1) return [...text, figures[0]]
  const out = [...text]
  figures.forEach((f, i) => {
    const at = Math.round(((i + 1) * text.length) / (figures.length + 1)) + i
    out.splice(Math.min(at, out.length), 0, f)
  })
  return out
}

/** 已上傳的圖片 asset id → 插圖物件 */
export const toFigures = (p: ParsedPost, assetIds: string[]): Figure[] =>
  assetIds.map((id) => ({
    _key: key(),
    _type: 'figure',
    image: { _type: 'image', asset: { _type: 'reference', _ref: id } },
    ...(p.imageCredit ? { caption: p.imageCredit } : {}),
  }))

/** 算出要寫進文章的欄位，以及要提醒同仁檢查的事項 */
export async function articleFields(
  client: SanityClient,
  p: ParsedPost,
  figures: Figure[],
  opts: { docId: string; currentSlug?: string },
) {
  const notes = [...p.warnings]
  const baseId = opts.docId.replace(/^drafts\./, '')

  // 作者：姓名完全相同，或去掉括號稱呼後相同；只找已發布的（只有草稿的作者會讓文章發布失敗）
  const authors: { _id: string; name: string }[] = await client.fetch(
    `*[_type=="author" && !(_id in path("drafts.**"))]{_id,name}`,
  )
  const bare = (n = '') => n.replace(/[（(].*$/, '').trim()
  const author = p.authorName
    ? authors.find((a) => a.name === p.authorName) || authors.find((a) => bare(a.name) === bare(p.authorName))
    : undefined
  if (p.authorName && !author) notes.push(`找不到作者「${p.authorName}」。請先到「作者」新增並發布，再回來選「作者」。`)

  // 粉專連結：用以前文章填過的網址
  const known: { title: string; url: string }[] = await client.fetch(`*[_type=="article" && defined(links)].links[]{title,url}`)
  const links = p.pageNames.flatMap((name) => {
    const hit = known.find((l) => l.title?.includes(name) && l.url)
    if (!hit) {
      notes.push(`粉專「${name}」以前沒填過網址，請到「相關連結」自己加上。`)
      return []
    }
    return [{ _key: key(), _type: 'link', title: `📘 facebook 粉專：${name}`, url: hit.url }]
  })

  // 網址代稱：系列＋年月（例：scent-2026-05），重複就加 -2
  const stem = `${p.seriesKey ?? 'article'}-${p.publishedAt.slice(0, 7)}`
  const taken: string[] = await client.fetch(
    `*[_type=="article" && slug.current match $stem + "*" && !(_id in [$id, $draft])].slug.current`,
    { stem, id: baseId, draft: `drafts.${baseId}` },
  )
  let slug = opts.currentSlug || stem
  for (let n = 2; taken.includes(slug); n++) slug = `${stem}-${n}`

  if (figures.length) notes.push('圖片的「替代文字」請逐張補上（描述圖片內容，給看不到圖的讀者和 Google）。')
  else notes.push('沒有附圖片，封面會是空的。')
  notes.push('錯字、重點句、摘要請再看一次，確認後按「發布」。')

  const fields = {
    title: p.title,
    slug: { _type: 'slug', current: slug },
    excerpt: p.excerpt,
    body: buildBody(p, figures),
    category: p.category,
    accent: p.accent,
    publishedAt: p.publishedAt,
    tags: p.tags,
    ...(p.series ? { series: p.series } : {}),
    ...(author ? { author: { _type: 'reference', _ref: author._id } } : {}),
    ...(links.length ? { links } : {}),
    ...(figures[0] ? { cover: { _type: 'figure', image: figures[0].image } } : {}),
  }
  return { fields, notes }
}
