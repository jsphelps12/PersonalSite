// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Fully static for now. Add the @astrojs/cloudflare adapter when JoshGPT
// or the predictions ledger need server routes.
export default defineConfig({
  site: 'https://joshuaphelps.com',
  integrations: [mdx(), sitemap()],
});
