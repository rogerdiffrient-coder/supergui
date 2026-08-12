// SuperGUI v5.1 overhaul layer.
// Keeps the large core class stable while adding higher-level systems.

const V5X_CORE_OPCODES = new Set([
  'setBlockPaletteMode',
  'showPanel','hidePanel','togglePanel','isPanelVisible',
  'createElement','deleteElement','duplicateElement','elementExists',
  'setElementPosition','setElementSize','setElementRotation',
  'setElementVisible','setElementText','getElementText','setElementValue','getElementValue',
  'setElementBackgroundColor','setElementColor','setElementOpacity',
  'whenButtonClicked','whenElementChanged','whenElementHovered',
  'saveGUI','loadGUI','exportGUI','importGUI',
  'setElementArtImage','clearElementArtImage','setElementArtMode','setElementArtFit','setElementArtOpacity',
  'setLeaderboardMode','clearCustomLeaderboard','addCustomLeaderboardRow','setCustomLeaderboardRows',
  'getCustomLeaderboardRows','setLeaderboardTitle','setLeaderboardMaxRows','setLeaderboardRowHeight',
  'setContainerLayout','addElementToContainer','removeElementFromContainer','scrollContainerToBottom'
]);

const originalGetInfoV5x = SuperGUI.prototype.getInfo;
SuperGUI.prototype.getInfo = function () {
  const info = originalGetInfoV5x.call(this);
  const S = Scratch.ArgumentType;
  const B = Scratch.BlockType;
  const str = (menu, value='') => ({ type:S.STRING, menu, defaultValue:value });
  const num = value => ({ type:S.NUMBER, defaultValue:value });

  info.menus = info.menus || {};
  info.menus.paletteModes = { acceptReporters:false, items:['compact','all'] };
  info.menus.artStates = { acceptReporters:false, items:['normal','hover','pressed'] };
  info.menus.artModes = { acceptReporters:false, items:['background','overlay','replace'] };
  info.menus.artFits = { acceptReporters:false, items:['cover','contain','stretch','tile'] };
  info.menus.leaderboardModes = { acceptReporters:false, items:['service','custom'] };

  const v5xBlocks = [
    { blockType:B.LABEL, text:'─── SuperGUI palette ───' },
    { opcode:'setBlockPaletteMode', blockType:B.COMMAND, text:'show [MODE] SuperGUI blocks', arguments:{ MODE:str('paletteModes','compact') } },

    { blockType:B.LABEL, text:'─── Custom art ───' },
    { opcode:'setElementArtImage', blockType:B.COMMAND, text:'set [E] [STATE] art image [URL]', arguments:{ E:str('elements'), STATE:str('artStates','normal'), URL:{ type:S.STRING, defaultValue:'' } } },
    { opcode:'clearElementArtImage', blockType:B.COMMAND, text:'clear [E] [STATE] art image', arguments:{ E:str('elements'), STATE:str('artStates','normal') } },
    { opcode:'setElementArtMode', blockType:B.COMMAND, text:'set [E] art mode [MODE]', arguments:{ E:str('elements'), MODE:str('artModes','overlay') } },
    { opcode:'setElementArtFit', blockType:B.COMMAND, text:'set [E] art fit [FIT]', arguments:{ E:str('elements'), FIT:str('artFits','cover') } },
    { opcode:'setElementArtOpacity', blockType:B.COMMAND, text:'set [E] art opacity [O]', arguments:{ E:str('elements'), O:num(1) } },

    { blockType:B.LABEL, text:'─── Custom leaderboard ───' },
    { opcode:'setLeaderboardMode', blockType:B.COMMAND, text:'set leaderboard [E] mode [MODE]', arguments:{ E:str('elements'), MODE:str('leaderboardModes','custom') } },
    { opcode:'clearCustomLeaderboard', blockType:B.COMMAND, text:'clear custom leaderboard [E]', arguments:{ E:str('elements') } },
    { opcode:'addCustomLeaderboardRow', blockType:B.COMMAND, text:'add row to [E] player [P] score [SCORE] extra [EXTRA] image [URL]', arguments:{ E:str('elements'), P:{type:S.STRING,defaultValue:'Player'}, SCORE:num(0), EXTRA:{type:S.STRING,defaultValue:''}, URL:{type:S.STRING,defaultValue:''} } },
    { opcode:'setCustomLeaderboardRows', blockType:B.COMMAND, text:'set [E] custom rows JSON [JSON]', arguments:{ E:str('elements'), JSON:{type:S.STRING,defaultValue:'[]'} } },
    { opcode:'getCustomLeaderboardRows', blockType:B.REPORTER, text:'[E] custom rows JSON', arguments:{ E:str('elements') } },
    { opcode:'setLeaderboardTitle', blockType:B.COMMAND, text:'set leaderboard [E] title [T]', arguments:{ E:str('elements'), T:{type:S.STRING,defaultValue:'Leaderboard'} } },
    { opcode:'setLeaderboardMaxRows', blockType:B.COMMAND, text:'set leaderboard [E] max rows [N]', arguments:{ E:str('elements'), N:num(10) } },
    { opcode:'setLeaderboardRowHeight', blockType:B.COMMAND, text:'set leaderboard [E] row height [N] px', arguments:{ E:str('elements'), N:num(30) } }
  ];

  info.blocks = v5xBlocks.concat(info.blocks || []).filter(block => block.opcode !== 'openEditor');

  if (this._compactPalette === undefined) this._compactPalette = true;
  if (this._compactPalette) {
    let keepNextLabel = false;
    info.blocks = info.blocks.filter(block => {
      if (block.opcode) return V5X_CORE_OPCODES.has(block.opcode);
      if (block.blockType === B.LABEL) {
        const text = String(block.text || '');
        keepNextLabel = /palette|custom art|custom leaderboard/i.test(text);
        return keepNextLabel;
      }
      return false;
    });
  }
  return info;
};

