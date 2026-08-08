// Achievements, leaderboards, and adapters for companion storage extensions.

const STORAGE_PLUS_ID = 'g1nxBettererStorage';
const SERVER_STORAGE_ID = 'ikeleneServerStorage';
const FREE_SERVERS_ID = 'FreeServers';

const safePart = (value, fallback) => {
  const clean = String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  return (clean || fallback).slice(0, 64);
};

const parseJSON = (value, fallback) => {
  if (value === null || value === undefined || value === '') return fallback;
  try { return typeof value === 'string' ? JSON.parse(value) : value; } catch (_) { return fallback; }
};

export class GameServices {
  constructor(owner) {
    this.owner = owner;
    this.adapter = 'local';
    this.namespace = 'my-game';
    this.playerId = 'player';
    this.achievements = {};
    this.boardCache = {};
    this.lastStatus = 'ready';
  }

  setNamespace(value) { this.namespace = safePart(value, 'my-game'); }
  setPlayer(value) { this.playerId = safePart(value, 'player'); }
  setAdapter(value) {
    const adapter = String(value || '').toLowerCase();
    this.adapter = ['auto', 'local', 'storage+', 'server storage'].includes(adapter) ? adapter : 'local';
  }

  _primitive(id, opcode) {
    const primitives = this.owner.runtime && this.owner.runtime._primitives;
    return primitives && primitives[`${id}_${opcode}`];
  }

  isAvailable(adapter) {
    if (adapter === 'local') return typeof localStorage !== 'undefined';
    if (adapter === 'storage+') return !!this._primitive(STORAGE_PLUS_ID, 'getVal');
    if (adapter === 'server storage') return !!this._primitive(SERVER_STORAGE_ID, 'getFromServer');
    if (adapter === 'free servers') return !!this._primitive(FREE_SERVERS_ID, 'ping');
    if (adapter === 'auto') return this.isAvailable('storage+') || this.isAvailable('server storage') || this.isAvailable('local');
    return false;
  }

  _activeAdapter() {
    if (this.adapter !== 'auto') return this.adapter;
    if (this.isAvailable('storage+')) return 'storage+';
    if (this.isAvailable('server storage')) return 'server storage';
    return 'local';
  }

  async _call(id, opcode, args) {
    const primitive = this._primitive(id, opcode);
    if (!primitive) throw new Error(`${id} is not loaded`);
    return await primitive(args || {}, null);
  }

  _key(kind, id) { return `supergui:${this.namespace}:${kind}:${safePart(id, 'default')}`; }

  async _get(key) {
    const adapter = this._activeAdapter();
    if (adapter === 'storage+') return await this._call(STORAGE_PLUS_ID, 'getVal', { KEY: key });
    if (adapter === 'server storage') return await this._call(SERVER_STORAGE_ID, 'getFromServer', { KEY: key });
    return localStorage.getItem(key) || '';
  }

  async _set(key, value) {
    const adapter = this._activeAdapter();
    if (adapter === 'storage+') return await this._call(STORAGE_PLUS_ID, 'setVal', { KEY: key, VAL: value, LOCK: false });
    if (adapter === 'server storage') return await this._call(SERVER_STORAGE_ID, 'saveToServer', { KEY: key, VALUE: value });
    localStorage.setItem(key, value);
  }

  async _guard(action, fallback) {
    try {
      const result = await action();
      this.lastStatus = `ok (${this._activeAdapter()})`;
      return result;
    } catch (error) {
      this.lastStatus = error && error.message ? error.message : 'storage operation failed';
      return fallback;
    }
  }

  defineAchievement(id, title, description, points, target = 1) {
    id = safePart(id, 'achievement');
    this.achievements[id] = {
      id,
      title: String(title || id),
      description: String(description || ''),
      points: Math.max(0, Number(points) || 0),
      target: Math.max(1, Number(target) || 1),
      icon: '🏆',
      secret: false
    };
    return id;
  }

