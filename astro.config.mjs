import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';

// sitemap 在建置完成後才產生，這時可以讀 dist/ 裡的 HTML 看有沒有 noindex
function isNoindex(page) {
  const path = new URL(page).pathname.replace(/\/$/, '')
  const file = path === '' ? 'dist/index.html' : `dist${path}.html`
  try {
    return /<meta name="robots" content="noindex/.test(readFileSync(file, 'utf8'))
  } catch {
    return false
  }
}

export default defineConfig({
  site: 'https://slowlivingeducation.org',
  trailingSlash: 'never',
  build: { format: 'file' },
  // 年度計畫頁、捐款支持頁 2026-10 分別併入「認識學會」「與我們合作」，舊網址轉過去
  redirects: {
    '/plans': '/about#plans', '/donate': '/partner#donate',
    '/en/plans': '/en/about#plans', '/en/donate': '/en/partner#donate',
  },
  // 預先載入：滑鼠移到連結上（手機是連結出現在畫面上）就先在背景抓那一頁，點下去幾乎立刻顯示
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  integrations: [
    sitemap({
      // 頁面自己標了 noindex 的就不進 sitemap：理監事專區、404、還沒翻譯的英文頁
      filter: (page) => !isNoindex(page),
      changefreq: 'monthly',
      lastmod: new Date(),
    }),
  ],
});
