import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vitepress'

const docsDir = path.resolve(__dirname, '../../docs');


function getSidebarItems(dir: string, baseUrl = '') {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  return items
    .filter(item => !item.name.startsWith('.') && item.name !== 'index.md' && item.name !== 'public')
    .map(item => {
      
      const fullPath = path.join(dir, item.name);
      const urlPath = `${baseUrl}/${item.name.replace(/\.md$/, '')}`;

      if (item.isDirectory()) {
        return {
          text: item.name.toUpperCase(),
          collapsible: true,
          collapsed: false,
          items: getSidebarItems(fullPath, urlPath),
        };
      } else if (item.name.endsWith('.md')) {
        return { text: item.name.replace('.md', ''), link: urlPath };
      }
    })
    .filter(Boolean) as any[];
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Locustbaby's Blog",
  head: [
    [
      'script',
      {
        async: 'true',
        src: 'https://www.googletagmanager.com/gtag/js?id=G-S2Z93CLEFS',
      },
    ],
    [
      'script',
      {},
      "window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'G-S2Z93CLEFS');",
    ],
  ],
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      // { text: 'Personal Site', link: '/personal-blog-seo' }
    ],

    sidebar: getSidebarItems(docsDir),

    socialLinks: [
      { icon: 'github', link: 'https://github.com/locustbaby/locustbaby.github.io' }
    ],

    search: {
      provider: 'local',
      options: {
        miniSearch: {
          /**
           * @type {Pick<import('minisearch').Options, 'extractField' | 'tokenize' | 'processTerm'>}
           */
          options: {
            /* ... */
          },
          /**
           * @type {import('minisearch').SearchOptions}
           * @default
           * { fuzzy: 0.2, prefix: true, boost: { title: 4, text: 2, titles: 1 } }
           */
          searchOptions: {
            /* ... */
          }
        }
      }
    },
    outline: { 
      level: [2,4],
    },
  },
  sitemap: {
    hostname: 'https://locustbaby.github.io'
  },
  lastUpdated: true,
  cleanUrls:true,
  markdown: {
    image: {
      lazyLoading: true
    },
  }
})
