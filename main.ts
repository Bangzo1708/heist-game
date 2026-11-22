// Velvet Fox — the hand-in program for the best-heist-game bounty.
// Node 22, standard library only. It copies this repository's game/ and
// screenshots/ into the output directory and writes /output/dossier.json
// with the vendored make.fun library, exactly the dossier the gate rebuilds
// and compares byte for byte.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Never let a bad MAKEFUN_OUTPUT_DIR wipe the repository itself or the
// filesystem root: the output must be /output or a directory outside it.
const outResolved = resolve(out);
if (outResolved === '/' || outResolved === resolve(here)) {
  throw new Error(`refusing unsafe MAKEFUN_OUTPUT_DIR: ${out}`);
}

// Start from a clean output so a stale file from an earlier run can never
// leak into the entry: the grader runs this program twice and both runs
// must write the same bytes. Empty the directory's CONTENTS only — never
// remove the output directory itself, because in the grader /output is a
// volume mount and removing the mount point fails (EBUSY).
mkdirSync(out, { recursive: true });
for (const entry of readdirSync(out)) {
  rmSync(join(out, entry), { recursive: true, force: true });
}
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps (from the kit's RULES.txt): only text_max_bytes
// shapes the dossier's bytes; the other limits refuse an entry the scorer
// would refuse — more than 4 screenshots or one over 256 KiB, more than
// 993 files in game/ or 48 MiB of game files in all, or a path under game/
// over 1000 bytes.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
