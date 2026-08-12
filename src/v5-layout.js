// SuperGUI v5 layout, responsive, grouping, preset, and component helpers.
// Loaded after super-gui.js so it can extend SuperGUI without bloating the core class.

(function installSuperGUIV5() {
  if (typeof SuperGUI === 'undefined') return;

  const clone = value => JSON.parse(JSON.stringify(value));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, Number(n) || 0));
  const PRESET_PREFIX = 'supergui_v5_preset_';

  function find(instance, id) {
    return instance._findElement ? instance._findElement(id) : null;
  }

  function ensureV5(instance) {
    if (!instance.config.v5Groups || typeof instance.config.v5Groups !== 'object') instance.config.v5Groups = {};
    return instance.config.v5Groups;
  }

  function uniqueId(instance, base) {
    let id = String(base || 'Element');
    let n = 2;
    while (find(instance, id)) id = String(base || 'Element') + n++;
    return id;
  }

  const oldGetInfo = SuperGUI.prototype.getInfo;
  SuperGUI.prototype.getInfo = function () {
    const info = oldGetInfo.call(this);
    const S = Scratch.ArgumentType;
    const B = Scratch.BlockType;
    const str = (menu, def='') => ({ type:S.STRING, menu, defaultValue:def });
    const num = (def=0) => ({ type:S.NUMBER, defaultValue:def });

    info.blocks.push(
      { blockType:B.LABEL, text:'─── V5 Layout / Containers ───' },
      { opcode:'setContainerLayout', blockType:B.COMMAND, text:'set container [E] layout [MODE]', arguments:{ E:str('elements'), MODE:str('v5LayoutModes','vertical') } },
      { opcode:'setContainerGap', blockType:B.COMMAND, text:'set container [E] gap [GAP] px', arguments:{ E:str('elements'), GAP:num(8) } },
      { opcode:'setContainerPadding', blockType:B.COMMAND, text:'set container [E] padding [PAD] px', arguments:{ E:str('elements'), PAD:num(8) } },
      { opcode:'setContainerOverflow', blockType:B.COMMAND, text:'set container [E] overflow [MODE]', arguments:{ E:str('elements'), MODE:str('v5OverflowModes','scroll') } },
      { opcode:'setContainerAlign', blockType:B.COMMAND, text:'set container [E] align [ALIGN]', arguments:{ E:str('elements'), ALIGN:str('v5AlignModes','stretch') } },
      { opcode:'setContainerJustify', blockType:B.COMMAND, text:'set container [E] justify [JUSTIFY]', arguments:{ E:str('elements'), JUSTIFY:str('v5JustifyModes','start') } },
      { opcode:'setContainerWrap', blockType:B.COMMAND, text:'set container [E] wrap [WRAP]', arguments:{ E:str('elements'), WRAP:{type:S.BOOLEAN,defaultValue:false} } },
      { opcode:'setContainerColumns', blockType:B.COMMAND, text:'set container [E] grid columns [COLS]', arguments:{ E:str('elements'), COLS:num(2) } },
      { opcode:'addElementToContainer', blockType:B.COMMAND, text:'add [CHILD] to container [CONTAINER]', arguments:{ CHILD:str('elements'), CONTAINER:str('elements') } },
      { opcode:'removeElementFromContainer', blockType:B.COMMAND, text:'remove [CHILD] from container', arguments:{ CHILD:str('elements') } },
      { opcode:'clearContainer', blockType:B.COMMAND, text:'clear container [E]', arguments:{ E:str('elements') } },
      { opcode:'scrollContainer', blockType:B.COMMAND, text:'scroll container [E] to [WHERE]', arguments:{ E:str('elements'), WHERE:str('v5ScrollTargets','bottom') } },
      { opcode:'scrollContainerBy', blockType:B.COMMAND, text:'scroll container [E] by [PX] px', arguments:{ E:str('elements'), PX:num(50) } },
      { opcode:'getContainerScroll', blockType:B.REPORTER, text:'container [E] scroll position', arguments:{ E:str('elements') } },
      { opcode:'getContainerChildCount', blockType:B.REPORTER, text:'container [E] child count', arguments:{ E:str('elements') } },
      { opcode:'getContainerChildren', blockType:B.REPORTER, text:'container [E] children', arguments:{ E:str('elements') } },

      { blockType:B.LABEL, text:'─── V5 Responsive ───' },
      { opcode:'setElementAnchor', blockType:B.COMMAND, text:'anchor [E] to [ANCHOR]', arguments:{ E:str('elements'), ANCHOR:str('v5Anchors','none') } },
      { opcode:'setElementAutoSize', blockType:B.COMMAND, text:'set [E] auto size [AUTO]', arguments:{ E:str('elements'), AUTO:{type:S.BOOLEAN,defaultValue:true} } },
      { opcode:'setElementTextWrap', blockType:B.COMMAND, text:'set [E] text wrap [WRAP]', arguments:{ E:str('elements'), WRAP:{type:S.BOOLEAN,defaultValue:true} } },

      { blockType:B.LABEL, text:'─── V5 Groups ───' },
      { opcode:'createGroupV5', blockType:B.COMMAND, text:'create group [NAME]', arguments:{ NAME:{type:S.STRING,defaultValue:'Group'} } },
      { opcode:'addElementToGroupV5', blockType:B.COMMAND, text:'add [E] to group [NAME]', arguments:{ E:str('elements'), NAME:{type:S.STRING,defaultValue:'Group'} } },
      { opcode:'removeElementFromGroupV5', blockType:B.COMMAND, text:'remove [E] from group [NAME]', arguments:{ E:str('elements'), NAME:{type:S.STRING,defaultValue:'Group'} } },
      { opcode:'moveGroupV5', blockType:B.COMMAND, text:'move group [NAME] dx:[DX] dy:[DY]', arguments:{ NAME:{type:S.STRING,defaultValue:'Group'}, DX:num(5), DY:num(5) } },
      { opcode:'deleteGroupV5', blockType:B.COMMAND, text:'delete group [NAME]', arguments:{ NAME:{type:S.STRING,defaultValue:'Group'} } },
      { opcode:'getGroupElementsV5', blockType:B.REPORTER, text:'elements in group [NAME]', arguments:{ NAME:{type:S.STRING,defaultValue:'Group'} } },

      { blockType:B.LABEL, text:'─── V5 Presets / Components ───' },
      { opcode:'saveElementPresetV5', blockType:B.COMMAND, text:'save [E] as preset [NAME]', arguments:{ E:str('elements'), NAME:{type:S.STRING,defaultValue:'My Preset'} } },
      { opcode:'createFromPresetV5', blockType:B.COMMAND, text:'create preset [NAME] as [ID] in [P]', arguments:{ NAME:{type:S.STRING,defaultValue:'My Preset'}, ID:{type:S.STRING,defaultValue:'PresetElement'}, P:str('panels') } },
      { opcode:'exportElementV5', blockType:B.REPORTER, text:'export [E] as component JSON', arguments:{ E:str('elements') } },
      { opcode:'importElementV5', blockType:B.COMMAND, text:'import component JSON [JSON] as [ID] in [P]', arguments:{ JSON:{type:S.STRING,defaultValue:'{}'}, ID:{type:S.STRING,defaultValue:'Imported'}, P:str('panels') } }
    );

    info.menus = info.menus || {};
    info.menus.v5LayoutModes = { acceptReporters:true, items:['free','vertical','horizontal','grid'] };
    info.menus.v5OverflowModes = { acceptReporters:true, items:['visible','hidden','scroll','auto'] };
    info.menus.v5AlignModes = { acceptReporters:true, items:['start','center','end','stretch'] };
    info.menus.v5JustifyModes = { acceptReporters:true, items:['start','center','end','space-between','space-around','space-evenly'] };
    info.menus.v5ScrollTargets = { acceptReporters:true, items:['top','bottom','left','right'] };
    info.menus.v5Anchors = { acceptReporters:true, items:['none','top-left','top','top-right','left','center','right','bottom-left','bottom','bottom-right'] };
    return info;
  };

  SuperGUI.prototype._v5RerenderElement = function (id) {
    const f = find(this, id);
    if (f) this._renderPanel(f.panelKey);
  };

  SuperGUI.prototype.setContainerLayout = function (a) { const f=find(this,a.E); if(!f)return; f.el.layoutMode=String(a.MODE||'vertical'); this._renderPanel(f.panelKey); };
  SuperGUI.prototype.setContainerGap = function (a) { const f=find(this,a.E); if(!f)return; f.el.layoutGap=Math.max(0,Number(a.GAP)||0); this._renderPanel(f.panelKey); };
  SuperGUI.prototype.setContainerPadding = function (a) { const f=find(this,a.E); if(!f)return; f.el.layoutPadding=Math.max(0,Number(a.PAD)||0); this._renderPanel(f.panelKey); };
  SuperGUI.prototype.setContainerOverflow = function (a) { const f=find(this,a.E); if(!f)return; f.el.layoutOverflow=String(a.MODE||'scroll'); this._renderPanel(f.panelKey); };
  SuperGUI.prototype.setContainerAlign = function (a) { const f=find(this,a.E); if(!f)return; f.el.layoutAlign=String(a.ALIGN||'stretch'); this._renderPanel(f.panelKey); };
  SuperGUI.prototype.setContainerJustify = function (a) { const f=find(this,a.E); if(!f)return; f.el.layoutJustify=String(a.JUSTIFY||'start'); this._renderPanel(f.panelKey); };
  SuperGUI.prototype.setContainerWrap = function (a) { const f=find(this,a.E); if(!f)return; f.el.layoutWrap=!!a.WRAP; this._renderPanel(f.panelKey); };
  SuperGUI.prototype.setContainerColumns = function (a) { const f=find(this,a.E); if(!f)return; f.el.layoutColumns=Math.max(1,Math.round(Number(a.COLS)||1)); this._renderPanel(f.panelKey); };

  SuperGUI.prototype.addElementToContainer = function (a) {
    const c=find(this,a.CONTAINER), child=find(this,a.CHILD); if(!c||!child||c.el===child.el)return;
    c.el.type='container'; c.el.children=Array.isArray(c.el.children)?c.el.children:[];
    for (const key of this.config.panelOrder) {
      const p=this.config.panels[key];
      for (const id of p.elementOrder) {
        const e=p.elements[id]; if(e&&Array.isArray(e.children)) e.children=e.children.filter(x=>x!==String(a.CHILD));
      }
    }
    if(!c.el.children.includes(String(a.CHILD))) c.el.children.push(String(a.CHILD));
    child.el.parentContainer=String(a.CONTAINER);
    this._renderPanel(c.panelKey);
  };
  SuperGUI.prototype.removeElementFromContainer = function (a) {
    const child=find(this,a.CHILD); if(!child)return;
    for (const key of this.config.panelOrder) {
      const p=this.config.panels[key];
      for (const id of p.elementOrder) { const e=p.elements[id]; if(e&&Array.isArray(e.children)) e.children=e.children.filter(x=>x!==String(a.CHILD)); }
    }
    child.el.parentContainer=''; this._renderPanel(child.panelKey);
  };
  SuperGUI.prototype.clearContainer = function (a) {
    const c=find(this,a.E); if(!c)return; const kids=Array.isArray(c.el.children)?c.el.children.slice():[];
    kids.forEach(id=>{const f=find(this,id);if(f)f.el.parentContainer='';}); c.el.children=[]; this._renderPanel(c.panelKey);
  };
  SuperGUI.prototype.scrollContainer = function (a) {
    const node=this.elementDoms[String(a.E)]; if(!node)return;
    const where=String(a.WHERE||'bottom');
    if(where==='top') node.scrollTop=0; else if(where==='bottom') node.scrollTop=node.scrollHeight;
    else if(where==='left') node.scrollLeft=0; else if(where==='right') node.scrollLeft=node.scrollWidth;
  };
  SuperGUI.prototype.scrollContainerBy = function (a) { const node=this.elementDoms[String(a.E)]; if(node) node.scrollBy({top:Number(a.PX)||0,behavior:'smooth'}); };
  SuperGUI.prototype.getContainerScroll = function (a) { const n=this.elementDoms[String(a.E)]; return n ? n.scrollTop : 0; };
  SuperGUI.prototype.getContainerChildCount = function (a) { const f=find(this,a.E); return f&&Array.isArray(f.el.children)?f.el.children.length:0; };
  SuperGUI.prototype.getContainerChildren = function (a) { const f=find(this,a.E); return JSON.stringify(f&&Array.isArray(f.el.children)?f.el.children:[]); };

  SuperGUI.prototype.setElementAnchor = function (a) {
    const f=find(this,a.E); if(!f)return; const el=f.el; el.anchor=String(a.ANCHOR||'none');
    el.anchorOffsets={left:el.x,top:el.y,right:100-el.x-el.width,bottom:100-el.y-el.height};
    this._renderPanel(f.panelKey);
  };
  SuperGUI.prototype.setElementAutoSize = function (a) { const f=find(this,a.E); if(!f)return; f.el.autoSize=!!a.AUTO; this._renderPanel(f.panelKey); };
  SuperGUI.prototype.setElementTextWrap = function (a) { const f=find(this,a.E); if(!f)return; f.el.wrapText=!!a.WRAP; this._renderPanel(f.panelKey); };

  SuperGUI.prototype.createGroupV5 = function (a) { const g=ensureV5(this); const n=String(a.NAME||'Group'); if(!g[n])g[n]=[]; };
  SuperGUI.prototype.addElementToGroupV5 = function (a) { const g=ensureV5(this),n=String(a.NAME||'Group'),id=String(a.E); if(!g[n])g[n]=[]; if(find(this,id)&&!g[n].includes(id))g[n].push(id); };
  SuperGUI.prototype.removeElementFromGroupV5 = function (a) { const g=ensureV5(this),n=String(a.NAME||'Group'); if(g[n])g[n]=g[n].filter(id=>id!==String(a.E)); };
  SuperGUI.prototype.moveGroupV5 = function (a) { const g=ensureV5(this),ids=g[String(a.NAME||'Group')]||[],dx=Number(a.DX)||0,dy=Number(a.DY)||0,panels=new Set(); ids.forEach(id=>{const f=find(this,id);if(f){f.el.x+=dx;f.el.y+=dy;panels.add(f.panelKey);}}); panels.forEach(k=>this._renderPanel(k)); };
  SuperGUI.prototype.deleteGroupV5 = function (a) { delete ensureV5(this)[String(a.NAME||'Group')]; };
  SuperGUI.prototype.getGroupElementsV5 = function (a) { return JSON.stringify(ensureV5(this)[String(a.NAME||'Group')]||[]); };

  SuperGUI.prototype.saveElementPresetV5 = function (a) { const f=find(this,a.E); if(!f)return; try{localStorage.setItem(PRESET_PREFIX+String(a.NAME||'Preset'),JSON.stringify(f.el));}catch(e){} };
  SuperGUI.prototype.createFromPresetV5 = function (a) {
    let raw; try{raw=localStorage.getItem(PRESET_PREFIX+String(a.NAME||'Preset'));}catch(e){} if(!raw)return;
    let el; try{el=JSON.parse(raw);}catch(e){return;} const panelKey=this._findPanelKey?this._findPanelKey(a.P):null; if(!panelKey)return;
    const panel=this.config.panels[panelKey],id=uniqueId(this,String(a.ID||'PresetElement')); panel.elements[id]=clone(el); panel.elementOrder.push(id); this._renderPanel(panelKey);
  };
  SuperGUI.prototype.exportElementV5 = function (a) { const f=find(this,a.E); return f?JSON.stringify({superguiComponent:1,element:f.el}):'{}'; };
  SuperGUI.prototype.importElementV5 = function (a) {
    let obj; try{obj=JSON.parse(String(a.JSON||'{}'));}catch(e){return;} const src=obj&&obj.element?obj.element:obj; if(!src||typeof src!=='object')return;
    const panelKey=this._findPanelKey?this._findPanelKey(a.P):null; if(!panelKey)return; const panel=this.config.panels[panelKey],id=uniqueId(this,String(a.ID||'Imported'));
    panel.elements[id]=Object.assign(defaultElement(src.type||'label'),clone(src)); panel.elementOrder.push(id); this._renderPanel(panelKey);
  };

  SuperGUI.prototype._v5ApplyAnchors = function (panelKey) {
    const panel=this.config.panels[panelKey]; if(!panel)return;
    for(const id of panel.elementOrder){ const el=panel.elements[id],n=this.elementDoms[id]; if(!el||!n||!el.anchor||el.anchor==='none'||el.parentContainer)continue;
      const o=el.anchorOffsets||{left:el.x,top:el.y,right:100-el.x-el.width,bottom:100-el.y-el.height};
      n.style.left='';n.style.right='';n.style.top='';n.style.bottom='';
      if(el.anchor.includes('right')) n.style.right=o.right+'%'; else if(el.anchor==='top'||el.anchor==='center'||el.anchor==='bottom') n.style.left=((100-el.width)/2)+'%'; else n.style.left=o.left+'%';
      if(el.anchor.includes('bottom')) n.style.bottom=o.bottom+'%'; else if(el.anchor==='left'||el.anchor==='center'||el.anchor==='right') n.style.top=((100-el.height)/2)+'%'; else n.style.top=o.top+'%';
    }
  };

  SuperGUI.prototype._v5ApplyContainers = function (panelKey) {
    const panel=this.config.panels[panelKey]; if(!panel)return;
    const containers=panel.elementOrder.filter(id=>panel.elements[id]&&panel.elements[id].type==='container');
    for(const id of containers){
      const el=panel.elements[id],node=this.elementDoms[id]; if(!node)continue;
      node.innerHTML=''; node.style.boxSizing='border-box'; node.style.padding=Math.max(0,Number(el.layoutPadding)||0)+'px';
      node.style.gap=Math.max(0,Number(el.layoutGap)||0)+'px'; node.style.overflow=el.layoutOverflow||'auto';
      node.style.background=(el.style&&el.style.background)||'transparent';
      node.style.border=((el.style&&el.style.borderWidth)||0)+'px solid '+((el.style&&el.style.borderColor)||'transparent');
      node.style.borderRadius=((el.style&&el.style.borderRadius)||0)+'px';
      const mode=el.layoutMode||'vertical';
      if(mode==='grid'){
        node.style.display='grid'; node.style.gridTemplateColumns='repeat('+Math.max(1,Number(el.layoutColumns)||2)+', minmax(0,1fr))';
        node.style.alignItems=({start:'start',center:'center',end:'end',stretch:'stretch'})[el.layoutAlign]||'stretch';
      }else if(mode==='free'){
        node.style.display='block'; node.style.position='absolute';
      }else{
        node.style.display='flex'; node.style.flexDirection=mode==='horizontal'?'row':'column'; node.style.flexWrap=el.layoutWrap?'wrap':'nowrap';
        node.style.alignItems=({start:'flex-start',center:'center',end:'flex-end',stretch:'stretch'})[el.layoutAlign]||'stretch';
        node.style.justifyContent=({start:'flex-start',center:'center',end:'flex-end','space-between':'space-between','space-around':'space-around','space-evenly':'space-evenly'})[el.layoutJustify]||'flex-start';
      }
      const kids=Array.isArray(el.children)?el.children:[];
      for(const childId of kids){ const child=panel.elements[childId],childNode=this.elementDoms[childId]; if(!child||!childNode||childId===id)continue;
        node.appendChild(childNode); childNode.style.left='';childNode.style.top='';childNode.style.right='';childNode.style.bottom='';
        if(mode==='free') { childNode.style.position='absolute'; childNode.style.left=child.x+'%'; childNode.style.top=child.y+'%'; }
        else { childNode.style.position='relative'; childNode.style.flexShrink='0'; childNode.style.width=(child.autoSize?'auto':child.width+'%'); childNode.style.height=(child.autoSize?'auto':child.height+'%'); if(child.autoSize){childNode.style.minHeight='24px';childNode.style.minWidth='24px';} }
        if(child.wrapText && childNode.firstElementChild){childNode.firstElementChild.style.whiteSpace='normal';childNode.firstElementChild.style.overflowWrap='anywhere';childNode.firstElementChild.style.height=child.autoSize?'auto':'100%';}
      }
    }
  };

  const oldRenderPanel=SuperGUI.prototype._renderPanel;
  SuperGUI.prototype._renderPanel=function(panelKey){
    const result=oldRenderPanel.call(this,panelKey);
    this._v5ApplyAnchors(panelKey); this._v5ApplyContainers(panelKey);
    return result;
  };
})();
