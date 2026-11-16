// /llms.txt 와 /llms-full.txt 본문. 사람용 페이지와 같은 데이터(src/data/site.ts)에서 만든다.
import { company, states, lenses, principles, erpOptions } from '../data/site';
import { SIZES, PAINS, SYSTEMS } from './diagnose';


/** root = 사이트의 맨 앞 주소 (base 경로 포함). 예: https://kimdans.github.io/opticorelabs */
export function llmsShort(root: string): string {
  const u = (p: string) => root.replace(/\/$/, '') + p;
  return [
    `# ${company.nameKo} (${company.nameEn})`, '',
    `> ${company.tagline} ${company.summary}`, '',
    '## Services',
    ...lenses.map(l => `- [${l.code} · ${l.name}](${u(`/lenses/${l.slug}`)}): ${l.when}`), '',
    '## Method',
    `${states.map(s => s.code).join(' -> ')} -> SCAN`,
    ...states.map(s => `- ${s.code} (${s.ko}, ${s.duration}): ${s.exit}`), '',
    '## Diagnose',
    `- [진단 페이지](${u('/diagnose')}): 세 문항(회사 규모, 가장 아픈 곳, 지금 쓰는 시스템)으로 추천 시작 상태를 계산`,
    `- size: ${Object.keys(SIZES).join(' | ')}`,
    `- pain: ${Object.keys(PAINS).join(' | ')}`,
    `- systems: ${Object.keys(SYSTEMS).join(' | ')}`, '',
    '## Contact',
    `- email: ${company.email}`, '',
    '## Optional',
    `- [전체 텍스트](${u('/llms-full.txt')})`,
    `- [원칙](${u('/principles')})`,
    '',
  ].join('\n');
}

export function llmsFull(root: string): string {
  return [
    llmsShort(root).trimEnd(), '',
    '---', '',
    ...lenses.flatMap(l => [
      `## ${l.code} · ${l.name}`, l.what, '', `이럴 때: ${l.when}`, '',
      '하는 일:', ...l.does.map(d => `- ${d}`), '', '받는 결과물:', ...l.outputs.map(d => `- ${d}`), '',
      ...(l.slug === 'erp' ? ['구축 방식 비교:', ...erpOptions.map(o => `- ${o.name}: ${o.fit} / 주의: ${o.watch}`), ''] : []),
    ]),
    '## 일하는 순서 (상세)',
    ...states.flatMap(s => [`### ${s.code} · ${s.ko} (${s.duration})`, ...s.items.map(i => `- ${i}`), `- 다음 상태로 가는 조건: ${s.exit}`, '']),
    '## 원칙',
    ...principles.map(p => `- ${p.stop} ${p.title}: ${p.body}`), '',
  ].join('\n');
}
