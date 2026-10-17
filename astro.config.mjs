import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://slowlivingeducation.org',
  trailingSlash: 'never',
  build: { format: 'file' },
  // 年度計畫頁、捐款支持頁 2026-10 分別併入「認識學會」「與我們合作」，舊網址轉過去
  redirects: { '/plans': '/about#plans', '/donate': '/partner#donate' },
  integrations: [
    sitemap({
      // 理監事專區與 404 不進 sitemap
      filter: (page) => !/\/(board-area|404)(\.html)?$/.test(page),
      changefreq: 'monthly',
      lastmod: new Date(),
    }),
  ],
});
