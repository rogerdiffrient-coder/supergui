// SuperGUI v6 hardening and regression fixes.

const v6FixOriginalDeleteElement = SuperGUI.prototype.deleteElement;
SuperGUI.prototype.deleteElement = function (a) {
  const id = String(a.E || '');
  for (const key of this.config.panelOrder) {
    const panel = this.config.panels[key];
    if (panel && Array.isArray(panel.dragZones)) panel.dragZones = panel.dragZones.filter(x => x !== id);
  }
  return v6FixOriginalDeleteElement.call(this, a);
};

const v6FixOriginalReplaceConfig = SuperGUI.prototype._replaceConfig;
SuperGUI.prototype._replaceConfig = function (config) {
  const out = v6FixOriginalReplaceConfig.call(this, config);
  for (const key of this.config.panelOrder) {
    const panel = this.config.panels[key];
    if (!panel) continue;
    panel.dragZones = Array.isArray(panel.dragZones) ? panel.dragZones.filter(id => !!panel.elements[id]) : [];
  }
  return out;
};

SuperGUI.prototype._v6UniquePanelName = function (base) {
  base = String(base || 'Panel');
  const used = new Set(this.config.panelOrder.map(k => this.config.panels[k] && this.config.panels[k].name).filter(Boolean));
  if (!used.has(base)) return base;
  let i = 2;
  while (used.has(base + ' ' + i)) i++;
  return base + ' ' + i;
};

const v6FixCreateTemplate = SuperGUI.prototype.createFromTemplate;
SuperGUI.prototype.createFromTemplate = function (a) {
  a = Object.assign({}, a, { NAME: this._v6UniquePanelName(a.NAME || a.TEMPLATE || 'Panel') });
  return v6FixCreateTemplate.call(this, a);
};

const v6FixPastePanel = SuperGUI.prototype.pastePanelV6;
SuperGUI.prototype.pastePanelV6 = function (a) {
  a = Object.assign({}, a, { NAME: this._v6UniquePanelName(a.NAME || 'Pasted Panel') });
  return v6FixPastePanel.call(this, a);
};

const v6FixCreateElementDom = SuperGUI.prototype._createElementDom;
SuperGUI.prototype._createElementDom = function (panelKey, elId, el) {
  if (el && el.type === 'iframe') {
    const raw = String(el.value || (el.v6Data && el.v6Data.url) || 'about:blank').trim();
    if (!/^(https?:|about:blank$)/i.test(raw)) {
      el.value = 'about:blank';
      el.v6Data = Object.assign({}, el.v6Data, { url: 'about:blank', blockedUrl: raw });
    }
  }
  return v6FixCreateElementDom.call(this, panelKey, elId, el);
};

// Keep panel windows reachable after drag, resize, import, or old saves.
SuperGUI.prototype._v6ClampPanel = function (panel) {
  if (!panel) return;
  panel.width = Math.max(2, Math.min(100, Number(panel.width) || 2));
  panel.height = Math.max(2, Math.min(100, Number(panel.height) || 2));
  panel.x = Math.max(-panel.width + 6, Math.min(94, Number(panel.x) || 0));
  panel.y = Math.max(0, Math.min(94, Number(panel.y) || 0));
};

const v6FixRenderPanel = SuperGUI.prototype._renderPanel;
SuperGUI.prototype._renderPanel = function (key) {
  this._v6ClampPanel(this.config.panels[key]);
  return v6FixRenderPanel.call(this, key);
};
