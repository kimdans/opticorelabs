// 첫 화면 "에이전트가 일하는 장면"의 예시 시나리오. 서버 렌더와 브라우저 스크립트가 같은 데이터를 쓴다.
// 실제 고객 사례가 아니라 설명을 위한 예시다 (화면에도 그렇게 표시한다).
export type Source = 'ERP' | '문서' | '메일' | '작성';
export interface Scenario {
  id: string; tab: string; team: string; ask: string;
  steps: { src: Source; text: string; out: string }[];
  draft: { title: string; meta: string; body: string; action: string };
}

export const scenarios: Scenario[] = [
  { id: 'ar', tab: '미수금 안내', team: '재무팀',
    ask: '30일 넘은 미수금 정리해서 거래처별 안내 메일 초안 만들어 줘.',
    steps: [
      { src: 'ERP', text: '30일 넘은 미수금 조회', out: '12건 · 거래처 4곳' },
      { src: '문서', text: '계약서의 결제 조건 확인', out: '계약 4건' },
      { src: '메일', text: '최근 연락 이력 확인', out: '2곳은 이미 안내함' },
      { src: '작성', text: '거래처별 안내 메일 초안 작성', out: '초안 4통' },
    ],
    draft: { title: '미수금 안내 메일 4통', meta: '대성기계 외 3곳 · 합계 6,090만원',
      body: '대성기계 구매팀 귀하. 10월 납품분 2,220만원의 결제 기한(11월 15일)이 지나 안내드립니다. 계약서 제7조에 따라…', action: '승인하고 보내기' } },
  { id: 'quote', tab: '견적서 초안', team: '영업팀',
    ask: '한울정밀이 보낸 문의 메일로 견적서 초안 만들어 줘.',
    steps: [
      { src: '메일', text: '문의 메일에서 품목과 수량 읽기', out: '품목 3개' },
      { src: 'ERP', text: '단가와 재고 확인', out: '재고 부족 1개' },
      { src: '문서', text: '지난 견적의 할인 조건 확인', out: '5% 적용' },
      { src: '작성', text: '견적서 초안 작성', out: 'Q-2611-015' },
    ],
    draft: { title: '견적서 Q-2611-015', meta: '한울정밀 · 984만원 · 납기 11월 28일',
      body: '커플링 CR-40은 재고가 모자라 입고 뒤 출고로 표시했습니다. 지난 견적과 같은 5% 할인을 적용했습니다.', action: '승인하고 보내기' } },
  { id: 'po', tab: '발주 제안', team: '구매팀',
    ask: '다음 달 재고가 모자랄 품목 찾아서 발주안 만들어 줘.',
    steps: [
      { src: 'ERP', text: '최근 6개월 출고량 조회', out: '품목 214개' },
      { src: 'ERP', text: '수주 잔량과 현재 재고 비교', out: '부족 예상 2개' },
      { src: '문서', text: '공급사 단가표와 납기 확인', out: '공급사 2곳' },
      { src: '작성', text: '발주안 작성', out: 'P-2611-033' },
    ],
    draft: { title: '발주 요청 P-2611-033', meta: '베어링 6204 2,000개 외 1건 · 412만원',
      body: '대성기계 수주가 평소보다 12% 늘어 12월 둘째 주에 재고가 바닥납니다. 납기가 빠른 공급사 기준으로 작성했습니다.', action: '승인하고 발주' } },
];
