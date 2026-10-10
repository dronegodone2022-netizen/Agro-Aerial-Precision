import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

// Writes robots.txt and sitemap.xml into the build, so search engines can find
// every public page. Service, course and team pages are read from the site's
// data files, so new ones are added to the sitemap automatically.

const PRIVATE_PATHS = ['/admin', '/student', '/student-login', '/register', '/forgot-password', '/reset-password', '/drone-exam', '/qr'];

const STATIC_PAGES = ['', 'about', 'services', 'academy', 'contact', 'verify', 'privacy-policy', 'terms-of-service'];

const between = (source: string, startMarker: string) => {
  const start = source.indexOf(startMarker);
  if (start === -1) return '';
  const end = source.indexOf('\n];', start);
  return source.slice(start, end === -1 ? undefined : end);
};

const matchAll = (source: string, pattern: RegExp) => [...source.matchAll(pattern)].map((m) => m[1]);

const collectPages = (root: string) => {
  const constants = fs.readFileSync(path.join(root, 'constants.tsx'), 'utf8');
  const courses = fs.readFileSync(path.join(root, 'src/data/courses.ts'), 'utf8');

  const industries = matchAll(between(constants, 'export const INDUSTRIES'), /^\s{4}slug: '([a-z0-9-]+)'/gm);
  const team = matchAll(between(constants, 'export const TEAM'), /^\s{4}slug: '([a-z0-9-]+)'/gm);
  const courseIds = matchAll(between(courses, 'export const COURSES'), /^\s{4}id: '([a-z0-9-]+)'/gm);

  return [
    ...STATIC_PAGES,
    ...industries.map((slug) => `services/${slug}`),
    ...courseIds.map((id) => `academy/${id}`),
    ...team.map((slug) => `team/${slug}`),
  ];
};

export const seoFiles = (siteUrl: string): Plugin => ({
  name: 'aap-seo-files',
  apply: 'build',
  generateBundle() {
    const base = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
    const basePath = new URL(base).pathname.replace(/\/$/, '');
    const today = new Date().toISOString().slice(0, 10);
    const pages = collectPages(process.cwd());

    const sitemap = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...pages.map((page) =>
        [
          '  <url>',
          `    <loc>${base}${page}</loc>`,
          `    <lastmod>${today}</lastmod>`,
          `    <priority>${page === '' ? '1.0' : page.includes('/') ? '0.7' : '0.8'}</priority>`,
          '  </url>',
        ].join('\n')
      ),
      '</urlset>',
      '',
    ].join('\n');

    const robots = [
      'User-agent: *',
      'Allow: /',
      ...PRIVATE_PATHS.map((p) => `Disallow: ${basePath}${p}`),
      '',
      `Sitemap: ${base}sitemap.xml`,
      '',
    ].join('\n');

    this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
    this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
  },
});
