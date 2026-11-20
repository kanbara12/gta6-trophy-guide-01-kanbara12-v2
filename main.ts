// Leonida 55 v2 — entry program (Node 22, standard library only).
// The guide is plain static files under app/ (index.html, app.js, style.css and
// data/trophies.json). This program hands it in: it copies app/ and screenshots/
// from beside this file into the output directory and writes output/dossier.json
// with the vendored make.fun library, which the sealed scorer rebuilds and
// compares byte for byte. Outside the grader, MAKEFUN_OUTPUT_DIR stands in
// for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyDir(from, to) {
  mkdirSync(to, { recursive: true });
  for (const name of readdirSync(from)) {
    cpSync(join(from, name), join(to, name), { recursive: true });
  }
}

mkdirSync(outDir, { recursive: true });
copyDir(join(root, 'app'), join(outDir, 'app'));
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(root, 'screenshots'))) {
  copyDir(join(root, 'screenshots'), join(outDir, 'screenshots'));
}

// Gate caps from the competition's reference/gate.json: dossier text at most
// 160 KiB, at most 4 screenshots of at most 256 KiB each, app/ at most
// 993 files and 48 MiB.
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
