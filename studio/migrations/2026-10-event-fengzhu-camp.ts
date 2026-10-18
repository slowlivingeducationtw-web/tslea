// 建立活動〈豐珠中學慢活營〉（2026-08-05～08-21，六天課程，學會首次組成「慢活教育教師群」），只建草稿。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-event-fengzhu-camp.ts --with-user-token
import { randomUUID } from 'node:crypto'
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-01-01' })
const key = () => randomUUID().replace(/-/g, '').slice(0, 12)

const block = (text: string, style = 'normal', marks: string[] = []) => ({
  _key: key(),
  _type: 'block',
  style,
  markDefs: [],
  children: [{ _key: key(), _type: 'span', marks, text }],
})
// 「慢慢舞動（太極導引）｜黃心恬」：課名粗體，老師一般字
const course = (name: string, teacher: string) => ({
  _key: key(),
  _type: 'block',
  style: 'normal',
  listItem: 'bullet',
  level: 1,
  markDefs: [],
  children: [
    { _key: key(), _type: 'span', marks: ['strong'], text: name },
    { _key: key(), _type: 'span', marks: [], text: `｜${teacher}` },
  ],
})

const DAYS: [string, [string, string][]][] = [
  ['8 月 5 日（Day 1）', [['慢慢舞動（太極導引）', '黃心恬'], ['慢慢聆聽（頌缽）', '劉比 Abi、博瀅 Diva']]],
  ['8 月 6 日（Day 2）', [['慢慢採藥（藥香）', '陳鵬文'], ['慢慢芬芳（精油）', '小嵐']]],
  ['8 月 7 日（Day 3）', [['慢慢觀看（攝影）', '吳順卿'], ['慢慢編織', 'Claire']]],
  ['8 月 19 日（Day 4）', [['慢慢按摩（經絡）', '陳建城'], ['慢慢料理（甜點）', '何欣蓉']]],
  ['8 月 20 日（Day 5）', [['慢慢欣賞（古琴）', '黃小樂']]],
  ['8 月 21 日（Day 6）', [['慢慢書寫（文學）、慢慢祝福（表達創作）', '陳鵬文']]],
]

async function run() {
  const intro = [
    block('今年夏天，臺灣慢活教育學會首次集結會員夥伴，組成「慢活教育教師群」，一起前往由林麗雲校長帶領的豐珠中學授課，透過六天課程帶給學生們多元的體驗學習，一起認識慢的力量，一起學習認識生命幸福的源頭。'),
    block('課程介紹', 'h3'),
    ...DAYS.flatMap(([day, courses]) => [block(day, 'h4'), ...courses.map(([n, t]) => course(n, t))]),
    block('感恩各位會員教師在百忙中安排時間，一起前往學校與學生們共學！'),
    block('特別感恩林麗雲校長提供各位教師學習機會；更感恩黃小樂老師幫忙邀請到台北港智樂器公益贊助本次教學的 8 床古琴，還願意專程送琴到學校，萬分感恩！', 'note'),
  ]

  const doc = {
    _id: 'drafts.event-fengzhu-camp-2026',
    _type: 'event',
    title: '豐珠中學慢活營',
    slug: { _type: 'slug', current: 'fengzhu-camp-2026' },
    activityType: { _type: 'reference', _ref: 'activity-talk' },
    dateLabel: '2026 · 08 · 05 – 08 · 21（共六天）',
    sortDate: '2026-08-21',
    place: '豐珠中學',
    description: '學會首次組成「慢活教育教師群」，走進豐珠中學帶來六天慢活營：太極、頌缽、藥香、精油、攝影、編織、經絡、甜點、古琴與文學，陪學生認識慢的力量。',
    intro,
    links: [{ _key: key(), _type: 'link', title: '🎵 古琴贊助：港智樂器（Facebook）', url: 'https://www.facebook.com/share/1WFfKaDuDx/' }],
  }

  await client.createOrReplace(doc)
  console.log('已建立草稿：', doc.title)
}

run()
