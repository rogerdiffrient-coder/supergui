// SuperGUI 6.1.2: host-safe grouped toolbox categories.
// One shared engine owns all state/UI. Four lightweight grouped proxies + the core = 5 categories max.

const _sg612CoreGetInfo = SuperGUI.prototype.getInfo;
SuperGUI.prototype.getInfo = function () {
  const info = _sg612CoreGetInfo.call(this);
  if (this._realCategoryMode && info && Array.isArray(info.blocks)) {
    info.blocks = info.blocks.filter(block => !(block && block.opcode === 'setBlockPaletteMode'));
  }
  return info;
};

function sg612InstallHatRouting(core) {
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
  const groups = typeof SG612_GROUPS !== 'undefined' ? SG612_GROUPS : [];
  let attempted = 0;
  let registered = 0;
  const failures = [];

  for (const group of groups) {
    const proxy = sg612ProxyFor(core, group);
    let info;
    try { info = proxy.getInfo(); }
    catch (e) { failures.push({group:group.name,error:e}); continue; }

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
      failures.push({group:group.name,error:e});
      console.warn('[SuperGUI] grouped toolbox registration failed:', group.name, e);
    }
  }

  sg612InstallHatRouting(core);
  return {
    attempted,
    registered,
    failures,
    complete: attempted === groups.length && registered === attempted
  };
}
