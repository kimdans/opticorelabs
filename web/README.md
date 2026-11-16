# OptiCore 웹사이트

모션 시안 B(조리개)를 바탕으로 한 실제 사이트입니다. Astro 정적 사이트 + GSAP/Lenis 모션.

```bash
npm install
npm run dev      # http://localhost:4321
npm test         # 진단 규칙 36가지 조합, 상태 머신, llms.txt 테스트
npm run build    # dist/ 에 정적 파일 생성
```

## 구조
| 경로 | 내용 |
| --- | --- |
| `src/data/site.ts` | 모든 문구의 단일 출처. 페이지와 `/llms.txt`가 같이 읽음 |
| `src/lib/diagnose.ts` | 진단 추천 규칙 + 진단 화면 상태 머신 (idle → result → contact → submitting → submitted / failed / copied) |
| `src/lib/llms.ts` | `/llms.txt`, `/llms-full.txt` 본문 생성 |
| `src/components/` | Iris(조리개 히어로), LensRing(서비스), StateStrip(일하는 순서), Stops(원칙), Diagnose(진단) |
| `src/scripts/motion.ts` | 부드러운 스크롤과 등장 모션. '동작 줄이기' 설정이면 꺼짐 |
| `src/scripts/track.ts` | 분석 이벤트 (도구 선정 전까지 `window.dataLayer`로만 전달) |

## 남은 설정
- `astro.config.mjs`의 `site` 도메인 (지금은 예시 `opticore.kr`)
- `src/data/site.ts`의 이메일·사업자등록번호·주소 (지금은 예시 값, 화면에 "(예시)"로 표시됨)
- 진단 전송: 환경 변수 `PUBLIC_DIAGNOSE_ENDPOINT`에 받을 주소를 넣으면 실제로 전송됩니다. 없으면 "준비 중" 안내와 함께 복사로 대체됩니다.