SuperGUI.prototype._refreshV5xBlocks = function () {
  try {
    const manager = (Scratch.vm && Scratch.vm.extensionManager) ||
      (this.runtime && this.runtime.extensionManager) ||
      (globalThis.vm && globalThis.vm.extensionManager);
    if (manager && typeof manager.refreshBlocks === 'function') manager.refreshBlocks();
    else if (this.runtime && typeof this.runtime.emit === 'function') this.runtime.emit('EXTENSION_ADDED');
  } catch (e) {}
};

SuperGUI.prototype.setBlockPaletteMode = function (a) {
  this._compactPalette = String(a.MODE || 'compact').toLowerCase() !== 'all';
  this._refreshV5xBlocks();
};

SuperGUI.prototype._v5xArt = function (el) {
  if (!el.customArt || typeof el.customArt !== 'object') {
    el.customArt = { normal:'', hover:'', pressed:'', mode:'overlay', fit:'cover', opacity:1 };
  }
  return el.customArt;
};

SuperGUI.prototype.setElementArtImage = function (a) {
  const f = this._findElement(a.E); if (!f) return;
  const art = this._v5xArt(f.el);
  const state = ['normal','hover','pressed'].includes(a.STATE) ? a.STATE : 'normal';
  art[state] = String(a.URL || '');
  this._renderPanel(f.panelKey);
};
SuperGUI.prototype.clearElementArtImage = function (a) {
  const f = this._findElement(a.E); if (!f) return;
  const art = this._v5xArt(f.el);
  const state = ['normal','hover','pressed'].includes(a.STATE) ? a.STATE : 'normal';
  art[state] = '';
  this._renderPanel(f.panelKey);
};
SuperGUI.prototype.setElementArtMode = function (a) {
  const f = this._findElement(a.E); if (!f) return;
  const art = this._v5xArt(f.el);
  art.mode = ['background','overlay','replace'].includes(a.MODE) ? a.MODE : 'overlay';
  this._renderPanel(f.panelKey);
};
SuperGUI.prototype.setElementArtFit = function (a) {
  const f = this._findElement(a.E); if (!f) return;
  const art = this._v5xArt(f.el);
  art.fit = ['cover','contain','stretch','tile'].includes(a.FIT) ? a.FIT : 'cover';
  this._renderPanel(f.panelKey);
};
SuperGUI.prototype.setElementArtOpacity = function (a) {
  const f = this._findElement(a.E); if (!f) return;
  this._v5xArt(f.el).opacity = Math.max(0, Math.min(1, Number(a.O)));
  this._renderPanel(f.panelKey);
};

