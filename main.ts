// Twin Spots — the hand-in program (Node 22, standard library only).
// It copies the playable game and its screenshots from beside this file into
// the output directory and writes the dossier.json the judge reads, using the
// vendored make.fun helper. Run it locally as:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader, MAKEFUN_OUTPUT_DIR is unset and /output is used instead.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });

const shotsDir = join(outputDir, 'screenshots');
mkdirSync(shotsDir, { recursive: true });
const localShots = join(repoRoot, 'screenshots');
if (existsSync(localShots)) {
  cpSync(localShots, shotsDir, { recursive: true });
}

// Caps from the competition's scorer: at most 4 screenshots, each at most
// 256 KiB; at most 993 files / 48 MiB under game/; no game path over 1000 bytes.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`Twin Spots handed in to ${outputDir}`);
