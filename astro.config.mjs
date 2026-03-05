import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://locustbaby.github.io',
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
