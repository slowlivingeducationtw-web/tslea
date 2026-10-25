# 英文版網站（多語言架構）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 整個網站多一套 `/en/...` 英文版，右上角地球下拉切換語言；英文內容存在 Sanity 每份文件的 `translations.en`，由 Claude 翻譯、同仁校對。

**Architecture:** 後台只「新增」`translations.<語言>` 欄位（由 schema 小幫手依一份可翻欄位清單自動產生），中文資料不動。前端每個查詢多帶 `"i18n"` 投影，取回後用一個遞迴的 `localize()` 把譯文合併到中文資料上（空欄位退回中文、陣列依 `_key` 對齊、沒有譯文的文件標 `_untranslated`）。每頁的內容抽到 `src/views/`，中文頁與 `/en/` 頁都是呼叫同一個 view 的薄殼。翻譯先寫成本機檔案，用 groq-js 在本機合併預覽，使用者同意後才由腳本寫進正式資料。

**Tech Stack:** Astro 7（靜態）、Sanity v6 Studio、`@sanity/client`、`groq-js`（僅本機預覽）、`tsx` + `node:assert` 測試（比照 `studio/test-import.mts` 的寫法）。

**Spec:** `docs/superpowers/specs/2026-10-25-english-site-design.md`（執行前兩份都要讀）

## Global Constraints

- 中文網站任何既有網址、文字、連結不得改變；中文資料不搬移。
- 推上 main、`sanity deploy`、執行寫入正式資料的腳本：**只有使用者說「推上去」（或 CLAUDE.md 列的同義詞）才做**。Task 9 之前全部只在本機。
- 後台欄位名稱與說明一律中文；不新增檔案上傳欄位。
- 每頁 `<div class="page" id="page-XXX">` 保留，英文頁用同一個 id。
- 新樣式用 `site.css` 變數，不寫死 hex；Logo 檔不改。
- 學會英文名：`Slow Living Education Society of Taiwan`。
- 英文網址＝中文網址前加 `/en`，代稱（slug）不變；首頁 `/en`。
- 未翻譯頁面提示文字：`English translation in progress — the original Chinese is shown below.`；卡片小標籤：`Translation in progress`。
- 切換鈕：地球圖示＋下拉（`/lang-mockup` 方案 E）。電腦版顯示「中文 ▾」/「English ▾」，手機版只顯示地球；清單項目「繁體中文」「English」，目前語言打勾。
- 未翻譯的英文頁：`noindex`、不進 sitemap、不輸出 hreflang。
- 不依瀏覽器語言自動導向。
- 理監事／作者英文姓名欄位預設留空，Claude 不替人取英文名或音譯。
- 工作目錄有使用者尚未提交的修改（`src/lib/column.ts`、`studio/schemaTypes/shared.ts` 刪除「慢活小語」分類，及三個 migrations 檔、`官網建置方案評估.md`）。**不要把它們混進本計畫的 commit**，見 Task 0。

## Review Focus

1. **同仁發布舊草稿把譯文洗掉**：文件同時有已發布版與草稿時，寫入譯文必須兩邊都寫。→ Task 6 `planPatches` 測試。
2. **英文副本裡的巢狀必填欄位擋住發布**（如 `navLink.href`、`figure.image`）：譯文必須完整複製非文字值與 `_key`，否則同仁在後台按不了發布。→ Task 6 `checkTranslationShape` 測試，apply 腳本拒寫不合格檔案。
3. **英文頁裡的站內連結沒加 `/en`**（後台填的選單、按鈕、內文連結），點了就掉回中文站。mailto、外部連結、`/images/...` 不能被加。→ Task 1 `localizePath` 測試＋ Task 5 檢查腳本 (e)。
4. **切換語言時丟掉 `?type=`、`?series=`、`#錨點`**。→ Task 3 瀏覽器驗證步驟。
5. **手機 375px 頁首塞不下**（Logo＋地球＋漢堡，按鈕已收進選單時仍要能點，觸控區至少 44px）。→ Task 3 瀏覽器驗證步驟。

