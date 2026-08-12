// SuperGUI fullscreen scaling controls.
// Default: keep GUI at its 480x360 design size when the rendered stage grows.

const _sgFullscreenOriginalGetInfo = SuperGUI.prototype.getInfo;
SuperGUI.prototype.getInfo = function () {
  const info = _sgFullscreenOriginalGetInfo.call(this);
  const B = Scratch.BlockType, S = Scratch.ArgumentType;
  info.menus = info.menus || {};
  info.menus.fullscreenGuiScaling = {acceptReporters:false, items:['on','off']};
  const blocks = [
    {blockType:B.LABEL,text:'─── Fullscreen scaling ───'},
    {opcode:'setFullscreenGUIScaling',blockType:B.COMMAND,text:'set GUI scaling in fullscreen [STATE]',arguments:{STATE:{type:S.STRING,menu:'fullscreenGuiScaling',defaultValue:'off'}}},
    {opcode:'isFullscreenGUIScalingEnabled',blockType:B.BOOLEAN,text:'GUI scales in fullscreen?'}
  ];
  info.blocks = blocks.concat(info.blocks || []);
  return info;
};

SuperGUI.prototype.setFullscreenGUIScaling = function (a) {
  this._scaleGUIInFullscreen = String(a.STATE || 'off').toLowerCase() === 'on';
  this._syncOverlayPosition();
  if (this.panelDoms && Object.keys(this.panelDoms).length) this._renderAll();
};

SuperGUI.prototype.isFullscreenGUIScalingEnabled = function () {
  return !!this._scaleGUIInFullscreen;
};
