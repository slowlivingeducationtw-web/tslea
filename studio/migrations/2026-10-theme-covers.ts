// 三大主題封面：上傳調好色的照片，放進「慢活共學主題」的草稿（不發布，讓同仁在後台確認後自己按發布）。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-theme-covers.ts --with-user-token -- <照片資料夾> <health|art|eco|all>
import { createReadStream } from 'node:fs'
import { join } from 'node:path'
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2021-06-07' })
const dir = process.argv[process.argv.length - 2]
// 只更新指定的主題（例：health），all＝三個都更新
const only = process.argv[process.argv.length - 1]

const covers: Record<string, { file: string; alt: string }> = {
  health: { file: 'theme-health.jpg', alt: '陽光穿過金黃的楓香葉，畫面上寫著：慢慢呼吸，慢慢成熟，很好' },
  art: { file: 'theme-art.jpg', alt: '圓桌上擺滿學員用粉蠟筆畫在黑卡上的花朵作品，大家伸手指著討論、拍照' },
  eco: { file: 'theme-eco.jpg', alt: '五位學員蹲在開滿黃色小花的草地裡，笑著看向鏡頭' },
}

async function run() {
  const draft = await client.getDocument('drafts.themesSection')
  if (!draft) throw new Error('找不到「慢活共學主題」草稿')

  const patch = client.patch('drafts.themesSection')
  for (const t of draft.themes ?? []) {
    const c = covers[t.slug?.current]
    if (!c || (only !== 'all' && only !== t.slug?.current)) continue
    const asset = await client.assets.upload('image', createReadStream(join(dir, c.file)), { filename: c.file })
    patch.set({ [`themes[_key=="${t._key}"].image`]: { _type: 'photo', alt: c.alt, asset: { _type: 'reference', _ref: asset._id } } })
    console.log(t.title, '→', asset._id)
  }
  await patch.commit()
}

run()
