// 2026-10：把原本寫在網站程式裡的文字（首頁輪播、各頁文案、選單、頁尾）搬進後台。
// 只新增欄位、不刪舊欄位，所以跑完之後舊版網站照樣能建置。
// 舊欄位等新版網站上線後，再用 2026-10-cleanup-old-fields.ts 清掉。
//
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-all-page-text.ts --with-user-token
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-01-01' })

let n = 0
const key = () => `k${Date.now().toString(36)}${(n++).toString(36)}`
const withKeys = <T extends object>(arr: T[], type?: string) =>
  arr.map((x) => ({ _key: key(), ...(type ? { _type: type } : {}), ...x }))
const link = (label: string, href: string) => ({ _key: key(), _type: 'navLink', label, href })
const para = (...parts: (string | { text: string; href: string })[]) => {
  const markDefs: any[] = []
  const children = parts.map((p) => {
    if (typeof p === 'string') return { _type: 'span', _key: key(), text: p, marks: [] }
    const k = key()
    markDefs.push({ _type: 'link', _key: k, href: p.href })
    return { _type: 'span', _key: key(), text: p.text, marks: [k] }
  })
  return [{ _type: 'block', _key: key(), style: 'normal', markDefs, children }]
}

const FB =
  'https://www.facebook.com/p/%E8%87%BA%E7%81%A3%E6%85%A2%E6%B4%BB%E6%95%99%E8%82%B2%E5%AD%B8%E6%9C%83-61581637359240/'

