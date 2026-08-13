import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const templates = await readFile(new URL('src/v611-templates.js', root), 'utf8');
const build = await readFile(new URL('scripts/build.mjs', root), 'utf8');

const expected = [
  'Chatbot','Icon Selector','Login Screen','Sign-Up Form','Profile Card','Notification Center',
  'File Manager','Music Player','Video Player','Calculator','Notes App','Paint App',
  'App Launcher','Taskbar','Start Menu','Friends List','Comment Section','Pause Menu',
  'Shop','Quest Log','Achievement Popup','Level Select','Coding Assistant','Help Desk'
];

for (const name of expected) assert.ok(templates.includes(`'${name}'`), `missing template: ${name}`);
assert.ok(templates.includes("'Chatbot': () =>"), 'Chatbot factory missing');
for (const id of ['Messages','BotMessage','UserMessage','Typing','MessageInput','Send']) {
  assert.ok(templates.includes(`'${id}'`), `Chatbot missing UI element: ${id}`);
}
assert.ok(!/fetch\s*\(|ollama|openai|anthropic|gemini|\/api\/chat/i.test(templates), 'templates must not contain built-in AI/network logic');
assert.ok(build.includes("'src/v611-templates.js'"), 'template pack is not included in generated bundle');
const versionMatch = build.match(/SuperGUI v(\d+)\.(\d+)\.(\d+)/);
assert.ok(versionMatch, 'bundle version missing');
const version = versionMatch.slice(1).map(Number);
assert.ok(version[0] > 6 || (version[0] === 6 && (version[1] > 1 || (version[1] === 1 && version[2] >= 1))), 'template pack requires SuperGUI 6.1.1 or newer');

console.log(`OK: ${expected.length} additional UI-only templates, including generic Chatbot`);
