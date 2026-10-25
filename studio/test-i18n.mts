// 翻譯欄位的測試：npm run test:i18n
import { schemaTypes } from './schemaTypes/index.ts'
import { TRANSLATABLE, LANGUAGES, sourceHash } from './schemaTypes/i18n.ts'

let failed = 0
const fail = (msg: string) => { failed++; console.log('✗ ' + msg) }
const types = new Map((schemaTypes as any[]).filter((t) => t.type === 'document').map((t) => [t.name, t]))

const EXPECTED = 'siteSettings navigation homePage themesSection aboutPage joinPage partnerPage eventsPage columnPage donatePage contactPage boardAreaPage article author person event activityType'.split(' ')
for (const name of EXPECTED) if (!TRANSLATABLE[name]) fail(`TRANSLATABLE 缺少 ${name}`)

for (const [name, { fields }] of Object.entries(TRANSLATABLE)) {
  const type = types.get(name)
  if (!type) { fail(`TRANSLATABLE 的 ${name} 不是文件類型`); continue }
  const own = type.fields.filter((f: any) => f.name !== 'translations')
  for (const f of fields) if (!own.some((x: any) => x.name === f)) fail(`${name}.${f} 不存在`)

  const tr = type.fields.find((f: any) => f.name === 'translations')
  if (!tr) { fail(`${name} 沒有 translations 欄位`); continue }
  for (const lang of LANGUAGES.slice(1)) {
    const sub = tr.fields.find((f: any) => f.name === lang.code)
    if (!sub) { fail(`${name}.translations 沒有 ${lang.code}`); continue }
    const names = sub.fields.map((f: any) => f.name)
    for (const f of [...fields, 'reviewed', 'sourceHash']) if (!names.includes(f)) fail(`${name}.translations.${lang.code} 缺 ${f}`)
    if ((name === 'person' || name === 'author') && !names.includes('nameEn')) fail(`${name} 缺 nameEn`)
    for (const f of sub.fields) {
      if (!fields.includes(f.name)) continue
      for (const k of ['validation', 'group', 'initialValue']) if (f[k] !== undefined) fail(`${name}.translations.${lang.code}.${f.name} 還有 ${k}`)
    }
  }
  if (!type.groups?.some((g: any) => g.name === 'translations')) fail(`${name} 沒有翻譯分頁`)
  if (tr.group !== 'translations') fail(`${name}.translations 不在翻譯分頁`)
}

// 原本沒有分頁的文件：中文欄位放進預設的「中文」分頁
{
  const about = types.get('aboutPage')
  const main = about.groups?.find((g: any) => g.name === 'main')
  if (!main?.default) fail('aboutPage 沒有預設的 main 分頁')
  for (const f of about.fields) if (f.name !== 'translations' && f.group !== 'main') fail(`aboutPage.${f.name} 不在 main`)
}

// 中文版本指紋
{
  const a = { _type: 'aboutPage', title: '認識學會', lead: '慢', slug: { current: 'x' } }
  const b = { lead: '慢', slug: { current: 'x' }, title: '認識學會', _type: 'aboutPage' }
  if (sourceHash(a, 'aboutPage') !== sourceHash(b, 'aboutPage')) fail('key 順序不同，指紋卻不同')
  if (sourceHash(a, 'aboutPage') === sourceHash({ ...a, lead: '快' }, 'aboutPage')) fail('改了可翻欄位，指紋沒變')
  const ev = { _type: 'event', title: '慢活日', slug: { current: 'a' }, body: [{ _key: 'k', x: { b: 1, a: 2 } }] }
  if (sourceHash(ev, 'event') !== sourceHash({ ...ev, slug: { current: 'b' } }, 'event')) fail('改了不可翻欄位，指紋卻變了')
}

