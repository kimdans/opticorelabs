import type { APIRoute } from 'astro';
import { llmsShort } from '../lib/llms';
import { url } from '../lib/paths';
export const GET: APIRoute = ({ site }) => new Response(llmsShort(new URL(url('/'), site).href), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
