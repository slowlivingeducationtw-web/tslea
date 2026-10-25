// 網站所有的 GROQ 查詢。純字串，不連 Sanity，所以 tests/ 可以用 groq-js 直接跑。
import { LANGS } from './i18n'

// ── 共用片段 ──────────────────────────────────────────────

/**
 * 投影加上譯文：'{ a, b }' → '{ a, b, "i18n": translations{ "en": en{ a, b } } }'。
 * 譯文用和中文一樣的投影取出，取回後由 i18n.ts 的 localize 合併。
 * 有英文版的文件（含 -> 參照進來的）都要包。
 * 由中文算出來的值（例：hasRecap）不能從譯文算，否則譯文缺欄位時會蓋掉中文的結果：
 * 這種投影另外傳一份不含那些值的 translated。
 */
export function withI18n(projection: string, translated = projection): string {
  const strip = (p: string) => p.trim().replace(/^\{/, '').replace(/\}$/, '').trim()
  const inner = strip(projection)
  const tr = strip(translated)
  const langs = LANGS.filter((l) => l.prefix).map((l) => `"${l.code}": ${l.code}{ ${tr} }`).join(', ')
  return `{ ${inner}, "i18n": translations{ ${langs} } }`
}

const FIGURE = `{ "image": image, alt, caption }`

const RICH = `[]{
  ...,
  _type == "figure" => ${FIGURE},
  _type == "imageRow" => { ..., images[]${FIGURE} }
}`

// 活動卡片需要的欄位（活動列表、主題頁「相關活動」共用）
// 人名不翻譯：譯文那邊只取「英文姓名」與職稱（displayName 決定顯示哪個）
const AUTHOR = withI18n(`{ name, title, initial, accent }`, `{ nameEn, title }`)
const RECAP_AUTHOR = withI18n('{ name, title }', '{ nameEn, title }')
const TYPE_REF = withI18n(`{ title, "slug": slug.current }`)

const EVENT_CARD = withI18n(`{
    title, "slug": slug.current, dateLabel, sortDate, place, icon, description,
    signupStatus, signupUrl, tag,
    "cover": cover${FIGURE},
    "videoUrl": video.url,
    "hasRecap": count(recap) > 0 || defined(video.url),
    "recapAuthor": recapAuthor->${RECAP_AUTHOR},
    columnCategories,
    "activityType": activityType->${TYPE_REF}
  }`, `{ title, dateLabel, place, description, tag, "cover": cover${FIGURE} }`)

const PAIR = withI18n(`{ title, "slug": slug.current, "isRecap": count(recap) > 0 || defined(video.url) }`, `{ title }`)

// ── 查詢 ──────────────────────────────────────────────────

export const Q = {
  siteSettings: `*[_type == "siteSettings"][0]${withI18n('{ ... }')}`,

  navigation: `*[_id == "navigation"][0]${withI18n('{ ... }')}`,

  home: `*[_id == "homePage"][0]${withI18n(`{
    heroSlides, statement, statementHighlight, eventsTitle, eventsSub, columnTitle, columnSub,
    tilesTitle, tiles, ctaTitle, ctaText, ctaButtons, seoTitle, seoDescription
  }`)}`,

  themes: `*[_id == "themesSection"][0]${withI18n('{ title, themes[]{ ..., "slug": slug.current }, formatsTitle }')}`,

  // 主題頁（/themes/{slug}）：完整介紹＋挑選的相關活動（未發布的活動會是 null，頁面上濾掉）
  // 譯文在 themesSection 這一層，所以整份取回、合併後再拿 .themes。
  // 譯文那邊不取相關活動：活動清單照中文版，每個活動再各自合併自己的譯文
  themePages: `*[_id == "themesSection"][0]${withI18n(`{ "themes": themes[defined(slug.current)]{
    _key, icon, title, en, description, image, category, "slug": slug.current,
    body${RICH},
    "events": events[]->${EVENT_CARD}
  } }`, `{ "themes": themes[defined(slug.current)]{ _key, title, description, image, "slug": slug.current, body${RICH} } }`)}`,

  aboutPage: `*[_id == "aboutPage"][0]${withI18n(`{ ..., body${RICH} }`)}`,

  joinPage: `*[_id == "joinPage"][0]${withI18n('{ ... }')}`,

  partnerPage: `*[_id == "partnerPage"][0]${withI18n('{ ... }')}`,

  eventsPage: `*[_id == "eventsPage"][0]${withI18n('{ ... }')}`,

  columnPage: `*[_id == "columnPage"][0]${withI18n('{ ... }')}`,

  // 活動列表與卡片（一個活動一頁；hasRecap＝已補上活動回顧）
  events: `*[_type == "event" && defined(slug.current)] | order(sortDate asc)${EVENT_CARD}`,

  event: `*[_type == "event" && slug.current == $slug][0]${withI18n(`{
    title, "slug": slug.current, dateLabel, sortDate, place, icon, description,
    signupStatus, signupUrl, tag,
    "cover": cover${FIGURE},
    intro${RICH},
    recap${RICH},
    video,
    links,
    "recapAuthor": recapAuthor->${RECAP_AUTHOR},
    // 對應的介紹／回顧：只要其中一筆設定，兩邊都找得到
    "pair": coalesce(
      pair->${PAIR},
      *[_type == "event" && pair._ref == ^._id][0]${PAIR}
    ),
    "activityType": activityType->${TYPE_REF}
  }`,
  // 譯文那邊只取要翻的欄位：pair 用 ^ 反查，放在 translations.en 裡 ^ 會指錯文件；參照的文件各自合併自己的譯文
  `{ title, dateLabel, place, description, tag, "cover": cover${FIGURE}, intro${RICH}, recap${RICH}, video, links }`)}`,

  activityTypes: `*[_type == "activityType" && defined(slug.current)] | order(order asc)${withI18n(`{
    _id, title, "slug": slug.current, image, icon, description
  }`)}`,

  people: `*[_type == "person"] | order(order asc)${withI18n(`{
    name, role, group, note, term, speech
  }`, `{ nameEn, role, note, speech }`)}`,

  articles: `*[_type == "article"] | order(publishedAt desc)${withI18n(`{
    title, "slug": slug.current, excerpt, category, series, accent,
    publishedAt, tags,
    "cover": cover${FIGURE},
    "author": author->${AUTHOR}
  }`)}`,

  article: `*[_type == "article" && slug.current == $slug][0]${withI18n(`{
    title, "slug": slug.current, excerpt, category, series, accent,
    publishedAt, tags,
    "cover": cover${FIGURE},
    body${RICH},
    links,
    "author": author->${AUTHOR}
  }`)}`,


  articleSlugs: `*[_type == "article" && defined(slug.current)].slug.current`,

  donate: `*[_type == "donatePage"][0]${withI18n('{ ... }')}`,

  contact: `*[_type == "contactPage"][0]${withI18n('{ ... }')}`,

  boardArea: `*[_type == "boardAreaPage"][0]${withI18n('{ ... }')}`,
}
