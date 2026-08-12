// SuperGUI fullscreen scaling controls.
// Default: preserve the GUI's pre-fullscreen physical size instead of enlarging it.

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

// Override the stability layer's sync with two fullscreen behaviors:
// OFF (default): remember the pre-fullscreen stage size and keep the GUI that size.
// ON: let the GUI expand and reflow with the rendered fullscreen stage.
SuperGUI.prototype._syncOverlayPosition = function () {
  this._ensureOverlayHost && this._ensureOverlayHost();
  const canvas = this.runtime && this.runtime.renderer && this.runtime.renderer.canvas;
  const overlay = this.overlay;
  if (!canvas || !overlay) return;

  const host = this._overlayHost || overlay.parentElement || document.body;
  const canvasRect = canvas.getBoundingClientRect();
  const hostRect = host.getBoundingClientRect();
  if (!canvasRect.width || !canvasRect.height) return;

  const explicitFullscreen = !!document.fullscreenElement;
  const remembered = this._preFullscreenStageSize;
  const sizeJumpFullscreen = !!remembered &&
    (canvasRect.width > remembered.width * 1.3 || canvasRect.height > remembered.height * 1.3);
  const fullscreenLike = explicitFullscreen || sizeJumpFullscreen;

  // Learn/update the ordinary embedded stage size only while we are not fullscreen.
  if (!fullscreenLike) {
    this._preFullscreenStageSize = {width:canvasRect.width, height:canvasRect.height};
  }

  const base = this._preFullscreenStageSize || {width:canvasRect.width, height:canvasRect.height};
  const scaleInFullscreen = !!this._scaleGUIInFullscreen;
  const freeze = fullscreenLike && !scaleInFullscreen;
  const width = freeze ? Math.min(base.width, canvasRect.width) : canvasRect.width;
  const height = freeze ? Math.min(base.height, canvasRect.height) : canvasRect.height;
  const insetX = freeze ? (canvasRect.width - width) / 2 : 0;
  const insetY = freeze ? (canvasRect.height - height) / 2 : 0;

  overlay.style.left = (canvasRect.left - hostRect.left + host.scrollLeft + insetX) + 'px';
  overlay.style.top = (canvasRect.top - hostRect.top + host.scrollTop + insetY) + 'px';
  overlay.style.width = width + 'px';
  overlay.style.height = height + 'px';

  const sx = width / 480;
  const sy = height / 360;
  const nextScale = Math.max(0.1, Math.min(sx, sy));
  this._uiScale = nextScale;

  if (Math.abs(nextScale - (this._lastUIScale || 1)) > 0.01) {
    this._lastUIScale = nextScale;
    if (this.panelDoms && Object.keys(this.panelDoms).length) this._renderAll();
  }
};
