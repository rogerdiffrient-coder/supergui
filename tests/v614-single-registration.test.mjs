#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildBundle } from '../scripts/build.mjs';

const build = await readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8');
const palette = await readFile(new URL('../src/palette-router.js', import.meta.url), 'utf8');
const bundle = await buildBundle();

assert.match(build, /SuperGUI v6\.1\.4/);
assert.equal((bundle.match(/Scratch\.extensions\.register\(/g) || []).length, 1, 'bundle must call Scratch.extensions.register exactly once');
assert.ok(!bundle.includes('registerSuperGUICategories(core)'), 'proxy category registration leaked into bundle');
assert.ok(!build.includes("'src/real-categories.js'"), 'real-categories proxy layer must not be bundled');
assert.ok(palette.includes('show SuperGUI category') || palette.includes('SG607_CATEGORIES'), 'palette navigation must remain available');
assert.ok(bundle.includes("core._paletteCategory = 'basic'"), 'single extension should start in the basic palette');

console.log('OK: one installed SuperGUI extension with internal palette navigation');
