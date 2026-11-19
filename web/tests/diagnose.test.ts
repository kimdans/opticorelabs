import { describe, it, expect } from 'vitest';
import { recommend, parseAnswers, next, transitions, SIZES, PAINS, SYSTEMS, type Answers, type FlowState } from '../src/lib/diagnose';

const all: Answers[] = [];
for (const size of Object.keys(SIZES)) for (const pain of Object.keys(PAINS)) for (const systems of Object.keys(SYSTEMS))
  all.push({ size, pain, systems } as Answers);

describe('recommend', () => {
  it('covers all 36 combinations with a valid answer', () => {
    expect(all).toHaveLength(36);
    for (const a of all) {
      const r = recommend(a);
      expect(['SCAN', 'FOCUS']).toContain(r.start_state);
      expect(r.lens.length).toBeGreaterThan(0);
      expect(r.reason.length).toBeGreaterThan(10);
    }
  });
  it('only the small, manual, no-system company starts at FOCUS', () => {
    const focus = all.filter(a => recommend(a).start_state === 'FOCUS');
    expect(focus).toEqual([{ size: 'lt30', pain: 'manual', systems: 'none' }]);
  });
  it('maps pain to lens', () => {
    expect(recommend({ size: 'gte200', pain: 'integration', systems: 'packages' }).lens).toEqual(['SI']);
    expect(recommend({ size: 'gte200', pain: 'ai', systems: 'packages' }).lens).toEqual(['AX']);
  });
  it('legacy rule wins over the AI rule', () => {
    expect(recommend({ size: '30-200', pain: 'ai', systems: 'legacy' }).reason).toContain('레거시');
  });
});

describe('parseAnswers', () => {
  it('accepts valid input', () => {
    expect(parseAnswers({ size: '30-200', pain: 'integration', systems: 'packages' }).ok).toBe(true);
  });
  it('names the bad field and the allowed values', () => {
    expect(parseAnswers({ size: 'huge', pain: 'ai', systems: 'none' }))
      .toEqual({ ok: false, error: 'invalid_value', field: 'size', allowed: ['lt30', '30-200', 'gte200'] });
    expect(parseAnswers(null)).toMatchObject({ ok: false, field: 'size' });
  });
});

describe('flow state machine', () => {
  it('follows the happy path', () => {
    let s: FlowState = 'idle';
    for (const e of ['ANSWER', 'START_CONTACT', 'SUBMIT', 'SUCCESS'] as const) s = next(s, e);
    expect(s).toBe('submitted');
  });
  it('recovers from failure by retry or copy', () => {
    expect(next('failed', 'RETRY')).toBe('submitting');
    expect(next('failed', 'COPY')).toBe('copied');
  });
  it('ignores events that are not allowed', () => {
    expect(next('submitting', 'ANSWER')).toBe('submitting');
    expect(next('submitted', 'SUBMIT')).toBe('submitted');
  });
  it('every target state exists', () => {
    const states = Object.keys(transitions);
    for (const t of Object.values(transitions)) for (const to of Object.values(t)) expect(states).toContain(to);
  });
});

import { llmsShort, llmsFull } from '../src/lib/llms';
import { lenses, states, promises } from '../src/data/site';
describe('llms.txt', () => {
  it('lists every service and state from the same data the pages use', () => {
    const t = llmsShort('https://example.com');
    for (const l of lenses) expect(t).toContain(`https://example.com/lenses/${l.slug}`);
    for (const s of states) expect(t).toContain(s.exit);
    expect(t.startsWith('# ')).toBe(true);
  });
  it('full text contains every customer promise', () => {
    for (const p of promises) expect(llmsFull('https://example.com')).toContain(p.title);
  });
});
