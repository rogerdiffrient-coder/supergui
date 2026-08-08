#!/usr/bin/env node
// Fast, dependency-free structural regression checks.

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildBundle, OUTPUT } from '../scripts/build.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFile(path.join(ROOT, file), 'utf8');
const [runtime, gameServices, model, editor, bundle] = await Promise.all([
  read('src/super-gui.js'),
  read('src/game-services.js'),
  read('src/constants-and-model.js'),
  read('src/editor/editor-template.js'),
  readFile(OUTPUT, 'utf8')
]);

const matches = (text, regex, group = 1) => [...text.matchAll(regex)].map(match => match[group]);
const opcodes = matches(runtime, /opcode:\s*'([^']+)'/g);
const methods = new Set(matches(runtime, /^    (?:async\s+)?([A-Za-z_$][\w$]*)\s*\(/gm));
const emittedHats = new Set(matches(runtime, /startHats\(EXT_ID \+ '_([^']+)'/g));
const typeList = model.match(/export const ELEMENT_TYPES = \[([\s\S]*?)\];/);
const elementTypes = new Set(typeList ? matches(typeList[1], /'([^']+)'/g) : []);
const defaultTypes = new Set(matches(model, /case '([^']+)'/g));
const editorTypes = new Set(matches(editor, /<option value="([^"]+)">/g));
const renderer = runtime.slice(runtime.indexOf('_createElementDom'));
const renderedTypes = new Set(matches(renderer, /case '([^']+)'/g));

assert.equal(bundle, await buildBundle(), 'dist/supergui.js is stale; run npm run build');
assert.equal(opcodes.length, new Set(opcodes).size, 'duplicate Scratch opcode');
assert.deepEqual([...new Set(opcodes)].filter(name => !methods.has(name)), [], 'a Scratch block has no matching method');
assert.deepEqual([...emittedHats].filter(name => !opcodes.includes(name)), [], 'an emitted hat has no matching block');
assert.match(model, /normalizeConfig\(JSON\.parse\(raw\)\)/, 'stored config must be normalized');
assert.match(runtime, /normalizeConfig\(config\)/, 'replacement config must be normalized');
for (const id of ['g1nxBettererStorage', 'ikeleneServerStorage', 'FreeServers']) {
  assert.ok(gameServices.includes(id), `missing companion adapter: ${id}`);
}
assert.ok((editor.match(/<optgroup/g) || []).length >= 4, 'editor element choices must be categorized');
assert.deepEqual(elementTypes, defaultTypes, 'model defaults do not cover every element type');
assert.deepEqual(elementTypes, editorTypes, 'editor does not cover every element type');
assert.deepEqual(elementTypes, renderedTypes, 'renderer does not cover every element type');
assert.ok(!renderer.slice(renderer.indexOf("case 'joystick'"), renderer.indexOf("case 'carousel'")).includes("document.addEventListener('mousemove', onMove);"), 'interactive controls leaked global listeners');
assert.ok(bundle.includes('Scratch.extensions.register(new SuperGUI(runtime))'), 'bundle does not register');
assert.ok(!bundle.includes('import {') && !bundle.includes('export class'), 'module syntax leaked into bundle');

console.log(`OK: ${opcodes.length} blocks, ${methods.size} methods, categorized editor, current bundle`);
