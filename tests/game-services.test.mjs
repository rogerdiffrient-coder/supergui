import assert from 'node:assert/strict';
import { GameServices } from '../src/game-services.js';

const values = new Map();
globalThis.localStorage = {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, String(value))
};

const hats = [];
const owner = { runtime: { _primitives: {}, startHats: (name, match) => hats.push({ name, match }) } };
const services = new GameServices(owner);
services.setNamespace('Example Game');
services.setPlayer('Player One');

assert.equal(services.namespace, 'example-game');
assert.equal(services.playerId, 'player-one');
assert.equal(services.defineAchievement('First Win', 'First Win', 'Win once', 10, 1), 'first-win');
assert.equal(await services.unlock('first-win'), true);
assert.equal(await services.unlock('first-win'), false);
assert.equal((await services.achievementState('first-win')).unlockedAt > 0, true);
assert.equal(await services.totalPoints(), 10);
assert.equal(hats[0].name, 'supergui_whenAchievementUnlocked');

await services.submitScore('main', 50, 'best');
await services.submitScore('main', 20, 'best');
assert.equal((await services.leaderboard('main'))[0].score, 50);
await services.submitScore('main', 20, 'latest');
assert.equal((await services.leaderboard('main'))[0].score, 20);

const remote = new Map();
owner.runtime._primitives.g1nxBettererStorage_setVal = async ({ KEY, VAL }) => remote.set(KEY, VAL);
owner.runtime._primitives.g1nxBettererStorage_getVal = async ({ KEY }) => remote.get(KEY) ?? '';
services.setAdapter('storage+');
services.setPlayer('Remote Player');
await services.submitScore('remote', 99, 'best');
assert.equal((await services.leaderboard('remote'))[0].player, 'remote-player');

console.log('OK: local achievements, leaderboards, events, and Storage+ adapter');
