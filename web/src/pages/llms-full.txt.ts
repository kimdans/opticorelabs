import type { APIRoute } from 'astro';
import { llmsFull } from '../lib/llms';
export const GET: APIRoute = ({ site }) => new Response(llmsFull(site!.href), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
