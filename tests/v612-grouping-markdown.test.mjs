#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const real = await readFile(new URL('../src/real-categories.js', import.meta.url), 'utf8');
const palette = await readFile(new URL('../src/palette-router.js', import.meta.url), 'utf8');
const markdown = await readFile(new URL('../src/markdown-support.js', import.meta.url), 'utf8');
const build = await readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8');

assert.match(build, /ONE distributable JS extension file/);
assert.match(build, /SuperGUI v6\.1\.3/);
assert.ok(!build.includes("'src/grouped-categories.js'"), 'five-category grouping layer must not be bundled');
assert.match(build, /src\/markdown-support\.js/);
assert.match(real, /for \(const category of categories\)/);
assert.ok(!real.includes('for (const group of groups)'), 'grouped five-category registration must be gone');

const categoriesMatch = palette.match(/const SG607_CATEGORIES = \[([\s\S]*?)\];/);
assert.ok(categoriesMatch, 'object category list missing');
const categories = [...categoriesMatch[1].matchAll(/'([^']+)'/g)].map(m => m[1]).filter(x => !['basic','all'].includes(x));
assert.ok(categories.length >= 30, `expected many object-specific categories, got ${categories.length}`);
for (const name of ['terminal','chat','icon','leaderboard','markdown / rich text','web embed','table / data grid']) {
  assert.ok(categories.includes(name), `missing object-specific category: ${name}`);
}

for (const opcode of ['setContentModeV612','getContentModeV612','setCodeLanguageV612','setMarkdownSourceV612','setCodeSourceV612']) {
  assert.ok(markdown.includes(opcode), `missing markdown/code opcode ${opcode}`);
}
assert.match(markdown, /document\.createTextNode/);
assert.ok(!markdown.includes('.innerHTML='), 'Markdown renderer must not inject raw HTML');
assert.match(markdown, /```/);
assert.match(markdown, /supergui-code-display/);
assert.match(markdown, /supergui-markdown-display/);

console.log(`OK: one JS extension file, ${categories.length} object-specific toolbox categories, safe Markdown/code display`);
