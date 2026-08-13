import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildBundle } from '../scripts/build.mjs';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const [chat, compat, categories, router, build] = await Promise.all([
  read('src/chat-system.js'),
  read('src/compatibility.js'),
  read('src/real-categories.js'),
  read('src/palette-router.js'),
  buildBundle()
]);

for (const opcode of ['whenChatMessageReceived','chatMessage','sendChatMessage','chatSenderName','chatSenderPFP','chatMessageSide','chatHistoryJSON','clearChatHistory']) {
  assert.ok(chat.includes(`opcode:'${opcode}'`), `missing chat block: ${opcode}`);
  assert.ok(router.includes(`'${opcode}'`), `chat block not routed to Chat category: ${opcode}`);
}

assert.ok(chat.includes('S.COSTUME'), 'chat PFP does not prefer the native costume field');
assert.ok(chat.includes("menu:'sgChatCostumes'"), 'chat PFP has no fallback costume menu');
assert.ok(chat.includes('target.sprite') && chat.includes('getCostumes'), 'costume fallback does not cover Scratch VM target shapes');
assert.ok(chat.includes('encodeDataURI'), 'chat PFP does not preserve costume artwork when the VM exposes asset data');
assert.ok(chat.includes("EXT_ID + '_whenChatMessageReceived'"), 'chat send does not dispatch its hat');

assert.ok(categories.includes('__superGUIHatRouter'), 'proxy categories do not route hats back to their real category IDs');
assert.ok(categories.includes('_superGUIProxyHatIds'), 'proxy hat ID map is missing');
assert.ok(categories.includes('failures') && categories.includes('complete:'), 'category registration has no compatibility result/fallback state');
assert.ok(build.includes("core._paletteCategory = categoryResult.complete ? 'basic' : 'all'"), 'failed category registration does not fall back to all blocks');
assert.ok(build.indexOf('registerSuperGUICategories(core)') < build.indexOf('Scratch.extensions.register(core)'), 'core should register after category probing so fallback can be selected safely');

for (const host of ['PenguinMod','TurboWarp','Cocrea / Gandi IDE']) {
  assert.ok(build.includes(host) || compat.includes(host), `missing declared compatibility for ${host}`);
}
assert.ok(compat.includes('sgAlertLevels'), 'categorical alert level remains a raw text socket');

console.log('OK: chat system, costume fallback, proxy hats, category fallback, and host compatibility');
