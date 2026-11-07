// 學會活動類別改為五類（2026-11-01 網站會議定案），順序：會員活動、慢活日、慢活講座、慢活工作坊、慢活論壇。
// 會員大會改名會員活動（網址代稱 assembly 不變）；身呼吸、教師培力併入新類別慢活工作坊，舊類別刪除前備份到 _private/backup/。
// 工作坊的圖示先沿用身呼吸的圖，新圖之後在後台換。
// 執行（在 studio/ 底下）：
//   PREVIEW=1 npx sanity exec migrations/2026-11-activity-types.ts --with-user-token   只寫本機預覽檔，再用 I18N_OVERLAY=1 npm run dev 看
//   DRY_RUN=1 npx sanity exec migrations/2026-11-activity-types.ts --with-user-token   列出會改什麼
//   npx sanity exec migrations/2026-11-activity-types.ts --with-user-token             寫入（發布後網站會自動更新）
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { getCliClient } from 'sanity/cli'
import { sourceHash } from '../schemaTypes/i18n'

const client = getCliClient({ apiVersion: '2024-01-01' }).withConfig({ perspective: 'raw' })
const PRIVATE = resolve(process.cwd(), '..', '_private')

const WORKSHOP = 'activity-workshop'
const REMOVED = ['activity-breath', 'activity-teacher']

const TYPES: Record<string, { title: string; description: string; order: number; en: { title: string; description: string } }> = {
  'activity-assembly': {
    title: '會員活動',
    order: 10,
    description: '會員相聚的時光，包含會員大會、理監事聚會與會員旅遊。一起回顧學會的足跡、交流想法，也在同行之中加深情誼，讓慢活的力量持續擴散。',
    en: {
      title: 'Member Activities',
      description: 'Time for members to come together, through the General Assembly, board gatherings and member trips. We look back on the society’s journey, exchange ideas and grow closer along the way, so that the spirit of slow living keeps spreading.',
    },
  },
  'activity-slow-day': {
    title: '慢活日',
    order: 20,
    description: '在老家或熟識的店家，透過親手做的 DIY 活動，和大家一起慢慢過一天。未來也歡迎會員在各地舉辦，讓慢活走進身邊的生活場域。',
    en: {
      title: 'Slow Living Day',
      description: 'At an old family home or a favourite local shop, we spend a day slowly together through hands-on DIY activities. In the future, members are welcome to host their own in communities around Taiwan, bringing slow living into the places close to them.',
    },
  },
  'activity-talk': {
    title: '慢活講座',
    order: 30,
    description: '單場演講，走進企業、幼兒園等不同場域，分享慢的力量，陪伴大家關注身心健康、調節生活節奏，將慢活的理念帶回生活與工作之中。',
    en: {
      title: 'Slow Living Talks',
      description: 'Single-session talks that visit companies, preschools and other settings to share the power of slowing down, helping people attend to their wellbeing and adjust the pace of life — bringing the ideas of slow living back into daily life and work.',
    },
  },
  [WORKSHOP]: {
    title: '慢活工作坊',
    order: 40,
    description: '整合身呼吸、教師培力與手作，時數較長、互動性高。透過實際練習與彼此交流，把覺察與慢活實踐，一步步帶進日常生活與教育現場。',
    en: {
      title: 'Slow Living Workshops',
      description: 'Bringing together Body & Breath, Teacher Empowerment and handcrafts, these longer, highly interactive sessions use hands-on practice and shared conversation to carry awareness and slow living, step by step, into everyday life and the classroom.',
    },
  },
  'activity-forum': {
    title: '慢活論壇',
    order: 50,
    description: '由學會主辦，邀請多位講者同台對話，交流慢活的實踐與想像，並每年產出慢活教育成果報告，讓更多人看見放慢腳步帶來的改變。',
    en: {
      title: 'Slow Living Forum',
      description: 'Hosted by the society, these forums bring several speakers to one stage to exchange practices and visions of slow living. Each year they lead to a report on the outcomes of slow living education, so that more people can see the change that slowing down brings.',
    },
  },
}