function v5xBackgroundCss(art, url) {
  const fit = art.fit || 'cover';
  if (fit === 'stretch') return `url("${url}") center/100% 100% no-repeat`;
  if (fit === 'tile') return `url("${url}") 0 0/auto repeat`;
  return `url("${url}") center/${fit} no-repeat`;
}

const originalCreateElementDomV5x = SuperGUI.prototype._createElementDom;
SuperGUI.prototype._createElementDom = function (panelKey, elId, el) {
  const wrap = originalCreateElementDomV5x.call(this, panelKey, elId, el);
  if (!wrap) return wrap;

  const art = el.customArt;
  if (art && (art.normal || art.hover || art.pressed)) {
    const layer = document.createElement('div');
    layer.className = 'supergui-custom-art';
    layer.style.cssText = [
      'position:absolute','inset:0','pointer-events:none',
      'border-radius:inherit','opacity:' + Math.max(0,Math.min(1,Number(art.opacity ?? 1))),
      'z-index:' + (art.mode === 'background' ? '0' : '50')
    ].join(';');

    const setState = state => {
      const url = art[state] || art.normal || '';
      layer.style.background = url ? v5xBackgroundCss(art, url) : 'none';
    };
    setState('normal');

    if (art.mode === 'replace') {
      Array.from(wrap.children).forEach(child => {
        child.style.opacity = '0';
      });
      layer.style.zIndex = '50';
    } else if (art.mode === 'background') {
      Array.from(wrap.children).forEach(child => {
        if (child.style) child.style.position = child.style.position || 'relative';
      });
    }

    wrap.insertBefore(layer, wrap.firstChild);
    wrap.addEventListener('mouseenter', () => setState('hover'));
    wrap.addEventListener('mouseleave', () => setState('normal'));
    wrap.addEventListener('mousedown', () => setState('pressed'));
    wrap.addEventListener('mouseup', () => setState('hover'));
  }

  if (el.type === 'leaderboard' && el.leaderboardMode === 'custom') {
    const card = wrap.querySelector('div');
    if (card) {
      card.innerHTML = '';
      card.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;background:' +
        ((el.style && el.style.background) || '#232735') + ';color:' + ((el.style && el.style.color) || '#fff') +
        ';border-radius:' + (((el.style && el.style.borderRadius) || 6)) + 'px;overflow:hidden;box-sizing:border-box;';

      const header = document.createElement('div');
      header.textContent = el.title || 'Leaderboard';
      header.style.cssText = 'padding:7px 9px;background:' + (el.accent || '#5B6EE1') + ';color:#fff;font-weight:800;font-size:12px;';
      card.appendChild(header);

      const body = document.createElement('div');
      body.style.cssText = 'flex:1;overflow:auto;padding:4px;';
      const rows = Array.isArray(el.customRows) ? el.customRows : [];
      const limit = Math.max(1, Number(el.maxCustomRows || el.maxVisible || 10));
      rows.slice(0, limit).forEach((entry, index) => {
        const row = document.createElement('div');
        row.style.cssText = 'min-height:' + Math.max(20,Number(el.customRowHeight || 30)) + 'px;display:grid;grid-template-columns:26px 32px minmax(0,1fr) auto;gap:6px;align-items:center;padding:4px 6px;margin-bottom:3px;border-radius:5px;background:' + (entry.background || 'rgba(255,255,255,.045)') + ';font-size:11px;';

        const rank = document.createElement('span');
        rank.textContent = entry.rankText || String(index + 1);
        rank.style.cssText = 'font-weight:800;text-align:center;color:' + (entry.rankColor || el.accent || '#5B6EE1') + ';';

        const img = document.createElement('div');
        img.style.cssText = 'width:28px;height:28px;background-size:contain;background-position:center;background-repeat:no-repeat;border-radius:4px;';
        if (entry.image) img.style.backgroundImage = `url("${entry.image}")`;
        else img.textContent = entry.icon || '';

        const text = document.createElement('div');
        text.style.cssText = 'min-width:0;';
        const player = document.createElement('div');
        player.textContent = entry.player || 'Player';
        player.style.cssText = 'font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:' + (entry.color || 'inherit') + ';';
        text.appendChild(player);
        if (entry.extra) {
          const extra = document.createElement('div');
          extra.textContent = entry.extra;
          extra.style.cssText = 'font-size:10px;opacity:.65;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
          text.appendChild(extra);
        }

        const score = document.createElement('span');
        score.textContent = String(entry.score ?? 0);
        score.style.fontWeight = '800';
        row.appendChild(rank); row.appendChild(img); row.appendChild(text); row.appendChild(score);
        body.appendChild(row);
      });
      if (!rows.length) {
        const empty = document.createElement('div');
        empty.textContent = 'No rows yet';
        empty.style.cssText = 'padding:12px;text-align:center;opacity:.55;font-size:11px;';
        body.appendChild(empty);
      }
      card.appendChild(body);
    }
  }

  return wrap;
};

