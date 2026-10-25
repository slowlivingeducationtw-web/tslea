import { defineField, type FieldDefinition } from 'sanity'
import { TranslationStatus } from '../components/TranslationStatus'

// 網站語言。第一個是原文（中文欄位本身），其餘每種語言在文件裡多一份 translations.<code>。
// 要和網站 src/lib/i18n.ts 的 LANGS 一致。加新語言：這裡加一行、網站那邊也加，再補 src/lib/ui.ts 的介面文字。
export const LANGUAGES = [
  { code: 'zh', label: '繁體中文' },
  { code: 'en', label: 'English 英文版' },
] as const

const nameEn = defineField({
  name: 'nameEn',
  title: '英文姓名（選填）',
  type: 'string',
  description: '本人提供才填，留空時英文網站顯示中文姓名。',
})

// 每種文件「讀者看得到的文字欄位」。陣列、物件整個列入（裡面的網址、圖片翻譯時原樣照抄）。
// 新增文字欄位時記得加進來，英文版才會有對應欄位。
export const TRANSLATABLE: Record<string, { fields: string[]; extra?: FieldDefinition[] }> = {
  siteSettings: { fields: ['orgName', 'address', 'footerNote'] },
  navigation: { fields: ['mainNav', 'headerCta', 'footerGroups', 'facebookLabel'] },
  homePage: {
    fields: ['heroSlides', 'statement', 'statementHighlight', 'eventsTitle', 'eventsSub', 'columnTitle', 'columnSub',
      'tilesTitle', 'tiles', 'ctaTitle', 'ctaText', 'ctaButtons', 'seoTitle', 'seoDescription'],
  },
  themesSection: { fields: ['title', 'themes', 'formatsTitle'] },
  aboutPage: { fields: ['title', 'lead', 'seoDescription', 'body', 'image', 'plansTitle', 'plans', 'linksTitle', 'links'] },
  joinPage: { fields: ['title', 'lead', 'seoDescription', 'cards', 'footnote'] },
  partnerPage: { fields: ['title', 'lead', 'seoDescription', 'cards', 'footnote'] },
  eventsPage: { fields: ['title', 'lead', 'seoDescription', 'currentTitle', 'emptyText'] },
  columnPage: { fields: ['title', 'lead', 'seoDescription', 'emptyText', 'series'] },
  donatePage: { fields: ['title', 'intro', 'uses', 'accountName', 'bankName', 'receiptNote', 'notes'] },
  contactPage: { fields: ['label', 'title', 'subtitle', 'cards', 'notes'] },
  boardAreaPage: { fields: ['title', 'intro', 'accessNote', 'whyNote'] },
  article: { fields: ['title', 'excerpt', 'cover', 'body', 'links', 'tags'] },
  author: { fields: ['title', 'bio'], extra: [nameEn] },
  person: { fields: ['role', 'note', 'speech'], extra: [nameEn] },
  event: { fields: ['title', 'dateLabel', 'place', 'description', 'cover', 'intro', 'video', 'recap', 'links', 'tag'] },
  activityType: { fields: ['title', 'description'] },
}

// ── 中文版本指紋：翻譯時記下，之後中文改過就對不上 ──
function stable(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(stable).join(',')}]`
  if (v && typeof v === 'object')
    return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${stable((v as any)[k])}`).join(',')}}`
  return JSON.stringify(v ?? null)
}

/** 這份文件可翻欄位的中文內容指紋（FNV-1a 32 位元） */
export function sourceHash(doc: Record<string, unknown>, type: string): string {
  const picked: Record<string, unknown> = {}
  for (const f of TRANSLATABLE[type]?.fields ?? []) picked[f] = doc[f]
  const s = stable(picked)
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

// ── schema 小幫手 ──
const STRIP = ['validation', 'initialValue', 'group', 'fieldset', 'hidden', 'readOnly'] as const

function copyField(f: any) {
  const c = { ...f }
  for (const k of STRIP) delete c[k]
  c.description = `對應中文欄位「${f.title ?? f.name}」。` + (f.description ? ' ' + f.description : '')
  return c
}

const others = LANGUAGES.slice(1)

/** 在文件加上 translations.<語言> 欄位，內容是可翻欄位的複本，放在獨立的分頁 */
export function withTranslations<T extends { name: string; fields: any[]; groups?: any[] }>(type: T): T {
  const spec = TRANSLATABLE[type.name]
  if (!spec) return type
  const groups = type.groups?.length
    ? [...type.groups]
    : [{ name: 'main', title: '中文', default: true }]
  groups.push({ name: 'translations', title: others.length === 1 ? others[0].label : '其他語言' })
  const fields = type.groups?.length ? type.fields : type.fields.map((f) => (f.group ? f : { ...f, group: 'main' }))

  const translations = defineField({
    name: 'translations',
    title: '翻譯',
    type: 'object',
    group: 'translations',
    components: { input: TranslationStatus },
    fields: others.map((lang) =>
      defineField({
        name: lang.code,
        title: lang.label,
        type: 'object',
        options: { collapsible: others.length > 1 },
        fields: [
          ...(spec.extra ?? []),
          ...spec.fields.map((name) => copyField(type.fields.find((f) => f.name === name))),
          defineField({ name: 'reviewed', title: '已校對', type: 'boolean', description: '同仁看過、改好英文後勾選。' }),
          defineField({ name: 'sourceHash', title: '翻譯時的中文版本', type: 'string', hidden: true }),
        ],
      }),
    ),
  })
  return { ...type, groups, fields: [...fields, translations] }
}
