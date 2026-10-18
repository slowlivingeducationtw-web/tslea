// 〈苗栗青年藝術論壇〉補上阿利（Allie 利宜玲）個人展演《被觀看的基本需求》的照片與介紹（寫進草稿，同仁確認後按發布）。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-event-miaoli-allie.ts --with-user-token -- <海報合照> <海報資訊圖> <採土照1> <採土照2>
import { createReadStream } from 'node:fs'
import { basename } from 'node:path'
import { randomUUID } from 'node:crypto'
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-01-01' })
const files = process.argv.slice(2).filter((f) => /\.(jpe?g|png)$/i.test(f))
const key = () => randomUUID().replace(/-/g, '').slice(0, 12)

const block = (text: string, style = 'normal', marks: string[] = []) => ({
  _key: key(),
  _type: 'block',
  style,
  markDefs: [],
  children: [{ _key: key(), _type: 'span', marks, text }],
})
const bullet = (text: string) => ({ ...block(text), listItem: 'bullet', level: 1 })

async function run() {
  if (files.length !== 4) throw new Error('需要 4 張圖片：海報合照、海報資訊圖、採土照 1、採土照 2')
  const img = async (f: string) => ({
    _type: 'image',
    asset: { _type: 'reference', _ref: (await client.assets.upload('image', createReadStream(f), { filename: basename(f) }))._id },
  })
  const [poster, info, soil1, soil2] = await Promise.all(files.map(img))
  const posterAlt = '阿利（利宜玲）戴著紅色棒球帽，手持《被觀看的基本需求》展演海報微笑'

  const intro = [
    block('青年藝術家阿利（Allie 利宜玲）的個人展演《被觀看的基本需求》，以行為藝術與互動式藝術的形式，邀請觀眾走進苗栗市的街巷，一起經歷「觀看」與「被觀看」。'),
    block('觀看者與被觀看者的狀態，一旦觀看發生，便發生了糾纏——即我們的世界，沒有所謂純粹的旁觀者。', 'blockquote'),
    { _key: key(), _type: 'imageRow', images: [
      { _key: key(), _type: 'figure', image: soil1, alt: '阿利在山邊的土地公廟前，彎腰用手捧起泥土放進黃色水桶' },
      { _key: key(), _type: 'figure', image: soil2, alt: '阿利蹲在菜園的泥土地上，用小鏟子把土挖進黃色水桶' },
    ] },
    block('演出資訊', 'h3'),
    bullet('演出日期：2026 年 6 月每週六、日及端午假期（預約制，4 人成行）'),
    bullet('集合時間：下午 2 點'),
    bullet('集合地點：苗栗市勵志街 36 巷前'),
    block('演出座談', 'h3'),
    bullet('日期：2026 年 6 月 28 日'),
    bullet('地點：老家咖啡'),
    bullet('提供免費茶點（限 20 人）'),
    { _key: key(), _type: 'figure', image: info, alt: '《被觀看的基本需求》展演資訊：集合地點苗栗市勵志街36巷前、下午2點集合、6月每週六日及端午假期4人成行、6月28日座談於老家咖啡' },
  ]

  for (const id of ['event-miaoli-art']) {
    const base: any = (await client.getDocument(`drafts.${id}`)) ?? (await client.getDocument(id))
    await client.createOrReplace({
      ...base,
      _id: `drafts.${id}`,
      description: '支持青年藝術家阿利（Allie 利宜玲），以行為藝術《被觀看的基本需求》結合座談，在苗栗展開一場關於觀看、藝術與生命的對話。',
      place: '苗栗市勵志街 36 巷（座談：老家咖啡）',
      cover: { _type: 'figure', image: poster, alt: posterAlt },
      intro,
    })
    console.log('已建立草稿：', base.title)
  }
}

run()
