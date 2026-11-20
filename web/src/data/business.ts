// 사업자 정보 (출처: 사업자등록증·통신판매업신고증, opticore_docs/business_info.json).
// 사이트 공통 푸터와 /company 가 이 값을 읽는다. 값이 바뀌면 여기만 고친다.
export const business = {
  name: "주식회사 옵티코어",
  ceo: "김건영",
  bizNo: "446-81-00729",
  mailOrderNo: "제2026-서울서대문-1225호",
  address: "서울특별시 서대문구 신촌로 127, 지하2층 201-128(창천동, 신촌르메이에르타운3)",
  email: "contact@opticorelabs.co.kr",
} as const;

/** 공정거래위원회 사업자정보 확인 페이지 (사업자등록번호 숫자만) */
export const ftcBizInfoUrl = `https://www.ftc.go.kr/bizCommPop.do?wrkr_no=${business.bizNo.replace(/\D/g, "")}`;
