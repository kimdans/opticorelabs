// 사이트의 모든 문구는 여기 한 곳에서 나온다.
// 사람용 페이지, /llms.txt, /llms-full.txt가 같은 데이터를 읽어서 내용이 어긋나지 않는다 (PRD: 에이전트 인터페이스).

export const company = {
  nameKo: '주식회사 오티코어',
  nameEn: 'OptiCore Inc.',
  tagline: '흐릿한 업무를, 선명한 시스템으로.',
  summary: '엑셀, 메신저 결재, 담당자 머릿속에 흩어진 일을 하나의 코어로 모읍니다. 시스템 통합, ERP, AI 전환, 구독형 SaaS까지 한 팀이 진단부터 운영까지 맡습니다.',
  email: 'contact@opticore.co.kr',
  // 아래 사업자등록번호와 주소는 예시입니다 (placeholder: true인 동안 화면에 "(예시)"로 표시). 실제 값으로 바꾸세요.
  bizNo: '000-00-00000',
  address: '서울특별시 (주소 확정 전)',
  placeholder: true,
};

export type ProjectState = 'SCAN' | 'FOCUS' | 'BUILD' | 'RUN';

export const states: { code: ProjectState; ko: string; duration: string; items: string[]; exit: string; next: ProjectState }[] = [
  { code: 'SCAN', ko: '진단', duration: '2–3주', next: 'FOCUS',
    items: ['현업 담당자 인터뷰와 실제 업무 관찰', '업무 흐름 지도와 데이터 인벤토리', '자동화·AI 적합도 점수 (빈도 × 효과)', '바로 고칠 것과 기록만 할 것 분류'],
    exit: '우선순위 과제 3개에 경영진이 합의하면 FOCUS로 넘어갑니다.' },
  { code: 'FOCUS', ko: '설계', duration: '2–4주', next: 'BUILD',
    items: ['목표 업무의 상태 전이 표', '오픈소스 · 패키지 · 자체 개발 비교안', '화면 시안과 데이터 모델', '범위와 견적 확정'],
    exit: '화면과 데이터 모델을 승인하면 BUILD로 넘어갑니다.' },
  { code: 'BUILD', ko: '구축', duration: '6–16주', next: 'RUN',
    items: ['2주 단위로 실제 동작하는 버전 배포', '매 스프린트 현업 시연', '데이터 이관 리허설', '자동화 테스트와 CI 감사'],
    exit: '실데이터 병행 운영을 문제 없이 통과하면 RUN으로 넘어갑니다.' },
  { code: 'RUN', ko: '운영', duration: '계속', next: 'SCAN',
    items: ['장애·성능 모니터링', '월간 운영 리포트', '개선 요청은 빈도 × 심각도로 분류', '사용 데이터 기반 다음 과제 제안'],
    exit: '다음 개선 과제가 정해지면 다시 SCAN에서 시작합니다.' },
];

export type LensSlug = 'si' | 'erp' | 'ax' | 'saas';

export interface Lens {
  slug: LensSlug; code: string; name: string; what: string; when: string;
  does: string[]; outputs: string[]; tags: string[];
}