---

### Task 0: 準備

- [ ] **Step 1:** 問使用者：工作目錄裡那批「慢活小語改成只是系列」的未提交修改，要不要先單獨 commit（只 commit，不推）。使用者同意就 commit 那些檔案；不同意，之後每個 commit 都只 `git add` 本計畫建立或修改的檔案，`column.ts`／`shared.ts` 若必須動到，用 `git add -p` 只收自己的段落。
- [ ] **Step 2:** `git switch -c feat/english-site`
- [ ] **Step 3:** 建立中文基準：`npm run build`，然後把 `dist/` 複製到 `.work/dist-before/`（`.work/` 已 gitignore）。之後若後台有人發布內容造成基準過時，切回 main 重建基準。

---

### Task 1: 前端語言核心 `src/lib/i18n.ts`

**Files:**
- Create: `src/lib/i18n.ts`, `tests/i18n.test.mts`
- Modify: `package.json`（devDependencies 加 `tsx`；scripts 加 `"test": "tsx tests/i18n.test.mts"`）

**Interfaces — Produces:**
```ts
export const LANGS: readonly { code: Lang; label: string; short: string; htmlLang: string; hreflang: string; ogLocale: string; prefix: '' | `/${string}` }[]
// zh: { label:'繁體中文', short:'中文', htmlLang:'zh-Hant-TW', hreflang:'zh-Hant', ogLocale:'zh_TW', prefix:'' }
// en: { label:'English',  short:'English', htmlLang:'en',      hreflang:'en',      ogLocale:'en_US', prefix:'/en' }
export type Lang = 'zh' | 'en'
export const DEFAULT_LANG: Lang            // 'zh'
export function langOf(pathname: string): Lang
export function stripLang(path: string): string
export function localizePath(lang: Lang, href: string): string
export function localize<T>(value: T, lang: Lang): Localized<T>   // 物件多了 _untranslated?: boolean
export const isTranslated: (doc: { _untranslated?: boolean } | null | undefined) => boolean
```
檔案必須是純 TS（不用 `import.meta.env`、不 import Astro），測試才能直接跑。檔頭註明語言清單要和 `studio/schemaTypes/i18n.ts` 的 `LANGUAGES` 一致。

- [ ] **Step 1: 寫失敗測試** `tests/i18n.test.mts`（寫法比照 `studio/test-import.mts`：累計 failed、最後印「全部通過」並以 exit code 回報）：
  - `langOf('/en/about')==='en'`、`langOf('/en')==='en'`、`langOf('/english')==='zh'`、`langOf('/')==='zh'`
  - `stripLang('/en/about')==='/about'`、`stripLang('/en')==='/'`、`stripLang('/about')==='/about'`
  - `localizePath('en','/')==='/en'`；`'/about'`→`'/en/about'`；`'/events?type=breath#list'`→`'/en/events?type=breath#list'`；`'/en/about'`→`'/en/about'`（不重複加）
  - `localizePath('en', x) === x` 對以下 x：`'https://facebook.com/x'`、`'mailto:a@b.org'`、`'#donate'`、`'/images/logo.png'`（最後一段有副檔名就不動）、`'//cdn.x/y'`
  - `localizePath('zh','/en/about')==='/about'`
  - `localize`：
    - zh：`localize({title:'慢', i18n:{en:{title:'Slow'}}}, 'zh')` 深等於 `{title:'慢'}`（`i18n`、`translations` 鍵一律移除，不加 `_untranslated`）
    - en 有譯文：`{title:'慢', place:'苗栗', i18n:{en:{title:'Slow', place:''}}}` → `{title:'Slow', place:'苗栗', _untranslated:false}`（空字串退回中文）
    - en 無譯文：`i18n: null` → 保留中文且 `_untranslated:true`；`i18n:{en:{reviewed:false, sourceHash:'x'}}` 也算無譯文
    - 沒有 `i18n` 鍵的物件不加 `_untranslated`
    - 巢狀：`{cover:{image:{asset:{_ref:'img-1'}}, alt:'圖'}, i18n:{en:{cover:{alt:'Photo'}}}}` → `cover` 同時有 `image` 與 `alt:'Photo'`
    - 陣列依 `_key`：中文 `[{_key:'a',t:'一',icon:'🌿'},{_key:'b',t:'二'}]`、英文 `[{_key:'b',t:'Two'}]` → 結果只有 `[{_key:'b',t:'Two'}]`（英文決定成員與順序）；英文項目缺的欄位從同 `_key` 中文項目補
    - 陣列項目沒有 `_key` → 英文陣列整個取代
    - 參照進來的子文件（物件裡又有自己的 `i18n`）也各自合併並各自標 `_untranslated`
    - 也接受原始欄位名 `translations`（沒有投影成 `i18n` 的情況）
  - `ui.ts`（Task 3 建立前先跳過這項；Task 3 補上）
