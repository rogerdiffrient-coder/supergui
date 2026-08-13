import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildBundle } from '../scripts/build.mjs';
import { ELEMENT_TYPES } from '../src/constants-and-model.js';

const root = new URL('../', import.meta.url);
const runtime = await readFile(new URL('src/super-gui.js', root), 'utf8');
const model = await readFile(new URL('src/constants-and-model.js', root), 'utf8');
const editor = await readFile(new URL('src/editor/editor-template.js', root), 'utf8');
const gameServices = await readFile(new URL('src/game-services.js', root), 'utf8');
const categories = await readFile(new URL('src/real-categories.js', root), 'utf8');
const bundle = await buildBundle();

const opcodes = [...runtime.matchAll(/opcode:\s*'([^']+)'/g)].map(m => m[1]);
const methods = new Set([...runtime.matchAll(/^\s{4}([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/gm)].map(m => m[1]));
const missing = [...new Set(opcodes.filter(op => !methods.has(op)))];
assert.deepEqual(missing, [], `block opcodes missing methods: ${missing.join(', ')}`);

const defaultTypes = ELEMENT_TYPES.slice().sort();
const editorTypes = [...new Set([...editor.matchAll(/<option value="([^"]+)"/g)].map(m => m[1]))]
  .filter(type => defaultTypes.includes(type)).sort();
const renderedTypes = [...new Set([...runtime.matchAll(/case '([^']+)'/g)].map(m => m[1]))]
  .filter(type => defaultTypes.includes(type)).sort();

assert.match(model, /normalizeConfig\(JSON\.parse\(raw\)\)/, 'stored config must be normalized');
assert.match(runtime, /normalizeConfig\(config\)/, 'replacement config must be normalized');
for (const id of ['g1nxBettererStorage', 'ikeleneServerStorage', 'FreeServers']) {
  assert.ok(gameServices.includes(id), `missing companion adapter: ${id}`);
}
assert.ok((editor.match(/<optgroup/g) || []).length >= 4, 'editor element choices must be categorized');
assert.deepEqual(defaultTypes, editorTypes, 'editor does not cover every element type');
assert.deepEqual(defaultTypes, renderedTypes, 'renderer does not cover every element type');
assert.ok(!runtime.slice(runtime.indexOf("case 'joystick'"), runtime.indexOf("case 'carousel'")).includes("document.addEventListener('mousemove', onMove);"), 'interactive controls leaked global listeners');
assert.ok(bundle.includes('const core = new SuperGUI(runtime)'), 'bundle does not create one shared SuperGUI core');
assert.ok(bundle.includes('Scratch.extensions.register(core)'), 'bundle does not register the core category');
assert.ok(bundle.includes('registerSuperGUICategories(core)'), 'bundle does not register real object categories');
assert.ok(categories.includes('new Proxy') && categories.includes('value.bind(core)'), 'category wrappers do not delegate to the shared core');
assert.ok(bundle.includes('Scratch.runtime') && bundle.includes('globalThis.vm'), 'bundle must support host runtime locations');
for (const host of ['PenguinMod', 'TurboWarp', 'Gandi IDE']) {
  assert.ok(bundle.includes(host), `bundle does not identify ${host} support`);
}
assert.ok(!bundle.includes('import {') && !bundle.includes('export class'), 'module syntax leaked into bundle');

console.log(`OK: ${opcodes.length} blocks, ${methods.size} methods, categorized editor, shared-core toolbox categories, current bundle`);
