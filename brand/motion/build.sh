#!/usr/bin/env bash
# OptiCore 브랜드 필름을 처음부터 다시 만든다.
#   사운드 합성 → 2배 해상도 프레임 렌더(240fps) → 무손실 10비트 마스터(모션 블러 + 고품질 축소) → MP4(H.264) + WebM(AV1)
#   ./build.sh [작업폴더] [desktop|mobile|all]      (필요: node + playwright, python3 + numpy, ffmpeg with libx264·libsvtav1·libopus)
#
# 화질을 위해 하는 일
#   - 슈퍼샘플링: 3840×2160(휴대폰 2160×2700)으로 찍어 lanczos로 줄인다 → 글자·가는 선의 계단 현상 제거
#   - 모션 블러: 240fps로 찍은 3장을 1:2:1로 평균 (180° 셔터) → 60fps
#   - 10비트 마스터: 축소와 평균에서 생긴 8비트 이하의 정밀도를 버리지 않아 파란 그라데이션의 띠 현상이 줄어든다
#   - AV1 10비트(WebM): 같은 용량에서 화질이 더 좋다. 지원하지 않는 브라우저는 H.264(MP4)를 쓴다
#   - H.264: 10비트 → 8비트로 내릴 때 오차 확산 디더링, 어두운 장면 보정(aq-mode 3), 약한 디블로킹
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="${1:-$(mktemp -d)}"
WHICH="${2:-all}"
mkdir -p "$WORK"

python3 "$HERE/make_audio.py" "$WORK/audio.wav"
ffmpeg -v error -y -i "$WORK/audio.wav" -c:a libmp3lame -b:a 192k "$HERE/showreel-audio.mp3"

build() {  # $1 = desktop | mobile, $2 = 출력 이름(확장자 제외), $3 = 출력 크기 WxH
  local fmt="$1" out="$2" size="$3" w="${3%x*}" h="${3#*x}"
  node "$HERE/render.cjs" "$WORK/frames-$fmt" 240 4 "$fmt" 2

  # 마스터: 무손실 FFV1, 10비트
  ffmpeg -v error -y -framerate 240 -i "$WORK/frames-$fmt/%06d.jpg" \
    -vf "format=gbrp16le,tmix=frames=3:weights='1 2 1',framestep=4,scale=$w:$h:flags=lanczos+accurate_rnd+full_chroma_int+full_chroma_inp:in_range=pc:out_color_matrix=bt709:out_range=tv,format=yuv420p10le" \
    -r 60 -c:v ffv1 -level 3 -t 15 "$WORK/master-$fmt.mkv"

  # H.264 8비트 (모든 브라우저)
  ffmpeg -v error -y -i "$WORK/master-$fmt.mkv" -i "$WORK/audio.wav" \
    -vf "scale=flags=accurate_rnd:sws_dither=ed,format=yuv420p" \
    -c:v libx264 -preset veryslow -crf 16 -profile:v high -level 4.2 -x264-params "aq-mode=3:deblock=-1,-1" \
    -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
    -c:a aac -b:a 256k -t 15 -movflags +faststart "$HERE/$out.mp4"

  # AV1 10비트 (지원 브라우저에서 우선 사용)
  ffmpeg -v error -y -i "$WORK/master-$fmt.mkv" -i "$WORK/audio.wav" \
    -c:v libsvtav1 -preset 4 -crf 24 -pix_fmt yuv420p10le -svtav1-params tune=0 -g 120 \
    -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
    -c:a libopus -b:a 192k -t 15 "$HERE/$out.webm"

  # 포스터(마지막 로고 장면): 영상을 못 틀 때와 불러오기 전에 보인다
  ffmpeg -v error -y -ss 14.4 -i "$WORK/master-$fmt.mkv" -frames:v 1 -q:v 2 "$HERE/$out.jpg"
}

[[ "$WHICH" == all || "$WHICH" == desktop ]] && build desktop opticore-showreel 1920x1080
[[ "$WHICH" == all || "$WHICH" == mobile ]] && build mobile opticore-showreel-mobile 1080x1350
echo "done → $HERE/opticore-showreel{,-mobile}.{mp4,webm,jpg}"