- [ ] **Step 2:** `npm test` → 失敗（找不到模組）。
- [ ] **Step 3:** 實作。`localize` 判斷「空」的規則：`null/undefined`、只有空白的字串、空陣列、所有非 `_type/_key` 欄位都空的物件。判斷「有沒有譯文」時忽略 `reviewed`、`sourceHash`、`_type`。
- [ ] **Step 4:** `npm test` → 全部通過。
- [ ] **Step 5:** Commit：`feat(i18n): language helpers and translation merge`

---

### Task 2: 後台 `translations` 欄位

**Files:**
- Create: `studio/schemaTypes/i18n.ts`, `studio/components/TranslationStatus.tsx`, `studio/test-i18n.mts`
- Modify: `studio/schemaTypes/index.ts`（所有可翻文件類型包上 `withTranslations`）、`studio/package.json`（scripts 加 `"test:i18n": "tsx test-i18n.mts"`）

**Interfaces — Produces:**
```ts
export const LANGUAGES: readonly { code: string; label: string }[]   // [{code:'zh',label:'繁體中文'},{code:'en',label:'English 英文版'}]；第一個是原文
export const TRANSLATABLE: Record<string, { fields: string[]; extra?: FieldDefinition[] }>
export function sourceHash(doc: Record<string, unknown>, type: string): string
export function withTranslations<T extends DocumentDefinition>(type: T): T
```
- `TRANSLATABLE` 的鍵是這 17 種：`siteSettings navigation homePage themesSection aboutPage joinPage partnerPage eventsPage columnPage donatePage contactPage boardAreaPage article author person event activityType`。`fields` 由實作者逐一讀 schema 填「讀者看得到的文字欄位」（陣列／物件欄位整個列入，例如 `body`、`cover`、`mainNav`、`plans`）。不列：slug、日期值、分類值、排序、報名狀態、網址欄位本身（但包含它們的物件陣列整個列入）。
- `person`、`author` 的 `extra` 是一個 `nameEn` 欄位：title「英文姓名（選填）」，description「本人提供才填，留空時英文網站顯示中文姓名。」
- `sourceHash`：取 `TRANSLATABLE[type].fields` 的中文值，key 排序後 JSON 化（遞迴穩定排序），FNV-1a 32 位元轉 16 進位字串。純函式，Studio、腳本共用。
- `withTranslations`：在文件加 `translations` 物件欄位，每個非原文語言一個子物件（name＝語言 code、title＝label），內容是可翻欄位的複本（移除 `validation`、`initialValue`、`group`、`fieldset`、`hidden`、`readOnly`；description 前面加「對應中文欄位「{原 title}」。」）＋ `extra` ＋ `reviewed`（boolean，title「已校對」，description「同仁看過、改好英文後勾選。」）＋ `sourceHash`（string，hidden）。分頁：文件原本有 groups 就加一個 `{name:'translations', title: 只有一種外語時用它的 label，否則「其他語言」}`；原本沒有 groups 的，先加 `{name:'main', title:'中文', default:true}` 並把所有沒 group 的欄位放進 main。
- `TranslationStatus.tsx`：`translations` 欄位的自訂 input，先渲染預設表單，上方每種語言顯示一行狀態（用 `useFormValue([])` 取整份文件算 `sourceHash` 比對）：沒有譯文 →「尚未翻譯：英文網站目前顯示中文。」；hash 不同 →「中文在翻譯後改過，英文可能已過時。」（caution 色）；未勾已校對 →「尚未校對。」；其餘不顯示。用 `@sanity/ui` 的 Card/Text。

