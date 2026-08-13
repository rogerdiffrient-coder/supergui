#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const grouped = await readFile(new URL('../src/grouped-categories.js', import.meta.url), 'utf8');
const real = await readFile(new URL('../src/real-categories.js', import.meta.url), 'utf8');
const markdown = await readFile(new URL('../src/markdown-support.js', import.meta.url), 'utf8');
const build = await readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8');

const groupEntries = [...grouped.matchAll(/\bid:\s*'(ui|inputschat|datamedia|advanced)'/g)].map(m=>m[1]);
assert.equal(groupEntries.length, 4, 'must register exactly four grouped proxies plus the core');
assert.deepEqual(groupEntries, ['ui','inputschat','datamedia','advanced']);
assert.match(build, /ONE distributable JS file/);
assert.match(build, /SuperGUI v6\.1\.2/);
assert.match(build, /src\/grouped-categories\.js/);
assert.match(build, /src\/markdown-support\.js/);
assert.match(real, /for \(const group of groups\)/);
assert.ok(!real.includes('for (const category of categories)'), 'old one-extension-per-object registration must be gone');

for (const opcode of ['setContentModeV612','getContentModeV612','setCodeLanguageV612','setMarkdownSourceV612','setCodeSourceV612']) {
  assert.ok(markdown.includes(opcode), `missing markdown/code opcode ${opcode}`);
}
assert.match(markdown, /document\.createTextNode/);
assert.ok(!markdown.includes('.innerHTML='), 'Markdown renderer must not inject raw HTML');
assert.match(markdown, /```/);
assert.match(markdown, /supergui-code-display/);
assert.match(markdown, /supergui-markdown-display/);

console.log('OK: one JS bundle, <=5 toolbox categories, safe Markdown/code display');
