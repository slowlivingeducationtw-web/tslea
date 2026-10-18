// 發布《種土》放映側記：它引用的作者「謝啟彬」只有草稿，所以側記一直發布失敗。
// 執行（在 studio/ 底下）：npx sanity exec migrations/2026-10-publish-zhong-tu-recap.ts --with-user-token
// 先把作者和側記一起從草稿轉成正式版（同一筆交易，要嘛都成功、要嘛都不動）。
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2021-06-07' })

const strip = ({ _rev, _updatedAt, _createdAt, ...doc }: any) => doc

async function run() {
  const author = await client.getDocument('drafts.author-hsieh')
  const event = await client.getDocument('drafts.event-zhong-tu-screening')
  if (!author || !event) throw new Error('找不到草稿')

  const { _strengthenOnPublish, ...recapAuthor } = event.recapAuthor

  await client
    .transaction()
    .createOrReplace({ ...strip(author), _id: 'author-hsieh' })
    .delete('drafts.author-hsieh')
    .createOrReplace({ ...strip(event), _id: 'event-zhong-tu-screening', recapAuthor })
    .delete('drafts.event-zhong-tu-screening')
    .commit()

  console.log('已發布：謝啟彬、《種土》放映側記')
}

run()