- [ ] **Step 1: 寫失敗測試** `studio/test-i18n.mts`：
  - 每個 `TRANSLATABLE` 的鍵都是 `schemaTypes` 裡存在的文件類型，且列出的每個欄位名在該類型 `fields` 裡存在
  - 包過之後，17 種類型都有 `translations` 欄位，其 `en` 子物件含所有列出欄位＋`reviewed`＋`sourceHash`；`person`、`author` 另含 `nameEn`
  - 複本欄位沒有 `validation`、`group`、`initialValue`
  - 原本沒有 groups 的類型（例：`aboutPage`）有 `main`（default）與 `translations` 兩個 group，且原欄位都在 `main`
  - `sourceHash` 對 key 順序不同但內容相同的文件相等；改一個可翻欄位的中文就不相等；改不可翻欄位（如 `slug`）不變
- [ ] **Step 2:** `cd studio && npm run test:i18n` → 失敗。
- [ ] **Step 3:** 實作上列三個檔案並在 `index.ts` 套用。
- [ ] **Step 4:** `npm run test:i18n`、`npm run test:structure`、`npx sanity build` 全部通過。
- [ ] **Step 5:** `cd studio && npx sanity dev`，打開一篇文章、「認識學會」、「選單與頁尾」：中文欄位在原分頁、英文在「English 英文版」分頁，狀態列顯示「尚未翻譯」。**不要** `sanity deploy`。
- [ ] **Step 6:** Commit：`feat(studio): translations fields for every translatable document`

---

### Task 3: 查詢、介面文字、外殼（Base／Header／Footer／切換鈕）

**Files:**
- Create: `src/lib/ui.ts`, `src/components/LangSwitch.astro`, `src/components/UntranslatedNote.astro`
- Modify: `src/lib/sanity.ts`（每個 `Q` 加 i18n 投影）、`src/lib/site.ts`（取得函式收 `lang`）、`src/lib/column.ts`、`src/lib/events.ts`（中文標籤改查 ui）、`src/layouts/Base.astro`、`src/layouts/Article.astro`、`src/components/Header.astro`、`Footer.astro`、`EventCard.astro`、`ArticleCard.astro`、`SideList.astro`、`PortableText.astro`、`src/styles/site.css`、`tests/i18n.test.mts`

