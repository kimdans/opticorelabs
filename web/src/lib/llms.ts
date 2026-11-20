// /llms.txt 와 /llms-full.txt 본문. 사람용 페이지와 같은 데이터(src/data)에서 만든다.
// 초안(draft) 제휴 안내는 넣지 않는다.
import { company, fields, steps, principles } from '../data/site';
import { publishedPartners } from '../data/partners';

/** root = 사이트의 맨 앞 주소 (base 경로 포함). 예: https://opticorelabs.co.kr/ */
export function llmsShort(root: string): string {
  const u = (p: string) => root.replace(/\/$/, '') + p;
  const pub = publishedPartners();
  return [
    `# ${company.nameKo} (${company.nameEn})`, '',
    `> ${company.summary}`, '',
    '## 분야',
    ...fields.map(f => `- ${f.name} (${f.items.join(', ')}): ${f.body}`), '',
    '## 이용 방법',
    ...steps.map((s, i) => `${i + 1}. ${s.title}: ${s.body}`), '',
    '## 운영 원칙',
    ...principles.map(p => `- ${p.title}: ${p.body}`), '',
    '## 페이지',
    `- [홈](${u('/')})`,
    `- [제휴 서비스 안내](${u('/partners')})`,
    ...pub.map(p => `- [${p.title}](${u(`/partners/${p.slug}`)}): 서비스 제공 ${p.provider}`),
    `- [회사 정보](${u('/company')})`,
    `- [개인정보 처리방침](${u('/privacy')})`, '',
    '## 문의',
    `- 이메일: ${company.email}`, '',
    '## Optional',
    `- [전체 텍스트](${u('/llms-full.txt')})`,
    '',
  ].join('\n');
}

export function llmsFull(root: string): string {
  return [
    llmsShort(root).trimEnd(), '',
    '---', '',
    '## 옵티코어가 하지 않는 일',
    '- 상담 비용을 받지 않습니다.',
    '- 이름·연락처 같은 상담 신청 정보를 받거나 보관하지 않습니다. 이 사이트에는 입력폼, 쿠키, 방문 분석 도구가 없습니다.',
    '- 서비스를 직접 제공하거나 계약하지 않습니다. 상담·계약·서비스 제공은 각 제휴 업체가 직접 합니다.',
    '- 제휴에 따른 수수료를 받을 수 있으며, 이 사실을 안내 페이지마다 밝힙니다.', '',
    ...publishedPartners().flatMap(p => [
      `## ${p.title}`,
      `서비스 제공: ${p.provider} · 분야: ${p.category}`, '',
      p.summary, '',
      '이런 분께 맞습니다:', ...p.audience.map(a => `- ${a}`), '',
      '진행 방식:', ...p.steps.map((s, i) => `${i + 1}. ${s}`), '',
      '신청 전 확인할 점:', ...p.checks.map(c => `- ${c}`), '',
      '자주 묻는 질문:', ...p.faq.flatMap(f => [`- Q. ${f.q}`, `  A. ${f.a}`]), '',
    ]),
  ].join('\n');
}
