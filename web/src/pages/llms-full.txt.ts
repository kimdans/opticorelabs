import type { APIRoute } from 'astro';
import { llmsFull } from '../lib/llms';
import { url } from '../lib/paths';
export const GET: APIRoute = ({ site }) => new Response(llmsFull(new URL(url('/'), site).href), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
