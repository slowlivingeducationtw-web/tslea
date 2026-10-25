// 本機預覽還沒寫進後台的譯文：I18N_OVERLAY=1 npm run dev（或 build）
// 先把已發布的文件全部抓下來，放進 _private/translations/<語言>/*.json 的譯文，
// 之後每個查詢都用 groq-js 在本機執行。正式資料完全不會被改動。Cloudflare 上不要設這個變數。
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { SanityClient } from '@sanity/client'
import { LANGS } from './i18n'

const ROOT = resolve(process.cwd(), '_private', 'translations')

let dataset: Promise<any[]> | undefined

async function load(client: SanityClient) {
  const docs: any[] = await client.fetch(`*[!(_id in path("drafts.**"))]`)
  const byId = new Map(docs.map((d) => [d._id, d]))
  for (const { code, prefix } of LANGS) {
    const dir = resolve(ROOT, code)
    if (!prefix || !existsSync(dir)) continue
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
      const file = JSON.parse(readFileSync(resolve(dir, f), 'utf8'))
      const doc = byId.get(file._id)
      if (!doc) { console.warn(`[overlay] 找不到文件 ${file._id}（${f}）`); continue }
      doc.translations = { ...doc.translations, [code]: file.translation }
    }
  }
  return docs
}

/** 和 client.fetch 一樣的用法，但查的是「後台資料＋本機譯文」 */
export async function overlayFetch<T>(client: SanityClient, query: string, params: Record<string, unknown> = {}): Promise<T> {
  const { parse, evaluate } = await import('groq-js')
  dataset ??= load(client)
  const result = await evaluate(parse(query, { params }), { dataset: await dataset, params })
  return (await result.get()) as T
}
