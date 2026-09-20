import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] })
)

const c = createClient({
  projectId: '2lbk0ta8', dataset: 'production',
  apiVersion: '2026-01-01', useCdn: false,
  token: env.SANITY_READ_TOKEN, perspective: 'published',
})

const FIGURE = `{ "image": image, alt, caption }`
const RICH = `[]{ ..., _type=="figure" => ${FIGURE}, _type=="imageRow" => { ..., images[]${FIGURE} } }`

const queries = {
  siteSettings: `*[_type=="siteSettings"][0]`,
  home: `*[_type=="homePage"][0]{ ..., aboutBody${RICH} }`,
  themes: `*[_type=="themesSection"][0]`,
  events: `*[_type=="event"] | order(sortDate asc)`,
  people: `*[_type=="person"] | order(order asc){name,role,group,note,term}`,
  articles: `*[_type=="article"] | order(publishedAt desc){title,"slug":slug.current,excerpt,category,accent,publishedAt,tags,"cover":cover${FIGURE},author->{name,title,initial,accent}}`,
  articleOne: `*[_type=="article" && slug.current==$slug][0]{title,body${RICH},links,author->{name}}`,
  articleSlugs: `*[_type=="article" && defined(slug.current)].slug.current`,
  plansPage: `*[_type=="plansPage"][0]{..., tracks[]{track, body${RICH}}}`,
  planItems: `*[_type=="planItem"] | order(order asc)`,
  donate: `*[_type=="donatePage"][0]`,
  contact: `*[_type=="contactPage"][0]`,
  boardArea: `*[_type=="boardAreaPage"][0]`,
}

let fail = 0
for (const [name, q] of Object.entries(queries)) {
  try {
    const r = await c.fetch(q, name === 'articleOne' ? { slug: 'tea-tree-february' } : {})
    const n = Array.isArray(r) ? `${r.length} 筆` : r == null ? '⚠️ null' : `物件（${Object.keys(r).filter(k=>!k.startsWith('_')).length} 個欄位）`
    if (r == null) fail++
    console.log(`${r == null ? '✗' : '✓'} ${name.padEnd(14)} ${n}`)
  } catch (e) {
    fail++
    console.log(`✗ ${name.padEnd(14)} ${e.message.slice(0, 90)}`)
  }
}

// 抽查幾個關鍵細節
const a = await c.fetch(queries.articleOne, { slug: 'tea-tree-february' })
console.log('\n茶樹文章：')
console.log('  標題   ', a?.title)
console.log('  作者   ', a?.author?.name)
console.log('  內文區塊', a?.body?.map(b => b._type).join(', '))
const verse = a?.body?.find(b => b._type === 'verse')
console.log('  詩體換行', verse?.text?.split('\n').length, '行')

const mu = await c.fetch(queries.articleOne, { slug: 'mu-march' })
console.log('\n木字文章內文區塊：', mu?.body?.map(b => b._type + (b.style ? `(${b.style})` : '')).join(', '))
const row = mu?.body?.find(b => b._type === 'imageRow')
console.log('  並排圖片：', row?.images?.length, '張，第一張 alt =', row?.images?.[0]?.alt)
console.log('  asset ref 有嗎：', !!row?.images?.[0]?.image?.asset?._ref)

const ppl = await c.fetch(queries.people)
console.log('\n理監事分組：', [...new Set(ppl.map(p => p.group))].join(', '), `共 ${ppl.length} 人`)
console.log('  資訊顧問那筆：', JSON.stringify(ppl.find(p => p.role.includes('資訊')), null, 0))

process.exit(fail ? 1 : 0)
