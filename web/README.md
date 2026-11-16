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

## 배포 (GitHub Pages)
`main` 브랜치에 `web/` 변경이 올라가면 `.github/workflows/pages.yml`이 테스트 → 빌드 → 배포를 자동으로 합니다.

- 주소: `https://kimdans.github.io/opticorelabs/`
- 처음 한 번만: 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 바꿉니다.
- 비공개 저장소는 GitHub Pro 이상 요금제에서만 Pages를 쓸 수 있습니다. 무료 요금제라면 저장소를 공개로 바꿔야 합니다. 어느 쪽이든 배포된 사이트는 누구나 볼 수 있습니다.
- 사이트가 `/opticorelabs/` 아래에 올라가므로 내부 링크는 모두 `src/lib/paths.ts`의 `url()`을 거칩니다. 새 링크를 만들 때 `href="/..."`를 직접 쓰지 마세요.
- 자체 도메인을 연결하면 워크플로가 주소를 자동으로 넘겨주므로 코드를 고칠 필요가 없습니다.
- GitHub Pages는 정적 호스팅이라 서버 코드를 돌릴 수 없습니다. 진단 전송은 외부 주소(`PUBLIC_DIAGNOSE_ENDPOINT`)가 필요합니다.

로컬에서 Pages와 같은 경로로 확인: `npm run build && npx astro preview` → `http://localhost:4321/opticorelabs/`
루트 경로로 확인: `BASE_PATH=/ npm run build && BASE_PATH=/ npx astro preview`

## 아티팩트로 미리 보기
배포 전에 사이트 전체를 Claude 아티팩트로 올려 볼 수 있습니다. 아티팩트는 `/`로 시작하는 주소를 쓸 수 없어서, 링크를 상대 경로로 바꾼 묶음을 따로 만듭니다.

```bash
BASE_PATH=/__B__ OUT_DIR=/tmp/dist-art npx astro build
node scripts/artifact-bundle.mjs /tmp/dist-art /tmp/site-artifact   # index.html + files.json(함께 올릴 파일 목록)
```

## 남은 설정
- `src/data/site.ts`의 사업자등록번호·주소 (지금은 예시 값, 화면에 "(예시)"로 표시됨). 이메일은 `contact@opticore.co.kr`로 확정
- 진단 전송: 환경 변수 `PUBLIC_DIAGNOSE_ENDPOINT`에 받을 주소를 넣으면 실제로 전송됩니다. 없으면 "준비 중" 안내와 함께 복사로 대체됩니다.
