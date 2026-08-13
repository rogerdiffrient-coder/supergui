// SuperGUI 6.1.0: real toolbox categories with host-safe fallback.
// One SuperGUI engine owns all state/UI. Lightweight category proxies expose
// object-specific palettes and delegate every opcode/menu call to that engine.

const _sg610CoreGetInfo = SuperGUI.prototype.getInfo;
SuperGUI.prototype.getInfo = function () {
  const info = _sg610CoreGetInfo.call(this);
  if (this._realCategoryMode && info && Array.isArray(info.blocks)) {
    info.blocks = info.blocks.filter(block => !(block && block.opcode === 'setBlockPaletteMode'));
  }
  return info;
};

function sg610CategoryId(category) {
  return 'supergui' + String(category || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 42);
}

function sg610CategoryName(category) {
  return 'SuperGUI • ' + String(category || '').replace(/\b\w/g, c => c.toUpperCase());
}

class SuperGUICategoryProxy {
  constructor(core, category) {
    this.core = core;
    this.category = category;
  }

  getInfo() {
    const old = this.core._paletteCategory;
    this.core._paletteCategory = this.category;
    let info;
    try {
      info = this.core.getInfo();
    } finally {
      this.core._paletteCategory = old;
    }

    const clone = {...info};
    clone.id = sg610CategoryId(this.category);
    clone.name = sg610CategoryName(this.category);
    clone.blocks = (info.blocks || []).filter(block => !(block && block.opcode === 'setBlockPaletteMode'));
    return clone;
  }
}

function sg610ProxyFor(core, category) {
  const target = new SuperGUICategoryProxy(core, category);
  return new Proxy(target, {
    get(obj, prop, receiver) {
      if (Reflect.has(obj, prop)) return Reflect.get(obj, prop, receiver);
      const value = core[prop];
      return typeof value === 'function' ? value.bind(core) : value;
    },
    has(obj, prop) {
      return Reflect.has(obj, prop) || prop in core;
    }
  });
}

function sg610InstallHatRouting(core) {
  const runtime = core && core.runtime;
  if (!runtime || typeof runtime.startHats !== 'function' || runtime.__superGUIHatRouter) return;
  const original = runtime.startHats.bind(runtime);
  runtime.__superGUIHatRouter = {original, core};
  runtime.startHats = function (opcode, matchFields, target) {
    let threads = original(opcode, matchFields, target) || [];
    const prefix = EXT_ID + '_';
    if (typeof opcode !== 'string' || !opcode.startsWith(prefix)) return threads;
    const shortOpcode = opcode.slice(prefix.length);
    const ids = core._superGUIProxyHatIds && core._superGUIProxyHatIds[shortOpcode];
    if (!ids || !ids.size) return threads;
    for (const id of ids) {
      try {
        const extra = original(id + '_' + shortOpcode, matchFields, target) || [];
        if (Array.isArray(threads) && Array.isArray(extra)) threads.push(...extra);
      } catch (e) {}
    }
    return threads;
  };
}

function registerSuperGUICategories(core) {
  core._superGUIProxyHatIds = Object.create(null);
  const categories = (typeof SG607_CATEGORIES !== 'undefined' ? SG607_CATEGORIES : [])
    .filter(category => category !== 'basic' && category !== 'all');

  let attempted = 0;
  let registered = 0;
  const failures = [];

  for (const category of categories) {
    const proxy = sg610ProxyFor(core, category);
    let info;
    try { info = proxy.getInfo(); }
    catch (e) { failures.push({category,error:e}); continue; }

    const usefulBlocks = (info.blocks || []).filter(block => block && block.opcode);
    if (!usefulBlocks.length) continue;
    attempted++;
    try {
      Scratch.extensions.register(proxy);
      registered++;
      const proxyId = info.id;
      for (const block of usefulBlocks) {
        if (block.blockType !== Scratch.BlockType.HAT) continue;
        const opcode = String(block.opcode || '');
        if (!opcode) continue;
        if (!core._superGUIProxyHatIds[opcode]) core._superGUIProxyHatIds[opcode] = new Set();
        core._superGUIProxyHatIds[opcode].add(proxyId);
      }
    } catch (e) {
      failures.push({category,error:e});
      console.warn('[SuperGUI] toolbox category registration failed:', category, e);
    }
  }

  sg610InstallHatRouting(core);
  return {
    attempted,
    registered,
    failures,
    complete: attempted > 0 && registered === attempted
  };
}