// ── 翻譯腳本的規則（migrations/i18n/lib.ts）──
{
  const { planPatches, checkTranslationShape, statusOf } = await import('./migrations/i18n/lib.ts')
  const pub = { _id: 'aboutPage', _type: 'aboutPage', title: '認識學會', lead: '慢' }
  const file = { _id: 'aboutPage', _type: 'aboutPage', lang: 'en', sourceHash: sourceHash(pub, 'aboutPage'), translation: { title: 'About', reviewed: false, sourceHash: sourceHash(pub, 'aboutPage') } }

  const both = planPatches(file, pub, { ...pub, _id: 'drafts.aboutPage' }, { force: false })
  if (both.skip || both.patches.map((p) => p.id).join() !== 'aboutPage,drafts.aboutPage') fail(`有草稿時要寫兩份：${JSON.stringify(both)}`)
  if (JSON.stringify(both.patches[0].set) !== JSON.stringify({ 'translations.en': file.translation })) fail('patch 內容不對')
  const one = planPatches(file, pub, null, { force: false })
  if (one.skip || one.patches.length !== 1) fail('沒草稿時只寫一份')
  if (!planPatches(file, { ...pub, lead: '快' }, null, { force: false }).skip) fail('中文改過要略過')
  const reviewed = { ...pub, translations: { en: { title: 'About us', reviewed: true } } }
  if (!planPatches(file, reviewed, null, { force: false }).skip) fail('已校對要略過')
  if (planPatches(file, reviewed, null, { force: true }).skip) fail('force 時不略過已校對')
  if (!planPatches(file, null, null, { force: false }).skip) fail('找不到文件要略過')
  // 同仁在草稿改了英文、還沒發布：不能被蓋掉
  const edited = { ...pub, _id: 'drafts.aboutPage', translations: { en: { title: 'About Us (edited)' } } }
  if (!planPatches(file, pub, edited, { force: false }).skip) fail('草稿裡有同仁改過的英文要略過')
  if (planPatches(file, pub, edited, { force: true }).skip) fail('force 時不略過草稿的英文')
  const sameTr = { en: { title: 'Old' } }
  const same = planPatches(file, { ...pub, translations: sameTr }, { ...pub, _id: 'drafts.aboutPage', translations: sameTr }, { force: false })
  if (same.skip || same.patches.length !== 2) fail('草稿英文和已發布一樣時兩份都寫')
  // 寫入時一律未校對、指紋用檔案的
  const forced = planPatches({ ...file, translation: { ...file.translation, reviewed: true, sourceHash: 'zzz' } }, pub, null, { force: false })
  const set: any = forced.patches[0]?.set['translations.en']
  if (set?.reviewed !== false || set?.sourceHash !== file.sourceHash) fail(`寫入時要強制 reviewed:false 與檔案指紋：${JSON.stringify(set)}`)

  const src = { title: '標題', links: [{ _key: 'a', _type: 'navLink', label: '加入', href: '/join' }], cover: { _type: 'figure', image: { asset: { _ref: 'image-1' } }, alt: '圖' } }
  const ok = { title: 'Title', links: [{ _key: 'a', _type: 'navLink', label: 'Join', href: '/join' }], cover: { _type: 'figure', image: { asset: { _ref: 'image-1' } }, alt: 'Photo' } }
  const issues = (x: any) => checkTranslationShape(src, x)
  if (issues(ok).length) fail(`只改文字不該有問題：${issues(ok)}`)
  const clone = () => JSON.parse(JSON.stringify(ok))
  const badHref = clone(); badHref.links[0].href = '/en/join'
  const fewer = clone(); fewer.links = []
  const badKey = clone(); badKey.links[0]._key = 'b'
  const noImage = clone(); delete noImage.cover.image.asset._ref
  for (const [name, x] of [['改了 href', badHref], ['少一個項目', fewer], ['_key 不同', badKey], ['少了圖片', noImage]] as const)
    if (issues(x).length !== 1) fail(`${name} 應回報一個問題，得到 ${JSON.stringify(issues(x))}`)

  const st = (tr: any, doc: any = pub) => statusOf({ ...doc, translations: tr && { en: tr } }, 'en')
  const h = sourceHash(pub, 'aboutPage')
  if (st(undefined) !== 'untranslated') fail('沒有譯文應為 untranslated')
  if (st({ title: 'About', sourceHash: 'x' }) !== 'stale') fail('指紋不符應為 stale')
  if (st({ title: 'About', sourceHash: h }) !== 'unreviewed') fail('未校對應為 unreviewed')
  if (st({ title: 'About', sourceHash: h, reviewed: true }) !== 'ok') fail('已校對應為 ok')
}

console.log(failed ? `${failed} 項不符` : '全部通過')
process.exit(failed ? 1 : 0)
