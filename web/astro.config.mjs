import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// /partners.html 과 /partners/ 폴더가 함께 있으면, 정적 호스팅에 따라 /partners 가 폴더로 해석되어 404가 날 수 있다.
// 그래서 같은 이름의 폴더가 있는 페이지는 <폴더>/index.html 로도 한 부 더 둔다 (canonical은 /partners 그대로).
const dirIndexCopies = () => ({
  name: 'dir-index-copies',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const root = fileURLToPath(dir);
      const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => (e.isDirectory() ? [path.join(d, e.name), ...walk(path.join(d, e.name))] : []));
      for (const folder of walk(root)) {
        const page = `${folder}.html`;
        const index = path.join(folder, 'index.html');
        if (fs.existsSync(page) && !fs.existsSync(index)) fs.copyFileSync(page, index);
      }
    },
  },
});

// 배포 워크플로(.github/workflows/pages.yml)가 실제 주소를 SITE_URL / BASE_PATH로 넘겨준다 (https://opticorelabs.co.kr, /).
export default defineConfig({
  site: process.env.SITE_URL || 'https://kimdans.github.io',
  base: process.env.BASE_PATH || '/opticorelabs',
  outDir: process.env.OUT_DIR || 'dist',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [dirIndexCopies()],
});
