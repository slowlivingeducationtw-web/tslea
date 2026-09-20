import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { zhHantLocale } from '@sanity/locale-zh-hant'

import { schemaTypes, SINGLETONS } from './schemaTypes'
import { structure } from './structure'
import { theme } from './theme'
import { Logo } from './components/Logo'

export default defineConfig({
  name: 'tslea',
  title: '臺灣慢活教育學會',
  icon: Logo,

  // 後台配色沿用網站的色票（沙綠／大地／奶油），見 theme.ts
  theme,

  projectId: '2lbk0ta8',
  dataset: 'production',

  plugins: [
    structureTool({ structure }),
    // 查詢工具：只給管理者用，同事不需要
    visionTool({ defaultApiVersion: '2026-01-01' }),
    zhHantLocale(),
  ],

  schema: {
    types: schemaTypes,
    // 單例文件不應該出現在「建立新文件」的清單裡
    templates: (prev) => prev.filter((t) => !SINGLETONS.includes(t.schemaType as any)),
  },

  document: {
    // 單例文件不能被建立第一份以外的複本，也不能刪除
    actions: (prev, { schemaType }) =>
      SINGLETONS.includes(schemaType as any)
        ? prev.filter(({ action }) => !['duplicate', 'delete', 'unpublish'].includes(action as string))
        : prev,
  },
})
