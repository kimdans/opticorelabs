#!/usr/bin/env bash
# OptiCore 브랜드 필름을 처음부터 다시 만든다: 사운드 합성 → 프레임 렌더 → 모션 블러 합성 → MP4.
#   ./build.sh [작업폴더]      (필요: node + playwright, python3 + numpy, ffmpeg)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="${1:-$(mktemp -d)}"
mkdir -p "$WORK"

python3 "$HERE/make_audio.py" "$WORK/audio.wav"
ffmpeg -v error -y -i "$WORK/audio.wav" -c:a aac -b:a 160k "$HERE/showreel-audio.m4a"

node "$HERE/render.cjs" "$WORK/frames" 240 4

# 240fps로 찍은 프레임 3장(가중치 1:2:1)을 평균해 180° 셔터 모션 블러를 만들고 60fps로 내보낸다.
ffmpeg -v error -y -framerate 240 -i "$WORK/frames/%06d.jpg" -i "$WORK/audio.wav" \
  -vf "tmix=frames=3:weights='1 2 1',framestep=4,scale=out_color_matrix=bt709:out_range=tv,format=yuv420p" \
  -r 60 -c:v libx264 -preset slow -crf 16 -profile:v high -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 192k -t 15 -movflags +faststart "$HERE/opticore-showreel.mp4"
echo "done: $HERE/opticore-showreel.mp4"