export const lenses: Lens[] = [
  { slug: 'si', code: 'SI', name: '시스템 통합',
    what: '따로 노는 프로그램들이 같은 데이터를 보게 만듭니다. 쇼핑몰, 회계, 물류, 그룹웨어 사이의 복사·붙여넣기를 없앱니다.',
    when: '프로그램은 다섯 개인데 서로 대화를 하지 않을 때.',
    does: ['시스템 간 API 연동과 데이터 동기화', '기존 데이터 정리와 이관', '오래된 시스템의 단계적 교체'],
    outputs: ['연동 구성도와 데이터 흐름 문서', '이관 리허설 결과 보고서', '운영 모니터링 대시보드'],
    tags: ['API 연동', '데이터 이관', '레거시 현대화'] },
  { slug: 'erp', code: 'ERP', name: 'ERP 구축',
    what: '회사 업무 순서에 맞춘 ERP를 만듭니다. 검증된 오픈소스와 패키지를 먼저 비교하고, 꼭 필요한 부분만 새로 개발합니다.',
    when: '월말 마감이 며칠씩 걸리고 숫자가 부서마다 다를 때.',
    does: ['구축 방식 비교와 선택', '회계·재고·구매·영업 모듈 구성', '맞춤 개발과 기존 시스템 연동'],
    outputs: ['구축 방식 비교표', '업무별 상태 전이 표', '사용자 교육 자료'],
    tags: ['Odoo', 'ERPNext', '패키지 커스터마이징', '자체 개발'] },
  { slug: 'ax', code: 'AX', name: 'AI 전환',
    what: '사내 문서와 데이터에 연결된 AI 에이전트를 업무 흐름 안에 넣습니다. 중요한 결정에는 항상 사람의 승인 단계를 둡니다.',
    when: '같은 질문과 같은 서류 작업이 매일 반복될 때.',
    does: ['AI 적합 업무 선정 (빈도 × 효과 점수)', '사내 데이터에 연결된 업무 에이전트', '사람 승인 단계가 있는 워크플로'],
    outputs: ['업무별 AI 적합도 점수표', '시범 에이전트와 효과 측정 결과', '데이터 처리·보안 원칙 문서'],
    tags: ['업무 에이전트', '문서 검색', '승인 워크플로', 'MCP 연동'] },
  { slug: 'saas', code: 'SaaS', name: '구독형 모듈',
    what: '구축 프로젝트에서 반복해서 검증된 기능을 바로 쓸 수 있는 서비스로 제공합니다. 구축 없이 시작하고, 필요하면 맞춤으로 확장합니다.',
    when: '지금 당장 한 가지 문제만 빨리 풀고 싶을 때.',
    does: ['검증된 기능을 구독형으로 제공', '기존 시스템과 연결', '필요 시 구축 프로젝트로 확장'],
    outputs: ['바로 쓰는 모듈 (출시 준비 중)', '연동 가이드'],
    tags: ['예시: 전자결재', '예시: 재고', '예시: 매입 자동 수집'] },
];

export const erpOptions = [
  { name: 'Odoo', fit: '모듈이 많고 화면이 현대적. 빠르게 시작할 때', watch: '커뮤니티판과 유료판 기능 차이' },
  { name: 'ERPNext', fit: '오픈소스 라이선스로 비용 부담을 줄일 때', watch: '국내 세무·회계 관행 맞춤 필요' },
  { name: '국내 패키지', fit: '국내 회계·세무 기준이 가장 중요할 때', watch: '업무 흐름을 패키지에 맞춰야 함' },
  { name: '자체 개발', fit: '업무 방식 자체가 경쟁력일 때', watch: '기간과 비용이 가장 큼' },
];

export const principles = [
  { stop: 'f/1.4', title: '숨은 상태를 꺼냅니다', body: '로딩 중인데 에러도 보이는 화면은 상태가 숨어 있다는 신호입니다. 상태와 전이를 표로 드러내서 사용자, 개발자, AI 모두가 읽을 수 있게 합니다.' },
  { stop: 'f/2', title: '먼저 찾아보고 만듭니다', body: '처음 보는 기능은 맨땅에 짓지 않습니다. 관련 오픈소스를 찾아 접근 방식을 비교한 뒤에 시작합니다.' },
  { stop: 'f/2.8', title: '버그는 점수로 다룹니다', body: '빈도와 심각도를 곱해 5 미만이면 기록만 합니다. 아무도 요청하지 않은 미래를 위해 설계하지 않습니다.' },
  { stop: 'f/4', title: '끝까지 갑니다', body: '중간에 "계속할까요?"를 묻지 않습니다. 무언가를 지우기 전에만 확인하고, 마지막 보고는 핵심부터 쉬운 말로 씁니다.' },
  { stop: 'f/5.6', title: '느린 빌드를 숫자로 봅니다', body: '최근 150번의 CI 실행을 대기, 셋업, 실행 시간으로 나누어 가장 느린 작업 다섯 개를 먼저 보고합니다. 고치는 건 보고 다음입니다.' },
  { stop: 'f/8', title: '처음부터라면 무엇을 남길까', body: '큰 변경 전에 같은 목표로 오늘 다시 시작한다고 가정합니다. 남길 것, 버릴 것, 다시 만들 것을 나눠서 결정합니다.' },
];

export const nav = [
  { href: '/method', label: '일하는 순서' },
  { href: '/lenses/si', label: '서비스', match: '/lenses' },
  { href: '/principles', label: '원칙' },
  { href: '/company', label: '회사' },
];
