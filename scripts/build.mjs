#!/usr/bin/env node
// Build the browser-loadable SuperGUI extension without third-party packages.

import { readFile, mkdir, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(SCRIPT_PATH), '..');
const SOURCE_FILES = [
  'src/constants-and-model.js',
  'src/game-services.js',
  'src/editor/editor-template.js',
  'src/super-gui.js',
  'src/v5-layout.js',
  'src/v5x-overhaul.js',
  'src/runtime-stability.js',
  'src/v6.js',
  'src/v6-fixes.js'
];
export const OUTPUT = path.join(ROOT, 'dist/supergui.js');

const removeModuleSyntax = source => source
  .replace(/^import\s+[\s\S]*?;\s*\n/gm, '')
  .replace(/^export\s+(?=(?:const|function|class)\b)/gm, '');

export async function buildBundle() {
  const modules = await Promise.all(
    SOURCE_FILES.map(async file => removeModuleSyntax(await readFile(path.join(ROOT, file), 'utf8')))
  );
  const body = modules.join('\n\n');
  return `// SuperGUI v6.0 - generated file; edit src/ and run \`npm run build\`.
// Load this file as an unsandboxed custom extension in PenguinMod, TurboWarp, or Gandi IDE.
(function (Scratch) {
  'use strict';
  if (!Scratch || !Scratch.extensions || !Scratch.extensions.unsandboxed) {
    throw new Error('SuperGUI must be run unsandboxed.');
  }

${body}

  // Hosts expose the VM in slightly different places. Prefer the public Scratch
  // object, then use the globals provided by older editor builds.
  const runtime = (Scratch.vm && Scratch.vm.runtime) || Scratch.runtime ||
    (globalThis.vm && globalThis.vm.runtime);
  if (!runtime) throw new Error('SuperGUI could not find the Scratch runtime.');
  Scratch.extensions.register(new SuperGUI(runtime));
})(globalThis.Scratch);
`;
}

export async function writeBundle() {
  await mkdir(path.dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, await buildBundle());
  const info = await stat(OUTPUT);
  console.log(`Built ${path.relative(ROOT, OUTPUT)} (${info.size.toLocaleString('en-US')} bytes)`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  await writeBundle();
}
