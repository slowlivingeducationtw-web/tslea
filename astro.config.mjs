import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://slowlivingeducation.org',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    sitemap({
      // 理監事專區與 404 不進 sitemap
      filter: (page) => !/\/(board-area|404)(\.html)?$/.test(page),
      changefreq: 'monthly',
      lastmod: new Date(),
    }),
  ],
});
