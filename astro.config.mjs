// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://yuta.dev',
  output: 'static',
  
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        // docsディレクトリの変更も監視して常に最新のドキュメントを反映
        ignored: ['!**/docs/**']
      }
    }
  },

  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true
    }
  }
});