**Interfaces:**
- Consumes: Task 1 全部。
- Produces:
```ts
// sanity.ts
export function withI18n(projection: string): string
//   '{ a, b }' → '{ a, b, "i18n": translations{ "en": en{ a, b } } }'（依 LANGS 非 zh 語言產生）
// ui.ts
export const UI: { zh: Record<UiKey, string>; en: Record<UiKey, string> }
export type UiKey = keyof typeof UI.zh
export function t(lang: Lang, key: UiKey): string
export function catLabel(value: string | undefined, lang: Lang): string     // 用 column.ts 的 CATEGORIES 值
export function seriesName(series: string | undefined, lang: Lang): string  // zh＝seriesLabel 現行行為；en 查 SERIES_EN，查不到退回 zh
// site.ts
getSettings(lang: Lang), getNavigation(lang: Lang), getThemes(lang: Lang), getActivityTypes(lang: Lang)  // 快取原始資料，回傳 localize 後的結果
// events.ts
badgeOf(...) 回傳 { kind } 外加 label 改為 badgeLabel(kind, lang)；STATUS_FILTERS 的 label 改為 UiKey
// Base.astro props 新增
lang?: Lang = 'zh'; translated?: boolean = true
// EventCard / ArticleCard / SideList props 新增 lang: Lang；item._untranslated 為 true 時顯示卡片小標籤
// PortableText props 新增 lang: Lang；連結 href 經 localizePath
// UntranslatedNote props: { lang: Lang; show: boolean }  —— 只有 lang==='en' && show 時輸出提示
```
- 所有 GROQ 投影（含 `->` 參照進來的 author、activityType、recapAuthor、pair、themes 的 events）都包 `withI18n`；沒有投影的查詢（如 `joinPage`）改成 `{ ... }` 再包。
- `Base.astro`：`<html lang>`、`og:locale`、`og:site_name`、標題後綴（en：`｜Slow Living Education Society of Taiwan` 改成 ` | Slow Living Education Society of Taiwan`）、JSON-LD 的 `name`/`description`/`areaServed` 依語言（en description 由 ui.ts 提供）；`lang==='en' && !translated` → 輸出 noindex；`translated` 時輸出 `zh-Hant`、`en`、`x-default`（指向中文）三個 hreflang，canonical 指向自己。行動選單 inline script 的「開啟選單／關閉選單」改從按鈕的 data 屬性讀。
- `Header`／`Footer`：選單 href 一律經 `localizePath(lang, …)`，比對目前頁面也用語言化後的路徑；logo 連到 `localizePath(lang,'/')`；aria-label 等固定字查 ui。
- `LangSwitch.astro`：放在 `header-actions` 裡、`nav-cta` 與漢堡之間。按鈕＋清單（`aria-haspopup="true"`、`aria-expanded`），項目是兩個 `<a>`，href 在建置時就是對應語言的同一路徑；inline script 在點擊時把 `location.search + location.hash` 接上去。Esc、點外面關閉；鍵盤可操作；觸控區 ≥ 44px；手機（≤1100px）只顯示圖示，`aria-label` 用 ui 的「語言／Language」。樣式依 `/lang-mockup` 方案 E。
- `tests/i18n.test.mts` 補：`UI.zh` 與 `UI.en` 的鍵集合完全相同、沒有空字串；`seriesName('慢活小語','en')` 不含中文（SERIES_EN 每個 `studio/schemaTypes/shared.ts` 的 SERIES 值都要有）；`catLabel` 對 CATEGORIES 每個值在 en 都不含中文。

- [ ] **Step 1:** 先在測試加上述 ui 斷言 → `npm test` 失敗。
- [ ] **Step 2:** 實作 `ui.ts`、`withI18n`、site/column/events 調整 → `npm test` 通過。
- [ ] **Step 3:** 實作 Base／Header／Footer／LangSwitch／卡片／PortableText／UntranslatedNote。現有頁面暫時傳 `lang="zh"`（預設值），中文行為不變。
- [ ] **Step 4:** `npm run build` 通過；手動抽查 `dist/about.html`、`dist/column.html`、`dist/events.html`：`<div class="page"` 到 `<footer` 之間的文字和 `.work/dist-before` 相同（自動檢查在 Task 5）。
- [ ] **Step 5: 瀏覽器驗證**（先重開 dev server，避免舊 CSS）：`/events?type=<任一 slug>#list` 點切換鈕選 English → 網址是 `/en/events?type=<slug>#list`（頁面此時 404 屬正常，Task 4 才建）；寬度 375px 時 Logo、地球、漢堡在同一列不重疊，地球可點且清單完整顯示；Esc 能關閉清單。
- [ ] **Step 6:** Commit：`feat(i18n): localized queries, UI strings and language switcher`

---

### Task 4: 每一頁的英文版

**Files:**
- Create: `src/views/{Home,About,Join,Partner,Board,Contact,BoardArea,NotFound,Events,EventDetail,Column,ColumnArticle,Theme}.astro`；`src/pages/en/` 底下對應的薄殼（`index、about、join、partner、board、contact、board-area、404、events、column`、`events/[slug]`、`column/[slug]`、`themes/[slug]`）
- Modify: `src/pages/` 每一頁改成薄殼；動態路由的 `getStaticPaths` 移到 lib（`column.ts`、`events.ts`、`site.ts` 各 export 一個 `…Paths()`），中英薄殼都呼叫它。`astro.config.mjs` 的 redirects 加 `'/en/plans': '/en/about#plans'`、`'/en/donate': '/en/partner#donate'`。

