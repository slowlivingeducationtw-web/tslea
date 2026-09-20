import { buildLegacyTheme } from 'sanity'

// 學會的色票，與網站 global.css 的 :root 變數一致。
const p = {
  sage: '#7a8c6e',
  sageLight: '#a8b89a',
  sagePale: '#eef2eb',
  earth: '#b5845a',
  earthLight: '#d4a97a',
  sky: '#6a8aa0',
  cream: '#f5f0e8',
  warmWhite: '#faf7f2',
  charcoal: '#2c2c2a',
  muted: '#7a7570',
  white: '#ffffff',
  danger: '#b5534a',
  warning: '#c08a3e',
  success: '#6b8f5e',
}

export const theme = buildLegacyTheme({
  '--black': p.charcoal,
  '--white': p.white,

  '--gray': p.muted,
  '--gray-base': p.muted,

  '--component-bg': p.warmWhite,
  '--component-text-color': p.charcoal,

  // 主色：沙綠。按鈕、選取狀態、強調都吃這個。
  '--brand-primary': p.sage,

  '--default-button-color': p.muted,
  '--default-button-primary-color': p.sage,
  '--default-button-success-color': p.success,
  '--default-button-warning-color': p.warning,
  '--default-button-danger-color': p.danger,

  '--state-info-color': p.sky,
  '--state-success-color': p.success,
  '--state-warning-color': p.warning,
  '--state-danger-color': p.danger,

  // 上方導覽列：用奶油色而不是預設的深色，跟網站一致
  '--main-navigation-color': p.cream,
  '--main-navigation-color--inverted': p.charcoal,

  '--focus-color': p.earth,
})

export const palette = p