  setAchievementIcon(id, icon) { const a = this.achievements[safePart(id, '')]; if (a) a.icon = String(icon || '🏆'); }
  setAchievementSecret(id, secret) { const a = this.achievements[safePart(id, '')]; if (a) a.secret = !!secret; }
  getAchievement(id) { return this.achievements[safePart(id, '')]; }

  async _profile() {
    const raw = await this._get(this._key('player', this.playerId));
    const profile = parseJSON(raw, {});
    if (!profile || typeof profile !== 'object' || Array.isArray(profile)) return { achievements: {}, points: 0 };
    if (!profile.achievements || typeof profile.achievements !== 'object') profile.achievements = {};
    profile.points = Number(profile.points) || 0;
    return profile;
  }

  async unlock(id) {
    id = safePart(id, '');
    return await this._guard(async () => {
      const achievement = this.achievements[id];
      if (!achievement) throw new Error(`unknown achievement: ${id}`);
      const profile = await this._profile();
      const state = profile.achievements[id] || { progress: 0, unlockedAt: 0 };
      if (state.unlockedAt) return false;
      state.progress = achievement.target;
      state.unlockedAt = Date.now();
      profile.achievements[id] = state;
      profile.points += achievement.points;
      await this._set(this._key('player', this.playerId), JSON.stringify(profile));
      this.owner.runtime.startHats('supergui_whenAchievementUnlocked', { A: id });
      if (typeof this.owner._onAchievementUnlocked === 'function') this.owner._onAchievementUnlocked(achievement);
      return true;
    }, false);
  }

  async setProgress(id, progress) {
    id = safePart(id, '');
    return await this._guard(async () => {
      const achievement = this.achievements[id];
      if (!achievement) throw new Error(`unknown achievement: ${id}`);
      const profile = await this._profile();
      const state = profile.achievements[id] || { progress: 0, unlockedAt: 0 };
      state.progress = Math.max(0, Math.min(achievement.target, Number(progress) || 0));
      profile.achievements[id] = state;
      await this._set(this._key('player', this.playerId), JSON.stringify(profile));
      if (state.progress >= achievement.target && !state.unlockedAt) return await this.unlock(id);
      return true;
    }, false);
  }

  async achievementState(id) {
    id = safePart(id, '');
    return await this._guard(async () => {
      const profile = await this._profile();
      return profile.achievements[id] || { progress: 0, unlockedAt: 0 };
    }, { progress: 0, unlockedAt: 0 });
  }

  async totalPoints() { return await this._guard(async () => (await this._profile()).points, 0); }

  async submitScore(boardId, score, mode) {
    boardId = safePart(boardId, 'main');
    return await this._guard(async () => {
      const key = this._key('leaderboard', boardId);
      const current = parseJSON(await this._get(key), []);
      const entries = Array.isArray(current) ? current.filter(row => row && typeof row === 'object') : [];
      const numericScore = Number(score) || 0;
      let row = entries.find(entry => entry.player === this.playerId);
      if (!row) { row = { player: this.playerId, score: numericScore, updatedAt: Date.now() }; entries.push(row); }
      else if (mode === 'latest' || numericScore > Number(row.score || 0)) { row.score = numericScore; row.updatedAt = Date.now(); }
      entries.sort((a, b) => Number(b.score || 0) - Number(a.score || 0) || Number(a.updatedAt || 0) - Number(b.updatedAt || 0));
      const trimmed = entries.slice(0, 100);
      await this._set(key, JSON.stringify(trimmed));
      this.boardCache[boardId] = trimmed;
      this.owner.runtime.startHats('supergui_whenLeaderboardUpdated', { B: boardId });
      return trimmed;
    }, []);
  }

  async leaderboard(boardId) {
    boardId = safePart(boardId, 'main');
    return await this._guard(async () => {
      const value = parseJSON(await this._get(this._key('leaderboard', boardId)), []);
      const entries = Array.isArray(value) ? value : [];
      entries.sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
      this.boardCache[boardId] = entries;
      return entries;
    }, []);
  }

  async pingServer(url) {
    return await this._guard(async () => !!(await this._call(FREE_SERVERS_ID, 'ping', { SERVER: String(url || '') })), false);
  }
}