**Interfaces:**
- Consumes: Task 3 全部。
- 每個 view：`Astro.props.lang: Lang`；取資料後 `localize(…, lang)`；主要文件（單例頁或單篇文章／活動／主題所屬單例）的 `isTranslated` 傳給 `<Base translated>`，並在內容最上方放 `<UntranslatedNote>`；所有站內連結經 `localizePath`；`.astro` 裡寫死的中文（麵包屑「首頁」、按鈕字、alt、placeholder、篩選標籤、「上一篇／下一篇」等）全部改查 `t()`；`id="page-XXX"` 不變。列表頁不因單一卡片未翻譯而 noindex。
- 理監事頁、作者顯示名稱：`lang==='en' && nameEn` 時用 `nameEn`，否則 `name`。
- Article 結構化資料加 `inLanguage`（`zh-Hant` / `en`）。

- [ ] **Step 1:** 一次搬一頁：先搬 view、中文薄殼，`npm run build` 後比對該頁 `.page` 內文字與 `.work/dist-before` 相同，再加英文薄殼。按「簡單頁 → 列表頁 → 動態頁」順序。
- [ ] **Step 2:** 全部搬完 `npm run build` 通過；`dist/en/` 底下的頁面數＝中文頁面數（不含 redirect 頁）。
- [ ] **Step 3:** `npm run dev`，逐頁打開 `/en/...`：此時尚無譯文，每頁都顯示中文＋提示、`<meta name="robots" content="noindex">`、卡片有「Translation in progress」、介面固定字（選單外的）是英文。
- [ ] **Step 4:** Commit：`feat(i18n): English routes for every page`

---

### Task 5: Sitemap 與建置檢查

**Files:**
- Create: `scripts/check-i18n.mjs`
- Modify: `astro.config.mjs`（sitemap `filter`）、`package.json`（scripts 加 `"check:i18n": "node scripts/check-i18n.mjs"`）

**Interfaces:**
- sitemap `filter(page)`：把網址對應到 `dist/<路徑>.html`（根目錄為 `index.html`），讀檔，含 `name="robots" content="noindex` 就排除。取代現在的 board-area／404 正規表示式（這兩頁本來就 noindex）。
- `check-i18n.mjs` 讀 `dist/`，任何一項失敗 exit 1：
  - (a) 每個中文 html（不在 `en/` 下、不是 redirect 頁）都有 `en/` 對應檔
  - (b) 中文頁和 `.work/dist-before` 比對：`<title>`、meta description、canonical 相同；`<div class="page"` 到 `<footer` 之間去標籤（保留 `href` 值）、壓空白後文字相同。有差異印出頁名與前後各 80 字
  - (c) 有 noindex 的頁不在 `dist/sitemap-*.xml`，沒有的一定在
  - (d) `en/board-area.html` 有 noindex
  - (e) `en/` 頁面裡站內 `href="/…"` 都以 `/en` 開頭，例外：`/images/`、`/_astro/`、有副檔名的路徑、`/favicon`、`/apple-touch-icon`
  - 另外只印不擋：每個「已翻譯」英文頁 `.page` 內連續中文字超過 20 字的片段，供人工檢查
- [ ] **Step 1:** 實作後 `npm run build && npm run check:i18n` → 通過（此時英文頁全部 noindex，所以 sitemap 只有中文頁）。
- [ ] **Step 2:** 故意改壞一處驗證會擋：暫時在 `About.astro` 加一個未語言化的 `<a href="/join">` → (e) 失敗；還原。
- [ ] **Step 3:** Commit：`feat(i18n): sitemap follows noindex, build check script`

---

### Task 6: 翻譯流程腳本與本機預覽

