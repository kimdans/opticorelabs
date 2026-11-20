// 사이트 문구의 단일 출처. 사람용 페이지와 /llms.txt, /llms-full.txt 가 같은 데이터를 읽는다.
// 포지셔닝: 생활·교육·렌탈 분야의 믿을 만한 업체와 고객을 이어 드리는 마케팅 회사.
// 연락처는 이메일 하나뿐이다 (전화·메신저·문의폼 없음). 실적·후기·순위·보장 같은 표현은 쓰지 않는다.
import { business } from './business';

export const company = {
  nameKo: business.name,
  nameEn: 'OptiCore',
  tagline: '일상에 필요한 서비스, 믿을 만한 업체와 이어 드립니다.',
  // 비즈프로필 소개글과 같은 문장
  summary:
    '주식회사 옵티코어는 생활·교육·렌탈 분야의 믿을 만한 업체와 고객을 이어 드리는 마케팅 회사입니다. 이사, 정리·청소, 학습, 렌탈처럼 일상에 필요한 서비스를 편하게 비교하고 상담을 신청하실 수 있도록 안내해 드립니다. 상담 신청은 각 제휴 업체로 바로 전달되며, 상담 비용은 받지 않습니다.',
  short: '생활·교육·렌탈 분야의 믿을 만한 업체와 고객을 이어 드리는 마케팅 회사',
  email: business.email,
};

export interface NavItem { label: string; href: string; match?: string }
export const nav: NavItem[] = [
  { label: '분야', href: '/#fields' },
  { label: '이용 방법', href: '/#how' },
  { label: '제휴 안내', href: '/partners', match: '/partners' },
  { label: '회사 정보', href: '/company', match: '/company' },
];

export interface Field { key: string; name: string; items: string[]; body: string }
export const fields: Field[] = [
  { key: 'life', name: '생활', items: ['이사', '정리', '청소'],
    body: '이사, 정리·수납, 입주·이사 청소처럼 집안일 가운데 전문 업체의 손이 필요한 서비스를 안내합니다. 견적과 진행 방식을 미리 살펴보고 상담을 신청하실 수 있습니다.' },
  { key: 'edu', name: '교육', items: ['학습'],
    body: '학생의 학습 계획과 공부 습관을 함께 챙기는 학습 서비스를 안내합니다. 수업 방식과 이용 조건을 먼저 확인하고, 우리 아이에게 맞는지 비교해 보실 수 있습니다.' },
  { key: 'rental', name: '렌탈', items: ['생활용품 렌탈'],
    body: '구매 대신 매달 나누어 이용하는 렌탈 서비스를 안내합니다. 약정 기간, 관리 방식, 해지 조건처럼 신청 전에 꼭 봐야 할 내용을 함께 정리해 드립니다.' },
];

export interface Step { title: string; body: string }
export const steps: Step[] = [
  { title: '비교해 보세요', body: '분야별 서비스가 어떤 분께 맞는지, 어떻게 진행되는지, 신청 전에 무엇을 확인해야 하는지 읽어 보세요.' },
  { title: '제휴 업체 안내 페이지에서 확인하세요', body: '서비스마다 마련된 안내 페이지에서 서비스를 제공하는 업체 이름과 진행 방식, 자주 묻는 질문을 확인하실 수 있습니다.' },
  { title: '업체에 직접 상담을 신청하세요', body: '안내 페이지의 버튼을 누르면 제휴 업체의 페이지로 이동합니다. 상담 신청은 그 업체에 바로 전달되고, 상담과 서비스도 그 업체가 직접 진행합니다.' },
];

export interface Principle { title: string; body: string }
export const principles: Principle[] = [
  { title: '상담 비용은 받지 않습니다', body: '옵티코어의 안내를 보고 상담을 신청하셔도 옵티코어에 내실 비용은 없습니다.' },
  { title: '개인정보를 받지 않습니다', body: '이 사이트에는 이름이나 연락처를 적는 칸이 없습니다. 상담 신청 정보는 각 제휴 업체가 직접 받고 관리합니다.' },
  { title: '실제 서비스는 제휴 업체가 제공합니다', body: '상담, 계약, 서비스 제공과 사후 관리는 각 제휴 업체가 직접 맡습니다. 안내 페이지마다 서비스 제공 업체를 밝혀 둡니다.' },
  { title: '제휴 관계를 숨기지 않습니다', body: '옵티코어는 제휴에 따른 수수료를 받을 수 있습니다. 모든 안내 페이지 위쪽에 이 사실을 적어 둡니다.' },
];
