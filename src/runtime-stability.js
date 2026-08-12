// SuperGUI runtime stability layer.
// Fixes stage-relative layering, responsive UI scaling, and text alignment.

const _sgOriginalBuildOverlay = SuperGUI.prototype._buildOverlay;
const _sgOriginalSyncOverlayPosition = SuperGUI.prototype._syncOverlayPosition;
const _sgOriginalCreateElementDom = SuperGUI.prototype._createElementDom;

SuperGUI.prototype._buildOverlay = function () {
  const canvas = this.runtime && this.runtime.renderer && this.runtime.renderer.canvas;
  if (!canvas || !canvas.parentElement) return _sgOriginalBuildOverlay.call(this);

  const host = canvas.parentElement;
  const hostStyle = getComputedStyle(host);
  if (hostStyle.position === 'static') host.style.position = 'relative';

  const overlay = document.createElement('div');
  overlay.id = 'supergui-overlay';
  overlay.style.cssText = [
    'position:absolute',
    'pointer-events:none',
    'overflow:hidden',
    'z-index:2',
    'transform-origin:top left',
    'box-sizing:border-box'
  ].join(';');
  host.appendChild(overlay);
  this.overlay = overlay;
  this._overlayHost = host;
  this._uiScale = 1;
  this._lastUIScale = 1;
};

SuperGUI.prototype._syncOverlayPosition = function () {
  const canvas = this.runtime && this.runtime.renderer && this.runtime.renderer.canvas;
  const overlay = this.overlay;
  if (!canvas || !overlay) return;

  const host = this._overlayHost || overlay.parentElement || document.body;
  const canvasRect = canvas.getBoundingClientRect();
  const hostRect = host.getBoundingClientRect();

  overlay.style.left = (canvasRect.left - hostRect.left + host.scrollLeft) + 'px';
  overlay.style.top = (canvasRect.top - hostRect.top + host.scrollTop) + 'px';
  overlay.style.width = canvasRect.width + 'px';
  overlay.style.height = canvasRect.height + 'px';

  // Scratch/PenguinMod's logical stage is 480x360. Geometry is percentage based,
  // but typography/padding/borders are pixel based, so scale those with the stage.
  const sx = canvasRect.width / 480;
  const sy = canvasRect.height / 360;
  const nextScale = Math.max(0.1, Math.min(sx, sy));
  this._uiScale = nextScale;

  if (Math.abs(nextScale - (this._lastUIScale || 1)) > 0.01) {
    this._lastUIScale = nextScale;
    // Re-render only when the actual stage scale changed, not every sync tick.
    if (this.panelDoms && Object.keys(this.panelDoms).length) this._renderAll();
  }
};

function _sgScalePx(value, scale) {
  const n = Number(value);
  return Number.isFinite(n) ? n * scale : value;
}

function _sgScaleInlinePixels(root, scale) {
  if (!root || !Number.isFinite(scale) || Math.abs(scale - 1) < 0.01) return;
  const props = [
    'fontSize','borderRadius','borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth',
    'paddingTop','paddingRight','paddingBottom','paddingLeft','gap','rowGap','columnGap',
    'outlineWidth','letterSpacing'
  ];
  const nodes = [root].concat(Array.from(root.querySelectorAll ? root.querySelectorAll('*') : []));
  for (const node of nodes) {
    if (!node.style) continue;
    for (const prop of props) {
      const raw = node.style[prop];
      if (!raw || !raw.endsWith || !raw.endsWith('px')) continue;
      const n = parseFloat(raw);
      if (Number.isFinite(n)) node.style[prop] = (n * scale) + 'px';
    }
  }
}

function _sgApplyTextAlignment(wrap, el) {
  if (!wrap || !el || !el.style) return;
  const align = String(el.style.textAlign || 'left').toLowerCase();
  const justify = align === 'center' ? 'center' : (align === 'right' ? 'flex-end' : 'flex-start');

  // Keep CSS text alignment for normal block/button content.
  const nodes = [wrap].concat(Array.from(wrap.querySelectorAll ? wrap.querySelectorAll('*') : []));
  for (const node of nodes) {
    if (!node.style) continue;
    if (node.style.textAlign) node.style.textAlign = align;
  }

  // Labels are rendered as flexboxes; text-align alone does nothing there.
  if (el.type === 'label') {
    const label = wrap.firstElementChild;
    if (label) {
      label.style.textAlign = align;
      label.style.justifyContent = justify;
    }
  }
}

SuperGUI.prototype._createElementDom = function (panelKey, elId, el) {
  const wrap = _sgOriginalCreateElementDom.call(this, panelKey, elId, el);
  if (!wrap) return wrap;

  _sgApplyTextAlignment(wrap, el);
  _sgScaleInlinePixels(wrap, this._uiScale || 1);
  return wrap;
};

// Keep the overlay attached to the stage if the host replaces/reparents its canvas
// during fullscreen/player-mode transitions.
SuperGUI.prototype._ensureOverlayHost = function () {
  const canvas = this.runtime && this.runtime.renderer && this.runtime.renderer.canvas;
  if (!canvas || !this.overlay || !canvas.parentElement) return;
  if (this.overlay.parentElement !== canvas.parentElement) {
    const host = canvas.parentElement;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.appendChild(this.overlay);
    this._overlayHost = host;
  }
};

const _sgStableSync = SuperGUI.prototype._syncOverlayPosition;
SuperGUI.prototype._syncOverlayPosition = function () {
  this._ensureOverlayHost();
  return _sgStableSync.call(this);
};