**Files:**
- Create: `studio/migrations/i18n/lib.ts`, `studio/migrations/i18n/status.ts`, `studio/migrations/i18n/apply.ts`, `src/lib/overlay.ts`
- Modify: `src/lib/sanity.ts`（`I18N_OVERLAY=1` 時改走 overlay）、`package.json`（加 `groq-js`）、`studio/test-i18n.mts`

**檔案格式**（都在 repo 根目錄 `_private/translations/`，已 gitignore）：
- `source/<docId>.json`：`{ _id, _type, sourceHash, fields: { <可翻欄位>: <中文值> } }`
- `en/<docId>.json`：`{ _id, _type, sourceHash, translation: { <欄位>: <英文值>, reviewed: false, sourceHash } }`
- 寫入後搬到 `applied/en/<docId>.json`

**Interfaces — Produces（`lib.ts`，純函式）：**
```ts
export function statusOf(doc, lang): 'untranslated' | 'stale' | 'unreviewed' | 'ok'
export function checkTranslationShape(source: unknown, translation: unknown): string[]  // 回傳問題清單，空＝合格
export function planPatches(file, published, draft | null, opts: { force: boolean }): { skip?: string; patches: { id: string; set: Record<string, unknown> }[] }
```
- `checkTranslationShape`：兩邊遞迴比對，所有 `_key`、`_type`、陣列長度、以及「非文字值」（`href`、`url`、`asset._ref`、`icon`、數字、布林、日期格式字串、slug）必須相同；只有一般文字可以不同。
- `planPatches`：`file.sourceHash !== sourceHash(published)` → skip「中文在翻譯後被改過」；現有 `translations.<lang>.reviewed === true` 且未 force → skip「已校對，不覆蓋」；否則 patch `translations.<lang>`，已發布版一定寫，`draft` 存在也寫。
- `status.ts`：列出每種類型各狀態的文件（中文標題＋id）；`EXPORT=1` 時把 untranslated 與 stale 的寫成 `source/*.json`。
- `apply.ts`：讀 `en/*.json`，對每個檔案 `checkTranslationShape` 不合格就整批中止；全部 patch 放進**同一個 transaction** commit；成功後搬到 `applied/`；印出寫入／略過清單。`FORCE=1` 才覆蓋已校對。
- `overlay.ts`：`I18N_OVERLAY=1` 時，第一次查詢先抓全部已發布文件，把 `_private/translations/en/*.json` 的 `translation` 放進對應文件的 `translations.en`，之後每個查詢用 groq-js 在記憶體裡執行（帶 params）。`sanity.fetch` 的呼叫端不用改。

- [ ] **Step 1: 寫失敗測試**（加進 `studio/test-i18n.mts`）：
  - `planPatches`：有草稿 → patches 有兩個 id（`x`、`drafts.x`）；沒草稿 → 一個；hash 不符 → skip；已校對 → skip，force 時不 skip
  - `checkTranslationShape`：只改文字 → `[]`；改了 `href`、少一個陣列項目、`_key` 不同、少了 `asset._ref` → 各回報一個問題
  - `statusOf`：四種狀態各一例
- [ ] **Step 2:** `npm run test:i18n` → 失敗；實作 → 通過。
- [ ] **Step 3:** 本機試一筆：`cd studio && EXPORT=1 npx sanity exec migrations/i18n/status.ts --with-user-token`（唯讀），手寫一個 `en/aboutPage.json`，`I18N_OVERLAY=1 npm run dev` 打開 `/en/about` → 顯示英文、沒有提示、沒有 noindex；`/about` 不變。**不要執行 apply.ts。**
- [ ] **Step 4:** Commit：`feat(i18n): translation status/apply scripts and local overlay preview`

---

### Task 7: 第一輪全站翻譯

**Files:**
- Create: `docs/翻譯詞彙表.md`；`_private/translations/en/*.json`（不進 git）

