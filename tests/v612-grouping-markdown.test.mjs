#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const palette = await readFile(new URL('../src/palette-router.js', import.meta.url), 'utf8');
const markdown = await readFile(new URL('../src/markdown-support.js', import.meta.url), 'utf8');
const build = await readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8');

assert.match(build, /ONE distributable JS extension file/);
assert.match(build, /SuperGUI v6\.1\.4/);
assert.ok(!build.includes("'src/grouped-categories.js'"), 'grouped proxy layer must not be bundled');
assert.ok(!build.includes("'src/real-categories.js'"), 'multi-registration category proxies must not be bundled');
assert.match(build, /src\/palette-router\.js/);
assert.match(build, /src\/markdown-support\.js/);

const categoriesMatch = palette.match(/const SG607_CATEGORIES = \[([\s\S]*?)\];/);
assert.ok(categoriesMatch, 'palette category list missing');
const categories = [...categoriesMatch[1].matchAll(/'([^']+)'/g)].map(m => m[1]).filter(x => !['basic','all'].includes(x));
assert.ok(categories.length >= 30, `expected many navigable object categories, got ${categories.length}`);
for (const name of ['terminal','chat','icon','leaderboard','markdown / rich text','web embed','table / data grid']) {
  assert.ok(categories.includes(name), `missing palette category: ${name}`);
}

for (const opcode of ['setContentModeV612','getContentModeV612','setCodeLanguageV612','setMarkdownSourceV612','setCodeSourceV612']) {
  assert.ok(markdown.includes(opcode), `missing markdown/code opcode ${opcode}`);
}
assert.match(markdown, /document\.createTextNode/);
assert.ok(!markdown.includes('.innerHTML='), 'Markdown renderer must not inject raw HTML');
assert.match(markdown, /```/);
assert.match(markdown, /supergui-code-display/);
assert.match(markdown, /supergui-markdown-display/);

console.log(`OK: one JS extension file, ${categories.length} navigable palette categories, safe Markdown/code display`);
