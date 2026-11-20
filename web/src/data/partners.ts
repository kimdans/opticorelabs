// 제휴 서비스 안내 페이지(/partners/[slug])의 데이터. 항목 하나 = 안내 페이지 하나.
// - draft: true 인 항목은 빌드에서 완전히 빠진다: 페이지를 만들지 않고(라이브 404), /partners·홈 목록·sitemap·llms
//   어디에도 제목·요약·이름이 나오지 않는다 (운영사 서면 허락 전에는 이름 공개 금지).
//   운영사의 서면 확인을 받은 뒤 draft를 false로 바꾸고 provider·operatorUrl을 실제 값으로 채우면 공개된다.
// - 내용은 일반적인 서비스 설명만 쓴다. 효과·성적·순위·보장 같은 표현, 근거 없는 숫자, 후기는 넣지 않는다.

export const CATEGORIES = ['생활', '교육', '렌탈'] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Faq { q: string; a: string }
/** src가 없으면 회색 상자와 대체 텍스트로 자리만 표시한다 */
export interface PartnerImage { src?: string; alt: string }

export interface Partner {
  slug: string;
  /** 페이지 제목 (h1, <title>) */
  title: string;
  /** 서비스 제공자 표시명. "서비스 제공: ○○" 와 제휴 안내 문구에 들어간다 */
  provider: string;
  /** 운영사와 주고받는 캠페인 이름 (내부 참고용, 공개 문구로 쓰지 않는다) */
  campaignName: string;
  category: Category;
  /** 상담 신청 버튼이 이동할 운영사 주소 (https) */
  operatorUrl: string;
  /** 채널 태그를 붙일 때 쓰는 파라미터 이름 (기본 'ch') */
  channelParam?: string;
  summary: string;
  audience: string[];
  steps: string[];
  checks: string[];
  faq: Faq[];
  images: PartnerImage[];
  draft: boolean;
  approvalNote?: string;
}

export const partners: Partner[] = [
  {
    slug: 'mildang-pt',
    title: '중·고등 온라인 1:1 학습 관리 안내',
    provider: '[운영사 확인 필요]',
    campaignName: '밀당PT, 1등급 전략',
    category: '교육',
    operatorUrl: 'https://example.com/REPLACE-WITH-OPERATOR-URL',
    channelParam: 'ch',
    summary:
      '중·고등학생이 집에서 온라인으로 공부하면서, 담당 관리자와 1:1로 학습 계획과 진행 상황을 함께 점검하는 학습 관리 서비스입니다. 학원까지 오가는 시간 없이 정해진 시간에 공부하고, 그날 한 공부를 관리자가 확인하는 방식입니다. 혼자서는 공부 계획을 지키기 어려운 학생이나, 아이의 공부 흐름을 가까이에서 챙겨 줄 방법을 찾는 보호자께서 다른 학습 서비스와 비교해 보실 수 있도록 진행 방식과 신청 전 확인할 점을 정리했습니다.',
    audience: [
      '중·고등학생 자녀의 공부 계획과 습관 관리가 고민인 보호자',
      '학원을 오가는 시간 없이 집에서 학습 관리를 받고 싶은 학생',
      '혼자 세운 공부 계획을 끝까지 지키기 어려운 학생',
      '여러 온라인 학습 서비스를 비교해 보고 있는 가정',
    ],
    steps: [
      '이 페이지에서 서비스 내용과 신청 전 확인할 점을 먼저 읽어 봅니다.',
      '아래 상담 신청 버튼을 누르면 서비스 제공 업체의 페이지로 이동합니다. 상담 신청 정보는 그 업체가 직접 받습니다.',
      '업체 상담에서 학생의 학년과 공부 상황을 이야기하고, 수업 방식·이용 요금·일정을 안내받습니다.',
      '안내받은 내용을 다른 서비스와 충분히 비교한 뒤, 학생과 함께 이용 여부를 정합니다.',
    ],
    checks: [
      '이용 요금, 결제 방식, 약정 기간이 어떻게 되는지 확인하세요.',
      '중도 해지와 환불 기준을 계약 전에 서면으로 받아 두세요.',
      '체험이나 무료 상담 뒤에 유료 이용으로 자동 전환되는지 확인하세요.',
      '관리자 배정 방식, 소통 방법과 횟수, 필요한 기기(태블릿·PC 등)를 확인하세요.',
      '무엇보다 학생 본인이 이 방식으로 공부하고 싶어 하는지 함께 이야기해 보세요.',
    ],
    faq: [
      { q: '상담을 신청하면 옵티코어가 연락하나요?',
        a: '아니요. 상담 신청은 서비스 제공 업체의 페이지에서 이루어지고, 연락과 상담도 그 업체가 직접 합니다. 옵티코어는 신청 정보를 받거나 보관하지 않습니다.' },
      { q: '상담 비용이 있나요?',
        a: '옵티코어에 내실 비용은 없습니다. 업체 상담이나 체험에 비용·조건이 있는지는 상담 신청 전에 업체 안내를 확인해 주세요.' },
      { q: '이 서비스를 이용하면 성적이 오르나요?',
        a: '학습 결과는 학생의 상황과 노력에 따라 다릅니다. 이 페이지는 특정 성적이나 결과를 약속하지 않으며, 서비스 내용과 확인할 점만 안내합니다.' },
      { q: '신청할 때 적은 개인정보는 누가 관리하나요?',
        a: '상담 신청 때 적은 정보는 서비스 제공 업체가 직접 받아 그 업체의 개인정보 처리방침에 따라 관리합니다. 신청 전에 업체의 처리방침을 확인해 주세요.' },
      { q: '이 안내 페이지 내용은 어디에 문의하나요?',
        a: '이 페이지의 안내 내용에 대한 문의는 옵티코어 이메일로 보내 주세요. 서비스 이용·계약에 관한 문의는 서비스 제공 업체에 해 주세요.' },
    ],
    images: [
      { alt: '온라인 1:1 학습 관리 화면 예시 이미지 자리 (운영사 제공 이미지로 교체 예정)' },
      { alt: '관리자와 학생이 학습 계획을 점검하는 모습 이미지 자리 (운영사 제공 이미지로 교체 예정)' },
    ],
    draft: true,
    approvalNote: 'needs operator written OK (Q-014)',
  },
];

export const publishedPartners = () => partners.filter(p => !p.draft);
export const findPartner = (slug: string) => partners.find(p => p.slug === slug);