- [ ] **Step 1:** 建 `docs/翻譯詞彙表.md`，固定以下譯名，其餘詞彙翻譯時補上：臺灣慢活教育學會＝Slow Living Education Society of Taiwan；慢活＝slow living；慢活專欄＝Slow Living Column；理事長＝President；副理事長＝Vice President；常務理事＝Executive Director；理事＝Director；常務監事＝Executive Supervisor；監事＝Supervisor；秘書長＝Secretary-General；顧問＝Advisor；會員大會＝General Assembly；活動回顧＝Event Recap；三大主題與學會活動類別的譯名在此定案後全站一致。人名不翻譯、不音譯。
- [ ] **Step 2:** `EXPORT=1` 跑 status 匯出全部 source。逐份翻譯寫成 `en/<docId>.json`：保留所有 `_key`、`_type` 與非文字值原樣，只換文字；`reviewed:false`；`sourceHash` 照抄 source；`nameEn` 不填。
- [ ] **Step 3:** 用 `checkTranslationShape` 檢查全部檔案（寫個一次性指令或在 apply 加 `DRY_RUN=1` 只檢查不寫）→ 零問題。
- [ ] **Step 4:** `I18N_OVERLAY=1 npm run build && npm run check:i18n` 通過；看「連續中文」報告，除了人名與學會中文名外沒有漏翻。
- [ ] **Step 5:** `I18N_OVERLAY=1 npm run dev`，請使用者預覽英文網站（白話說明：右上角地球可切換；目前看到的是本機預覽，還沒上線）。依使用者意見修改譯文檔，直到使用者滿意。
- [ ] **Step 6:** Commit 詞彙表：`docs: translation glossary`

---

### Task 8: 文件與收尾

**Files:**
- Modify: `docs/同事操作手冊.md`、`CLAUDE.md`
- Delete: `src/pages/lang-mockup.astro`

- [ ] **Step 1:** 操作手冊加：英文網站網址、後台「English 英文版」分頁在哪、「已校對」何時勾、「中文改過英文可能過時」提示的意思、要翻新內容就跟 Claude 說「幫我把○○翻成英文」。
- [ ] **Step 2:** `CLAUDE.md`：檔案結構加 `src/views/`、`src/pages/en/`、`src/lib/i18n.ts`、`ui.ts`、`studio/schemaTypes/i18n.ts`、`studio/migrations/i18n/`；同仁說法表加「幫我翻成英文」→（status 匯出 → 翻譯 → overlay 預覽 → 使用者說推上去時 apply）、「還有哪些沒翻」→ 跑 status 白話列出；「內容都在後台」一節加：新增可翻欄位要同步加進 `TRANSLATABLE`；介面固定字在 `ui.ts`。
- [ ] **Step 3:** 刪除 `src/pages/lang-mockup.astro`；`npm run build && npm run check:i18n && npm test && (cd studio && npm run test:i18n && npm run test:structure)` 全部通過。
- [ ] **Step 4:** Commit：`docs: English site workflow for staff and Claude`
- [ ] **Step 5:** 用白話跟使用者報告完成狀態，等「推上去」。

---

### Task 9: 上線（**只在使用者說「推上去」之後**）

- [ ] **Step 1:** `npm run build && npm run check:i18n` 再跑一次。
- [ ] **Step 2:** `cd studio && npx sanity deploy`（先讓後台有英文欄位）。
- [ ] **Step 3:** `npx sanity exec migrations/i18n/apply.ts --with-user-token`。確認輸出沒有「略過」；有的話先處理再繼續。
- [ ] **Step 4:** `npx sanity documents validate -y`，確認沒有因譯文產生的新驗證錯誤。
- [ ] **Step 5:** 合併 `feat/english-site` 到 `main`，push。說明：每份寫入的文件都會觸發一次重建，Cloudflare 會排隊建置數次，屬正常；以最後一次完成為準。
- [ ] **Step 6:** 等上線後檢查 https://slowlivingeducation.org/en 與兩三個內頁、`/sitemap-index.xml` 含英文頁；用白話回報。
- [ ] **Step 7:** 更新記憶檔 `sanity-cms-build-state.md`、`website-live-status.md`：英文版上線、翻譯流程與 `_private/translations/` 的位置。