const SEO = '臺灣慢活教育學會的活動：會員活動、慢活日、慢活講座、慢活工作坊、慢活論壇五大學會活動介紹，近期開放報名的活動，以及活動回顧。'
const SEO_EN = 'Events of the Slow Living Education Society of Taiwan: our five activities — Member Activities, Slow Living Day, Slow Living Talks, Slow Living Workshops and Slow Living Forum — plus events open for registration and event recaps.'

/** 中文改了之後重算 sourceHash，譯文才不會被標成過時；reviewed 維持 false 等同仁校對 */
const withEn = (doc: any, en: Record<string, unknown>) => {
  const tr = { ...doc.translations?.en, ...en, reviewed: false, sourceHash: sourceHash(doc, doc._type) }
  return { ...doc, translations: { ...doc.translations, en: tr } }
}

async function run() {
  const docs: any[] = await client.fetch(`*[_type == "activityType" || _type == "eventsPage" || references($removed)]`, { removed: REMOVED })
  const byId = new Map(docs.map((d) => [d._id, d]))
  const breath = byId.get('activity-breath')
  if (!breath) throw new Error('找不到 activity-breath，可能已經執行過')

  const next: any[] = []
  for (const [id, t] of Object.entries(TYPES)) {
    const { en, ...zh } = t
    const base = byId.get(id) ?? {
      _id: id,
      _type: 'activityType',
      slug: { _type: 'slug', current: 'workshop' },
      icon: '🧶',
      image: breath.image,
    }
    next.push(withEn({ ...base, ...zh }, en))
  }
  // 草稿跟著改，同仁之後按發布才不會把舊類別蓋回來
  for (const d of docs.filter((x) => x._type === 'eventsPage')) {
    next.push(withEn({ ...d, seoDescription: SEO }, { seoDescription: SEO_EN }))
  }
  const events = docs.filter((d) => d._type === 'event')
  for (const ev of events) next.push({ ...ev, activityType: { _type: 'reference', _ref: WORKSHOP } })

  const others = docs.filter((d) => d._type !== 'event' && d._type !== 'activityType' && d._type !== 'eventsPage')
  if (others.length) throw new Error(`還有其他文件參照舊類別：${others.map((d) => d._id).join('、')}`)
  const drafts = docs.filter((d) => d._type === 'activityType' && d._id.startsWith('drafts.'))
  if (drafts.length) throw new Error(`類別有未發布草稿，請先處理：${drafts.map((d) => d._id).join('、')}`)

  for (const d of next) console.log(`${byId.has(d._id) ? '修改' : '新增'}  ${d._type}  ${d._id}  ${d.title ?? ''}`)
  for (const id of REMOVED) console.log(`刪除  activityType  ${id}`)

  if (process.env.PREVIEW === '1') {
    mkdirSync(resolve(PRIVATE, 'preview'), { recursive: true })
    const file = resolve(PRIVATE, 'preview', 'activity-types.json')
    writeFileSync(file, JSON.stringify({ upsert: next, remove: REMOVED }, null, 2))
    console.log(`已寫入本機預覽檔 ${file}，後台沒有改動`)
    return
  }
  if (process.env.DRY_RUN === '1') return

  mkdirSync(resolve(PRIVATE, 'backup'), { recursive: true })
  writeFileSync(resolve(PRIVATE, 'backup', '2026-11-activity-types.json'), JSON.stringify(docs, null, 2))

  // 同一筆交易：活動改指向新類別後，舊類別才刪得掉
  const tx = client.transaction()
  for (const d of next) {
    const { _rev, _updatedAt, _createdAt, ...doc } = d
    tx.createOrReplace(doc)
  }
  for (const id of REMOVED) tx.delete(id)
  await tx.commit()
  console.log('完成：學會活動類別已改為五類')
}

run()
