// 翻譯流程的規則（status.ts、apply.ts 共用；測試：npm run test:i18n）
import { sourceHash } from '../../schemaTypes/i18n'

type Doc = Record<string, any> & { _id: string; _type: string }

/** 翻譯檔（_private/translations/<語言>/<文件 id>.json） */
export type TranslationFile = {
  _id: string
  _type: string
  lang: string
  sourceHash: string
  translation: Record<string, any>
}

const META = new Set(['_type', 'reviewed', 'sourceHash'])
const hasContent = (tr: any) =>
  !!tr && Object.entries(tr).some(([k, v]) => !META.has(k) && v != null && v !== '' && !(Array.isArray(v) && !v.length))

/** untranslated：沒有譯文；stale：翻譯後中文改過；unreviewed：同仁還沒校對；ok */
export function statusOf(doc: Doc, lang: string): 'untranslated' | 'stale' | 'unreviewed' | 'ok' {
  const tr = doc.translations?.[lang]
  if (!hasContent(tr)) return 'untranslated'
  if (tr.sourceHash !== sourceHash(doc, doc._type)) return 'stale'
  return tr.reviewed ? 'ok' : 'unreviewed'
}

// 這些鍵的值不是要翻的文字，譯文必須原樣照抄（網址、圖片、圖示、排版標記、比對用的名稱）
const KEEP = new Set([
  '_key', '_type', '_ref', 'href', 'url', 'icon', 'slug', 'current', 'category', 'name', 'anchor',
  'tone', 'accent', 'style', 'listItem', 'level', 'marks', 'start', 'end', 'signupUrl', 'driveUrl',
])
// 長得像網址或日期的字串也不能改
const LITERAL = /^(https?:|mailto:|\/|#|\d{4}-\d{2}-\d{2})/

/**
 * 譯文的形狀必須和中文一樣：所有 _key、陣列長度、網址、圖片參照都相同，只有文字可以不同。
 * 少了東西，同仁在後台會因為必填欄位按不了發布。回傳問題清單，空的代表合格。
 */
export function checkTranslationShape(source: unknown, translation: unknown, path = ''): string[] {
  const here = path || '(根)'
  if (source == null) return []
  if (Array.isArray(source)) {
    if (!Array.isArray(translation)) return [`${here}：應該是清單`]
    if (translation.length !== source.length) return [`${here}：有 ${source.length} 項，譯文有 ${translation.length} 項`]
    return source.flatMap((s, i) => checkTranslationShape(s, translation[i], `${path}[${i}]`))
  }
  if (typeof source === 'object') {
    if (!translation || typeof translation !== 'object' || Array.isArray(translation)) return [`${here}：應該是物件`]
    const out: string[] = []
    for (const [k, v] of Object.entries(source as Record<string, unknown>)) {
      const p = path ? `${path}.${k}` : k
      const tv = (translation as Record<string, unknown>)[k]
      if (v != null && tv === undefined) out.push(`${p}：譯文少了這一項`)
      else if (KEEP.has(k)) {
        if (JSON.stringify(v) !== JSON.stringify(tv)) out.push(`${p}：這個值要照抄（中文是 ${JSON.stringify(v)}）`)
      } else out.push(...checkTranslationShape(v, tv, p))
    }
    return out
  }
  if (typeof source === 'string') {
    if (LITERAL.test(source) && source !== translation) return [`${here}：網址或日期要照抄（中文是 ${JSON.stringify(source)}）`]
    return typeof translation === 'string' ? [] : [`${here}：應該是文字`]
  }
  return source === translation ? [] : [`${here}：要照抄（中文是 ${JSON.stringify(source)}）`]
}

/**
 * 要寫哪些文件：已發布版一定寫；有草稿也寫，同仁之後發布草稿才不會把譯文洗掉。
 * 翻譯後中文被改過、或已經校對過（未加 force）就略過。
 */
export function planPatches(
  file: TranslationFile,
  published: Doc | null,
  draft: Doc | null,
  opts: { force: boolean },
): { skip?: string; patches: { id: string; set: Record<string, unknown> }[] } {
  const lang = file.lang ?? 'en'
  if (!published) return { skip: '找不到已發布的文件', patches: [] }
  if (file.sourceHash !== sourceHash(published, published._type)) return { skip: '中文在翻譯後被改過，請重新翻譯', patches: [] }
  if (published.translations?.[lang]?.reviewed && !opts.force) return { skip: '已校對，不覆蓋（要覆蓋請加 FORCE=1）', patches: [] }
  const set = { [`translations.${lang}`]: file.translation }
  return { patches: [published, draft].filter((d): d is Doc => !!d).map((d) => ({ id: d._id, set })) }
}
