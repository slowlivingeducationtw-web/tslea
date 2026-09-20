// 用 Sanity 真正的 structure builder 序列化整個選單。
// Studio 啟動時就是跑這段；「`id` is required for lists」在這裡就會被抓到。
// 註：documentTypeListItem 的子項需要執行期環境才解析得出來，離線跳過。
import { createStructureBuilder } from 'sanity/structure'
import { createSchema } from 'sanity'
import { structure } from './structure'
import { schemaTypes } from './schemaTypes'

const schema = createSchema({ name: 'test', types: schemaTypes as any })
const source: any = {
  projectId: '2lbk0ta8', dataset: 'production', schema,
  currentUser: null, getClient: () => ({}) as any, i18n: { t: (k: string) => k },
}

const S = createStructureBuilder({ source })
const serialized = (structure as any)(S, {}).serialize()

let items = 0
let lists = 1
const walk = (node: any, depth = 0) => {
  if (!node.id) throw new Error('清單缺少 id')
  for (const item of node.items || []) {
    if (item.type === 'divider') continue
    items++
    if (!item.id) throw new Error(`項目缺少 id：${item.title}`)
    let c: any = item.child
    let kind = ''
    try {
      if (typeof c === 'function') c = c()
      const ser = c?.serialize ? c.serialize() : c
      if (ser && typeof ser === 'object' && ser.items) {
        kind = '›'
        lists++
        console.log('  '.repeat(depth + 1) + `${String(item.id).padEnd(16)} ${item.title}  ${kind}`)
        walk(ser, depth + 1)
        continue
      }
      kind = ser?.type === 'document' ? '（單一文件）' : ''
    } catch {
      kind = '（文件清單，執行期解析）'
    }
    console.log('  '.repeat(depth + 1) + `${String(item.id).padEnd(16)} ${item.title}  ${kind}`)
  }
}

console.log(`根層 id = ${serialized.id}\n`)
walk(serialized)
console.log(`\n✓ ${lists} 個清單、${items} 個項目，全部有 id，序列化通過`)
