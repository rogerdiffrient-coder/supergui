#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>readFile(path.join(ROOT,f),'utf8');
const [v6,interactive,bundle]=await Promise.all([read('src/v6.js'),read('src/v6-interactive.js'),read('dist/supergui.js')]);
const source=v6+'\n'+interactive;
const opcodes=[...source.matchAll(/opcode:'([^']+)'/g)].map(m=>m[1]);
const assigned=new Set([...source.matchAll(/SuperGUI\.prototype\.([A-Za-z_$][\w$]*)\s*=/g)].map(m=>m[1]));
for(const opcode of opcodes) assert.ok(assigned.has(opcode)||source.includes(opcode+' = function'),`v6 block has no method: ${opcode}`);
for(const type of ['terminal','textarea','passwordinput','emailinput','urlinput','datepicker','filepicker','stepper','segmentedcontrol','toolbar','menubar','pagination','list']) assert.ok(interactive.includes("el.type==='"+type+"'")||interactive.includes("'"+type+"'"),`interactive renderer missing ${type}`);
for(const marker of ['whenTerminalCommandV6','getLastTerminalCommandV6','commandHistory','ArrowUp','Enter','whenV6FileSelected','whenV6ItemActivated']) assert.ok(interactive.includes(marker),`missing interactive feature: ${marker}`);
assert.ok(bundle.includes('v6.0.2'),'bundle version banner is stale');
assert.ok(bundle.includes('supergui-terminal-output'),'terminal runtime was not bundled');
console.log(`OK: ${opcodes.length} v6 blocks have methods; interactive controls and terminal are bundled`);