async function run() {
  const home = await client.getDocument('homePage')
  const themesDoc = await client.getDocument('themesSection')
  if (!home || !themesDoc) throw new Error('找不到 homePage 或 themesSection')

  const tx = client.transaction()

  // ── 網站設定 ──
  tx.patch('siteSettings', (p) =>
    p.setIfMissing({ facebook: FB, footerNote: '非營利公益社會團體' }),
  )

  // ── 選單與頁尾 ──
  tx.createIfNotExists({
    _id: 'navigation',
    _type: 'navigation',
    mainNav: withKeys(
      [
        {
          label: '認識學會',
          href: '/about',
          children: [
            link('學會簡介', '/about'),
            link('理監事名單', '/board'),
            link('年度計畫', '/plans'),
            link('捐款支持', '/donate'),
            link('聯絡我們', '/contact'),
          ],
        },
        {
          label: '慢活共學',
          href: '/#learning',
          children: [link('三大共學主題', '/#learning'), link('活動與共學形式', '/#formats')],
        },
        { label: '活動', href: '/events' },
        {
          label: '慢活專欄',
          href: '/column',
          children: [
            link('全部文章', '/column'),
            link('身心健康', '/column?cat=health'),
            link('藝術陪伴', '/column?cat=art'),
            link('生態永續', '/column?cat=eco'),
            link('慢旅共學', '/column?cat=travel'),
          ],
        },
        {
          label: '與我們合作',
          href: '/partner',
          children: [
            link('個人捐款', '/donate'),
            link('企業合作', '/partner#business'),
            link('合作學校', '/partner#school'),
            link('課程演講邀約', '/partner#talk'),
          ],
        },
      ],
      'navItem',
    ),
    headerCta: { _type: 'navLink', label: '加入我們', href: '/join' },
    footerGroups: withKeys(
      [
        {
          title: '一起慢活',
          links: [link('加入我們', '/join'), link('與我們合作', '/partner'), link('捐款支持', '/donate')],
        },
        {
          title: '了解更多',
          links: [
            link('認識學會', '/about'),
            link('理監事名單', '/board'),
            link('年度計畫', '/plans'),
            link('活動', '/events'),
            link('慢活專欄', '/column'),
          ],
        },
        {
          title: '聯絡我們',
          links: [
            link('聯絡方式', '/contact'),
            link('來信給我們', 'mailto:slowlivingeducation@gmail.com'),
            link('理監事專區', '/board-area'),
          ],
        },
      ],
      'footerGroup',
    ),
    facebookLabel: '在 Facebook 保持關注',
  })

  // ── 首頁 ──
  tx.patch('homePage', (p) =>
    p.set({
      heroSlides: withKeys(
        [
          {
            pre: '慢下來，',
            title: '讓學習與生活\n重新連結',
            sub: '教育不只是知識的傳遞，更是讓人與自己、他人、自然重新連結的旅程。',
            tone: 'forest',
          },
          {
            title: '「慢活」是實踐終身學習、互助共好、智慧傳承的生活文化',
            sub: '讓我們一起慢慢呼吸，慢慢學習，很好。',
            tone: 'mist',
          },
          {
            pre: '三大共學主題',
            title: '身心健康・藝術陪伴・生態永續',
            sub: '從身心到自然，探索更豐富的生活可能。',
            tone: 'leaf',
          },
        ],
        'heroSlide',
      ),
      statement: '我們相信，\n學習是享受快樂、\n找回意義的最佳方式。',
      statementHighlight: '學習',
      eventsTitle: '近期活動',
      eventsSub: '一起參與，創造更多美好的學習時光',
      tilesTitle: '探索更多',
      tiles: withKeys(
        [
          { title: '慢活專欄', text: '會員執筆的慢活故事', href: '/column', tone: 'forest' },
          { title: '認識學會', text: '理念、理監事與年度計畫', href: '/about', tone: 'slate' },
          { title: '與我們合作', text: '企業、學校與課程演講邀約', href: '/partner', tone: 'clay' },
          { title: '聯絡我們', text: '入會、投稿或任何想法', href: '/contact', tone: 'olive' },
        ],
        'tile',
      ),
      ctaTitle: '一起慢下來',
      ctaText: '願每個人都能在學習裡，找回與自己、他人與自然的連結。',
      ctaButtons: [link('加入我們', '/join'), link('捐款支持', '/donate')],
      seoTitle: '臺灣慢活教育學會｜慢下來，讓學習與生活重新連結',
      seoDescription:
        '臺灣慢活教育學會以身心健康、藝術陪伴、生態永續三大共學主題，推廣慢活教育與終身學習。認識學會、探索共學方式與近期活動，一起放慢腳步。',
    }),
  )

  // ── 慢活共學（主題＋形式）──
  const EXTRA: Record<string, { en: string; category: string }> = {
    身心健康: { en: 'Body & Mind', category: 'health' },
    藝術陪伴: { en: 'Art & Companionship', category: 'art' },
    生態永續: { en: 'Ecology & Sustainability', category: 'eco' },
  }
  tx.patch('themesSection', (p) =>
    p.set({
      title: '我們怎麼一起學',
      themes: (themesDoc.themes as any[]).map((t) => ({ ...t, ...(EXTRA[t.title] ?? {}) })),
      formatsTitle: '共學形式',
      formats: withKeys(
        [
          { icon: '🎙️', title: '共學講座', description: '由會員輪流擔任講者，分享自己的慢活實踐，留下影音紀錄讓大家隨時回顧。' },
          { icon: '🎬', title: '論壇與放映座談', description: '透過論壇、紀錄片放映與映後座談，邀請不同世代坐在一起對話與傾聽。' },
          { icon: '🚂', title: '慢旅共學', description: '以旅行作為學習方式，走入在地的生態、文化與人情，體驗慢活最真實的樣子。' },
          { icon: '✍️', title: '文字共學', description: '會員以文字分享慢活的日常智慧，刊載於慢活專欄，每一篇都是一次共學。' },
        ],
        'format',
      ),
    }),
  )

  // ── 認識學會 ──
  tx.createIfNotExists({
    _id: 'aboutPage',
    _type: 'aboutPage',
    title: '認識學會',
    lead: '以「慢活」為語言，搭建個人與社會的橋梁。',
    seoDescription:
      '臺灣慢活教育學會推廣慢活教育與終身學習，以身心健康、藝術陪伴、生態永續三大共學主題，營造互助共好的生活文化。',
    body: home.aboutBody,
    linksTitle: '組織與參與',
    links: withKeys(
      [
        { title: '理監事名單', text: '本屆理事、監事與行政秘書處。', href: '/board' },
        { title: '年度計畫', text: '會務運作、業務發展、專案計畫與財務規劃。', href: '/plans' },
        { title: '捐款支持', text: '支持學會推動慢活教育的公益行動。', href: '/donate' },
        { title: '聯絡我們', text: '入會諮詢、專欄投稿、合作與贊助。', href: '/contact' },
      ],
      'linkCard',
    ),
  })

  // ── 加入我們 ──
  tx.createIfNotExists({
    _id: 'joinPage',
    _type: 'joinPage',
    title: '一起加入我們',
    lead: '如果你也嚮往一種更從容、更有連結的生活與學習方式，歡迎用你適合的方式參與學會。',
    seoDescription: '加入臺灣慢活教育學會：成為會員或擔任志工，一起推廣慢活教育。',
    cards: withKeys(
      [
        {
          anchor: 'member',
          icon: '🌱',
          title: '加入會員',
          text: '認同慢活教育理念，想一起參與共學、會員大會與學會發展的朋友，歡迎來信了解入會資格與流程。',
          ctaLabel: '來信詢問入會',
          emailSubject: '入會詢問',
          note: '線上入會申請表 待補',
        },
        {
          anchor: 'volunteer',
          icon: '🤝',
          title: '成為志工',
          text: '願意在活動現場、文書或社群經營上出一份力，請來信告訴我們你的專長與可參與的時間。',
          ctaLabel: '來信報名志工',
          emailSubject: '志工報名',
          note: '志工報名表 待補',
        },
      ],
      'actionCard',
    ),
    footnote: para(
      '企業、學校合作或課程演講邀約，請見',
      { text: '與我們合作', href: '/partner' },
      '；其他問題歡迎',
      { text: '聯絡我們', href: '/contact' },
      '。',
    ),
  })

  // ── 與我們合作 ──
  tx.createIfNotExists({
    _id: 'partnerPage',
    _type: 'partnerPage',
    title: '與我們合作',
    lead: '慢活教育需要更多夥伴一起推動。無論是個人、企業、學校或團體，都歡迎用適合的方式與我們同行。',
    seoDescription: '與臺灣慢活教育學會合作：個人捐款、企業合作、合作學校、課程演講邀約。',
    cards: withKeys(
      [
        {
          anchor: 'donate',
          icon: '💚',
          title: '個人捐款',
          text: '您的支持將用於推動慢活共學活動、藝術陪伴與公益專案，讓更多人有機會放慢腳步、一起學習。',
          ctaLabel: '前往捐款支持',
          href: '/donate',
        },
        {
          anchor: 'business',
          icon: '🤝',
          title: '企業合作',
          text: '歡迎理念相近的企業贊助學會的公益專案活動，或與我們共同規劃合作方案，一起推廣慢活教育。',
          ctaLabel: '來信洽談企業合作',
          emailSubject: '企業合作洽詢',
        },
        {
          anchor: 'school',
          icon: '🏫',
          title: '合作學校',
          text: '歡迎學校與我們聯繫，共同規劃校園講座、紀錄片放映與映後座談等活動，把社會情緒學習與慢活實踐帶進校園。',
          ctaLabel: '來信洽談學校合作',
          emailSubject: '學校合作洽詢',
        },
        {
          anchor: 'talk',
          icon: '🎙️',
          title: '課程演講邀約',
          text: '學會夥伴來自身心健康、藝術陪伴、生態永續等不同領域。歡迎機關、社區與團體邀請講座或課程，來信請告訴我們時間、對象、人數與希望的主題。',
          ctaLabel: '來信邀約課程演講',
          emailSubject: '課程演講邀約',
        },
      ],
      'actionCard',
    ),
    footnote: para('其他合作想法，也歡迎前往', { text: '聯絡我們', href: '/contact' }, '。'),
  })

  // ── 活動 ──
  tx.createIfNotExists({
    _id: 'eventsPage',
    _type: 'eventsPage',
    title: '活動',
    lead: '一起參與，創造更多美好的學習時光。',
    seoDescription: '臺灣慢活教育學會的活動：即將舉行與持續進行的共學活動，以及已辦理的活動紀錄。',
    facebookNote: true,
    currentTitle: '即將舉行／持續進行',
    emptyText: '目前沒有公告中的活動，新活動會公布在這裡。',
    pastTitle: '已辦理',
  })

  // ── 慢活專欄 ──
  tx.createIfNotExists({
    _id: 'columnPage',
    _type: 'columnPage',
    title: '慢活專欄',
    lead: '由學會各領域會員執筆，以文字、圖文分享慢活實踐的日常智慧。每一篇文章，都是一個邀請——邀請你放慢腳步，重新與自己相遇。',
    seoDescription:
      '由學會各領域會員執筆的慢活專欄——精油氣味、漢字文化、生態永續與慢旅共學，以文字分享慢活實踐的日常智慧。',
    emptyText: para('這個分類目前還沒有文章，歡迎', { text: '投稿分享', href: '/contact' }, '。'),
  })

  const res = await tx.commit()
  console.log(`完成：${res.results.length} 筆異動`)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