SuperGUI.prototype.setLeaderboardMode = function (a) {
  const f = this._findElement(a.E); if (!f || f.el.type !== 'leaderboard') return;
  f.el.leaderboardMode = String(a.MODE) === 'custom' ? 'custom' : 'service';
  if (!Array.isArray(f.el.customRows)) f.el.customRows = [];
  this._renderPanel(f.panelKey);
};
SuperGUI.prototype.clearCustomLeaderboard = function (a) {
  const f = this._findElement(a.E); if (!f || f.el.type !== 'leaderboard') return;
  f.el.customRows = [];
  f.el.leaderboardMode = 'custom';
  this._renderPanel(f.panelKey);
};
SuperGUI.prototype.addCustomLeaderboardRow = function (a) {
  const f = this._findElement(a.E); if (!f || f.el.type !== 'leaderboard') return;
  if (!Array.isArray(f.el.customRows)) f.el.customRows = [];
  f.el.leaderboardMode = 'custom';
  f.el.customRows.push({ player:String(a.P || 'Player'), score:Number(a.SCORE) || 0, extra:String(a.EXTRA || ''), image:String(a.URL || '') });
  this._renderPanel(f.panelKey);
};
SuperGUI.prototype.setCustomLeaderboardRows = function (a) {
  const f = this._findElement(a.E); if (!f || f.el.type !== 'leaderboard') return;
  try {
    const rows = JSON.parse(String(a.JSON || '[]'));
    if (!Array.isArray(rows)) return;
    f.el.customRows = rows;
    f.el.leaderboardMode = 'custom';
    this._renderPanel(f.panelKey);
  } catch (e) {}
};
SuperGUI.prototype.getCustomLeaderboardRows = function (a) {
  const f = this._findElement(a.E);
  return f && f.el.type === 'leaderboard' ? JSON.stringify(f.el.customRows || []) : '[]';
};
SuperGUI.prototype.setLeaderboardTitle = function (a) {
  const f = this._findElement(a.E); if (!f || f.el.type !== 'leaderboard') return;
  f.el.title = String(a.T || ''); this._renderPanel(f.panelKey);
};
SuperGUI.prototype.setLeaderboardMaxRows = function (a) {
  const f = this._findElement(a.E); if (!f || f.el.type !== 'leaderboard') return;
  f.el.maxCustomRows = Math.max(1, Math.floor(Number(a.N) || 1)); this._renderPanel(f.panelKey);
};
SuperGUI.prototype.setLeaderboardRowHeight = function (a) {
  const f = this._findElement(a.E); if (!f || f.el.type !== 'leaderboard') return;
  f.el.customRowHeight = Math.max(20, Number(a.N) || 30); this._renderPanel(f.panelKey);
};
