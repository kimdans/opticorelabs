import type { APIRoute } from 'astro';
import { llmsShort } from '../lib/llms';
export const GET: APIRoute = ({ site }) => new Response(llmsShort(site!.href), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
