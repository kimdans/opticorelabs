# OptiCore 웹사이트

주식회사 옵티코어(생활·교육·렌탈 분야의 서비스를 안내하고 업체와 고객을 이어 주는 마케팅 회사)의 사이트입니다.
Astro 정적 사이트, 라이트 단일 테마, Pretendard(자체 호스팅). 쿠키·분석 스크립트·입력폼은 없습니다.

```bash
npm ci
npm run dev        # http://localhost:4321/opticorelabs (기본 base) — 루트로 보려면 BASE_PATH=/ npm run dev
npm test           # 데이터·채널 태그·링크 검사기 단위 테스트 + 운영 설정으로 임시 빌드해 HTML 검사
SITE_URL=https://opticorelabs.co.kr BASE_PATH=/ npm run build
node scripts/check-links.mjs     # dist의 모든 내부 링크·#조각 검사 (깨진 링크가 있으면 exit 1)
node scripts/check-mobile.mjs    # 헤드리스 Chrome으로 360px 폭 가로 넘침 + 채널 태그 동작 검사
```

## 구조
| 경로 | 내용 |
| --- | --- |
| `src/data/site.ts` | 회사 소개, 사업 영역 한 줄(`businessLine`), 광고주 문장, 분야, 이용 방법, 운영 원칙, 빈 목록 문구, 메뉴. 페이지와 `/llms.txt`가 같이 읽음 |
| `src/data/business.ts` | 사업자 정보(상호·대표·사업자등록번호·통신판매업 신고번호·소재지·이메일). 공통 푸터와 `/company` |
| `src/data/partners.ts` | 제휴 안내 랜딩 데이터. 항목 하나 = `/partners/<slug>` 한 페이지 |
| `src/lib/channel.ts` | 채널 태그(`?ch=`) 허용 목록과 버튼 주소에 붙이는 함수. 랜딩 페이지에 인라인 스크립트로 들어감 |
| `src/lib/llms.ts` | `/llms.txt`, `/llms-full.txt` 본문 (초안 제외) |
| `src/layouts/Base.astro` | 공통 head(고유 title·description, canonical·og:url https 절대주소), 헤더, 사업자 정보 푸터 |
| `src/components/PartnerList.astro` | 제휴 안내 목록 (홈, `/partners`). 공개 항목만, 없으면 빈 상태 문구 |
| `src/pages/` | `/`, `/partners`, `/partners/[slug]`(공개 항목만), `/company`, `/terms`, `/privacy`, `/404`, `llms*.txt`, `sitemap.xml`, `robots.txt` |
| `tests/` | `partners`(데이터 규칙), `channel`(채널 태그), `check-links`(검사기), `dist`(빌드 결과: 초안 항목 완전 제외·IT 금지어·사업 영역 한 줄만 허용·실적/보장 표현 없음·제외 업종·폼/쿠키 없음·푸터·이용약관·title 고유 등) |

## 문구 규칙 (광고 채널 심사, R-007)
- 사실만 쓴다. 2026-11-20 기준 광고 집행 실적 0건, 운영사 서면 허락 0건, 공개된 제휴 안내 0건.
- '실적', '공식 파트너', '검증된', '믿을 만한', '다수의 제휴사', 고객 수·만족도·순위·보장, 근거 없는 숫자 금지. `~합니다`는 하려는 일·운영 원칙에만.
- IT 관련 표현은 `/company`·홈의 '주요 사업' 한 줄에서만 허용 (SI·ERP·AX·AI 전환·SaaS·에이전트·시스템 통합은 어디서도 금지).
- 연락처는 이메일 하나뿐. 모든 페이지 푸터에 사업자 정보·이용약관·개인정보 처리방침 링크.

## 제휴 안내 페이지 (R-005)
- 상단에 `서비스 제공: <provider>`와 제휴 안내 문구(옵티코어는 신청 정보를 받지 않음, 수수료를 받을 수 있음).
- 상담 신청 버튼은 `operatorUrl`로 같은 탭 이동. 자동 리다이렉트·meta refresh 없음.
- 랜딩 주소의 `?ch=` 값이 `daangn | kakao | naver | toss | meta`이면 버튼 주소에 `channelParam`(기본 `ch`) 이름으로 붙인다. 그 밖의 값은 무시. JS가 없으면 기본 주소 그대로.
- `draft: true` 항목: **빌드에서 완전히 제외**. `getStaticPaths`가 공개 항목만 만들므로 `dist/partners/<slug>`가 없고(라이브 404), 목록·홈·sitemap·llms 어디에도 제목·요약·이름이 나오지 않는다. 운영사 서면 허락 전 이름 공개 금지.
- 공개 전: 운영사 서면 확인 → `provider`·`operatorUrl` 실제 값 → `draft: false`. 테스트가 공개 항목의 예시 주소·'확인 필요' 표시를 막는다.

## 배포 (GitHub Pages)
`main` 브랜치에 `web/` 변경이 올라가면 `.github/workflows/pages.yml`이 테스트 → 빌드(`https://opticorelabs.co.kr`, base `/`) → 배포를 자동으로 합니다.
내부 링크는 모두 `src/lib/paths.ts`의 `url()`을 거칩니다. 새 링크에 `href="/..."`를 직접 쓰지 마세요.
`/partners.html`과 `/partners/` 폴더가 함께 있어도 열리도록, 빌드가 끝나면 `partners/index.html` 사본을 만듭니다(`astro.config.mjs`).

## 아티팩트로 미리 보기
```bash
BASE_PATH=/__B__ OUT_DIR=/tmp/dist-art npx astro build
node scripts/artifact-bundle.mjs /tmp/dist-art /tmp/site-artifact   # index.html + files.json(함께 올릴 파일 목록)
```
