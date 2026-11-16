// 진단 규칙과 진단 화면의 상태 머신.
// 화면(F-6)과 API(F-11)가 이 모듈 하나만 쓴다. 규칙이 두 곳에 생기면 사람과 AI가 다른 답을 받는다.
import type { ProjectState } from '../data/site';

export const SIZES = { lt30: '~30명', '30-200': '30–200명', gte200: '200명 이상' } as const;
export const PAINS = { manual: '엑셀과 수작업', integration: '시스템 간 연동', ai: '반복 업무를 AI로', erp: '기존 ERP가 안 맞음' } as const;
export const SYSTEMS = { none: '거의 없음', packages: '패키지 몇 개', legacy: '자체 개발 레거시' } as const;

export type Size = keyof typeof SIZES;
export type Pain = keyof typeof PAINS;
export type Systems = keyof typeof SYSTEMS;
export interface Answers { size: Size; pain: Pain; systems: Systems }
export interface Recommendation { start_state: ProjectState; lens: string[]; reason: string }

const LENS: Record<Pain, string[]> = { manual: ['ERP', 'SaaS'], integration: ['SI'], ai: ['AX'], erp: ['ERP'] };

/** 위에서부터 처음 맞는 규칙 하나만 적용한다 (PRD '추천 규칙'). */
export function recommend(a: Answers): Recommendation {
  const lens = LENS[a.pain];
  if (a.size === 'lt30' && a.systems === 'none' && a.pain === 'manual')
    return { start_state: 'FOCUS', lens, reason: '업무 범위가 작고 기존 시스템이 적어서 진단을 짧게 끝내고 바로 설계로 갑니다. 구독형 모듈로 먼저 시작하는 것도 가능합니다.' };
  if (a.systems === 'legacy')
    return { start_state: 'SCAN', lens, reason: '레거시의 데이터 구조와 숨은 규칙을 먼저 파악해야 합니다. 무엇을 남기고 무엇을 다시 만들지 진단에서 정합니다.' };
  if (a.pain === 'ai')
    return { start_state: 'SCAN', lens, reason: '어떤 업무가 AI에 맞는지 빈도와 효과로 점수를 매기는 진단부터 합니다. 점수가 높은 업무 하나로 시범 에이전트를 만듭니다.' };
  return { start_state: 'SCAN', lens, reason: '어디가 가장 아픈지 숫자로 확인하는 2–3주 진단부터 시작합니다.' };
}

/** API 입력 검증. 에러에는 허용 값을 함께 넣어 에이전트가 스스로 고쳐 다시 요청할 수 있게 한다. */
export function parseAnswers(input: unknown):
  { ok: true; value: Answers } | { ok: false; error: 'invalid_value'; field: string; allowed: string[] } {
  const o = (input ?? {}) as Record<string, unknown>;
  const checks: [keyof Answers, Record<string, string>][] = [['size', SIZES], ['pain', PAINS], ['systems', SYSTEMS]];
  for (const [field, table] of checks) {
    if (typeof o[field] !== 'string' || !(o[field] as string in table))
      return { ok: false, error: 'invalid_value', field, allowed: Object.keys(table) };
  }
  return { ok: true, value: { size: o.size as Size, pain: o.pain as Pain, systems: o.systems as Systems } };
}

export function summaryText(a: Answers, r: Recommendation): string {
  return [
    '[오티코어 진단]',
    `규모: ${SIZES[a.size]}`,
    `문제: ${PAINS[a.pain]}`,
    `현재 시스템: ${SYSTEMS[a.systems]}`,
    `추천 시작 상태: ${r.start_state}`,
    `추천 렌즈: ${r.lens.join(' + ')}`,
  ].join('\n');
}

/* ---------- 진단 화면 상태 머신 (PRD '상태 정의') ---------- */
export type FlowState = 'idle' | 'result' | 'contact' | 'submitting' | 'submitted' | 'failed' | 'copied';
export type FlowEvent = 'ANSWER' | 'START_CONTACT' | 'SUBMIT' | 'SUCCESS' | 'ERROR' | 'RETRY' | 'COPY';

export const transitions: Record<FlowState, Partial<Record<FlowEvent, FlowState>>> = {
  idle: { ANSWER: 'result' },
  result: { ANSWER: 'result', START_CONTACT: 'contact', COPY: 'copied' },
  contact: { ANSWER: 'contact', SUBMIT: 'submitting', COPY: 'copied' },
  submitting: { SUCCESS: 'submitted', ERROR: 'failed' },
  submitted: {},
  failed: { RETRY: 'submitting', COPY: 'copied' },
  copied: { ANSWER: 'result', START_CONTACT: 'contact' },
};

/** 허용되지 않은 전이는 무시하고 현재 상태를 그대로 돌려준다. */
export function next(state: FlowState, event: FlowEvent): FlowState {
  return transitions[state][event] ?? state;
}

export const SUBMIT_TIMEOUT_MS = 10_000;
