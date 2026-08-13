// SuperGUI 6.0.8: real PenguinMod toolbox categories.
// One SuperGUI engine owns all state/UI. Lightweight category proxies expose
// object-specific palettes that delegate every opcode/menu call to that engine.

const _sg608CoreGetInfo = SuperGUI.prototype.getInfo;
SuperGUI.prototype.getInfo = function () {
  const info = _sg608CoreGetInfo.call(this);
  if (this._realCategoryMode && info && Array.isArray(info.blocks)) {
    info.blocks = info.blocks.filter(block => !(block && block.opcode === 'setBlockPaletteMode'));
  }
  return info;
};

function sg608CategoryId(category) {
  return 'supergui' + String(category || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 42);
}

function sg608CategoryName(category) {
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
    clone.id = sg608CategoryId(this.category);
    clone.name = sg608CategoryName(this.category);
    clone.blocks = (info.blocks || []).filter(block => !(block && block.opcode === 'setBlockPaletteMode'));
    return clone;
  }
}

function sg608ProxyFor(core, category) {
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

function registerSuperGUICategories(core) {
  core._realCategoryMode = true;
  core._paletteCategory = 'basic';

  const categories = (typeof SG607_CATEGORIES !== 'undefined' ? SG607_CATEGORIES : [])
    .filter(category => category !== 'basic' && category !== 'all');

  for (const category of categories) {
    const proxy = sg608ProxyFor(core, category);
    let info;
    try { info = proxy.getInfo(); } catch (e) { console.warn('[SuperGUI] category failed:', category, e); continue; }
    const usefulBlocks = (info.blocks || []).filter(block => block && block.opcode);
    if (!usefulBlocks.length) continue;
    Scratch.extensions.register(proxy);
  }
}
