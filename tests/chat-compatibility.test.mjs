import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildBundle } from '../scripts/build.mjs';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const [chat, compat, router, build] = await Promise.all([
  read('src/chat-system.js'),
  read('src/compatibility.js'),
  read('src/palette-router.js'),
  buildBundle()
]);

for (const opcode of ['whenChatMessageReceived','chatMessage','sendChatMessage','chatSenderName','chatSenderPFP','chatMessageSide','chatHistoryJSON','clearChatHistory']) {
  assert.ok(chat.includes(`opcode:'${opcode}'`), `missing chat block: ${opcode}`);
  assert.ok(router.includes(`'${opcode}'`), `chat block not routed to Chat palette: ${opcode}`);
}

assert.ok(chat.includes('S.COSTUME'), 'chat PFP does not prefer the native costume field');
assert.ok(chat.includes("menu:'sgChatCostumes'"), 'chat PFP has no fallback costume menu');
assert.ok(chat.includes('target.sprite') && chat.includes('getCostumes'), 'costume fallback does not cover Scratch VM target shapes');
assert.ok(chat.includes('encodeDataURI'), 'chat PFP does not preserve costume artwork when the VM exposes asset data');
assert.ok(chat.includes("EXT_ID + '_whenChatMessageReceived'"), 'chat send does not dispatch its hat');

assert.equal((build.match(/Scratch\.extensions\.register\(core\)/g) || []).length, 1, 'host compatibility must use one core extension registration');
assert.ok(!build.includes('registerSuperGUICategories(core)'), 'proxy category registration must remain removed');
assert.ok(build.includes("core._paletteCategory = 'basic'"), 'single-registration palette should start in basic mode');
assert.ok(router.includes('SG607_CATEGORIES') && router.includes('setBlockPaletteMode'), 'palette navigator must replace proxy categories');

for (const host of ['PenguinMod','TurboWarp','Cocrea / Gandi IDE']) {
  assert.ok(build.includes(host) || compat.includes(host), `missing declared compatibility for ${host}`);
}
assert.ok(compat.includes('sgAlertLevels'), 'categorical alert level remains a raw text socket');

console.log('OK: chat system, costume fallback, single registration, palette navigation, and host compatibility');
