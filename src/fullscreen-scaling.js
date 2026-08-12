// SuperGUI fullscreen scaling controls.
// Default OFF means preserve the pre-fullscreen layout and uniformly scale it as one finished UI.

const _sgFullscreenOriginalGetInfo = SuperGUI.prototype.getInfo;
SuperGUI.prototype.getInfo = function () {
  const info = _sgFullscreenOriginalGetInfo.call(this);
  const B = Scratch.BlockType, S = Scratch.ArgumentType;
  info.menus = info.menus || {};
  info.menus.fullscreenGuiScaling = {acceptReporters:false, items:['on','off']};
  const blocks = [
    {blockType:B.LABEL,text:'─── Fullscreen scaling ───'},
    {opcode:'setFullscreenGUIScaling',blockType:B.COMMAND,text:'set GUI responsive reflow in fullscreen [STATE]',arguments:{STATE:{type:S.STRING,menu:'fullscreenGuiScaling',defaultValue:'off'}}},
    {opcode:'isFullscreenGUIScalingEnabled',blockType:B.BOOLEAN,text:'GUI responsive reflow in fullscreen?'}
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

function _sgEditorWorkspaceVisible() {
  // Blockly/Scratch hosts use slightly different wrappers. Only show the editor launcher
  // while a real blocks workspace is visible; player/fullscreen pages should never show it.
  const candidates = document.querySelectorAll('.blocklySvg, .blocklyWorkspace, .injectionDiv, [class*="blocks_blocks"], [class*="blocks-wrapper"]');
  for (const node of candidates) {
    if (!node || !node.isConnected) continue;
    const style = getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue;
    const r = node.getBoundingClientRect();
    if (r.width > 20 && r.height > 20) return true;
  }
  return false;
}

SuperGUI.prototype._syncEditorLauncherVisibility = function () {
  if (!this._editorLauncher) return;
  const show = _sgEditorWorkspaceVisible() && !document.fullscreenElement;
  this._editorLauncher.style.display = show ? '' : 'none';
};

// Two fullscreen behaviors:
// OFF (default): freeze the normal layout coordinate system, then uniformly magnify
// the entire completed GUI. Nothing inside reflows or changes proportions.
// ON: resize the overlay to the current stage and let percentage layout + pixel styles
// recompute responsively, matching the old behavior.
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

  if (!fullscreenLike) {
    this._preFullscreenStageSize = {width:canvasRect.width, height:canvasRect.height};
  }

  const base = this._preFullscreenStageSize || {width:canvasRect.width, height:canvasRect.height};
  const responsive = !!this._scaleGUIInFullscreen;
  const uniformMode = fullscreenLike && !responsive;

  let width = canvasRect.width;
  let height = canvasRect.height;
  let transformScale = 1;
  let insetX = 0;
  let insetY = 0;

  if (uniformMode) {
    width = base.width;
    height = base.height;
    transformScale = Math.max(0.01, Math.min(canvasRect.width / base.width, canvasRect.height / base.height));
    const renderedWidth = width * transformScale;
    const renderedHeight = height * transformScale;
    insetX = (canvasRect.width - renderedWidth) / 2;
    insetY = (canvasRect.height - renderedHeight) / 2;
  }

  overlay.style.left = (canvasRect.left - hostRect.left + host.scrollLeft + insetX) + 'px';
  overlay.style.top = (canvasRect.top - hostRect.top + host.scrollTop + insetY) + 'px';
  overlay.style.width = width + 'px';
  overlay.style.height = height + 'px';
  overlay.style.transformOrigin = 'top left';
  overlay.style.transform = uniformMode ? `scale(${transformScale})` : 'none';

  // In uniform mode, pixel styling is calculated for the original stage and the browser
  // transform scales it together with geometry. Responsive mode recalculates pixel styling.
  const sx = width / 480;
  const sy = height / 360;
  const nextScale = Math.max(0.1, Math.min(sx, sy));
  this._uiScale = nextScale;

  if (Math.abs(nextScale - (this._lastUIScale || 1)) > 0.01) {
    this._lastUIScale = nextScale;
    if (this.panelDoms && Object.keys(this.panelDoms).length) this._renderAll();
  }

  this._syncEditorLauncherVisibility();
};
