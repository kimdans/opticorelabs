import type { APIRoute } from 'astro';
import { publishedPartners } from '../data/partners';
import { url } from '../lib/paths';
// 초안(draft) 제휴 안내와 404는 넣지 않는다.
export const sitemapPaths = () => ['/', '/partners', ...publishedPartners().map(p => `/partners/${p.slug}`), '/company', '/privacy'];
export const GET: APIRoute = ({ site }) => new Response(
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapPaths().map(p => `  <url><loc>${new URL(url(p), site).href}</loc></url>`).join('\n')}\n</urlset>\n`,
  { headers: { 'content-type': 'application/xml' } });
