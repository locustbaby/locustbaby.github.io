import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Locustbaby's Blog",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      // { text: 'Personal Site', link: '/personal-blog-seo' }
    ],

    sidebar: [
      {
        text: 'Personal Site',
        items: [
          // { text: 'Markdown Examples', link: '/markdown-examples' },
          // { text: 'Runtime API Examples', link: '/api-examples' },
          { text: 'Setup Personal Site', link: '/site/hexo-blog' },
          { text: 'SEO', link: '/site/seo' }
        ]
      },
      {
        text: 'Cloud',
        items: [
          { text: 'GKE GPU Practice', link: '/cloud/gpu-pool-on-gke' },
          { text: 'Harbor to Cloud Registry', link: '/cloud/harbor-replication-to-cloud' }
        ]
      },
      {
        text: 'Cloud',
        items: [
          { text: 'Shell Concurrency', link: '/code/shell-concurrency' }
        ]
      }
    ],

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
