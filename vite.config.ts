import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { seoFiles } from './seo-plugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss(), seoFiles(env.VITE_SITE_URL || 'https://www.agroaerialprecision.com/')],
    // Folder the site is served from: "/" for a domain root (Hostinger),
    // "/Agro-Aerial-Precision/" for GitHub Pages. Set VITE_BASE_PATH to override.
    base: env.VITE_BASE_PATH || '/',
  };
});
