// SuperGUI 6.1.0 cross-host compatibility helpers and safe dropdown upgrades.

function sg610DetectHost() {
  const host = String((globalThis.location && globalThis.location.hostname) || '').toLowerCase();
  if (host.includes('penguinmod')) return 'PenguinMod';
  if (host.includes('turbowarp')) return 'TurboWarp';
  if (host.includes('cocrea') || host.includes('getgandi') || host.includes('gandi')) return 'Cocrea / Gandi IDE';
  return 'Scratch-compatible host';
}

const _sg610CompatGetInfo = SuperGUI.prototype.getInfo;
SuperGUI.prototype.getInfo = function () {
  const info = _sg610CompatGetInfo.call(this);
  const S = Scratch.ArgumentType;
  const B = Scratch.BlockType;
  info.menus = info.menus || {};
  info.menus.sgAlertLevels = {acceptReporters:false,items:['info','success','warning','error']};

  // Upgrade categorical text fields that were accidentally left as plain strings.
  for (const block of info.blocks || []) {
    if (!block || !block.arguments) continue;
    if (block.opcode === 'sg606Alert' && block.arguments.LEVEL) {
      block.arguments.LEVEL = {type:S.STRING,menu:'sgAlertLevels',defaultValue:'info'};
    }
  }

  // Tiny diagnostics reporter: useful when a mod behaves differently.
  if (!(info.blocks || []).some(block => block && block.opcode === 'getSuperGUIHost')) {
    info.blocks = [
      {blockType:B.LABEL,text:'─── Compatibility ───'},
      {opcode:'getSuperGUIHost',blockType:B.REPORTER,text:'SuperGUI host'}
    ].concat(info.blocks || []);
  }
  return info;
};

SuperGUI.prototype.getSuperGUIHost = function () { return sg610DetectHost(); };
