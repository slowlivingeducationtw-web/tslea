import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
      // 理監事專區與 404 不進 sitemap
      filter: (page) => !/\/(board-area|404)(\.html)?$/.test(page),
      changefreq: 'monthly',
      lastmod: new Date(),
    }),
  ],
});
