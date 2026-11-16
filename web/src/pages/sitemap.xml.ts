import type { APIRoute } from 'astro';
import { lenses } from '../data/site';
const paths = ['/', '/method', ...lenses.map(l => `/lenses/${l.slug}`), '/principles', '/diagnose', '/company'];
export const GET: APIRoute = ({ site }) => new Response(
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map(p => `  <url><loc>${new URL(p, site).href}</loc></url>`).join('\n')}\n</urlset>\n`,
  { headers: { 'content-type': 'application/xml' } });
