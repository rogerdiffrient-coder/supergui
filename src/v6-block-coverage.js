// SuperGUI 6.0.5 block-coverage layer.
// Exposes editor-visible styling/runtime features that previously had weak or no block coverage.

const _sgCoverageOriginalGetInfo = SuperGUI.prototype.getInfo;
SuperGUI.prototype.getInfo = function () {
  const info = _sgCoverageOriginalGetInfo.call(this);
  const B = Scratch.BlockType, S = Scratch.ArgumentType;
  const str = (menu, value='') => ({type:S.STRING, ...(menu?{menu}:{}), defaultValue:value});
  const num = value => ({type:S.NUMBER, defaultValue:value});
  info.menus = info.menus || {};
  info.menus.sgTextAlign = {acceptReporters:false, items:['left','center','right']};
  info.menus.sgFontWeight = {acceptReporters:false, items:['normal','bold','100','200','300','400','500','600','700','800','900']};

  const blocks = [
    {blockType:B.LABEL,text:'─── Element: editor styling ───'},
    {opcode:'setElementTextAlignV605',blockType:B.COMMAND,text:'set [E] text align [ALIGN]',arguments:{E:str('elements'),ALIGN:str('sgTextAlign','left')}},
    {opcode:'setElementFontWeightV605',blockType:B.COMMAND,text:'set [E] font weight [WEIGHT]',arguments:{E:str('elements'),WEIGHT:str('sgFontWeight','normal')}},
    {opcode:'setElementBorderWidthV605',blockType:B.COMMAND,text:'set [E] border width [N] px',arguments:{E:str('elements'),N:num(1)}},
    {opcode:'setElementBorderRadiusV605',blockType:B.COMMAND,text:'set [E] border radius [N] px',arguments:{E:str('elements'),N:num(6)}},
    {opcode:'setElementPaddingV605',blockType:B.COMMAND,text:'set [E] padding [N] px',arguments:{E:str('elements'),N:num(4)}},
    {opcode:'setElementStylePropertyV605',blockType:B.COMMAND,text:'set [E] style property [KEY] to [VALUE]',arguments:{E:str('elements'),KEY:str(null,'fontSize'),VALUE:str(null,'14')}},
    {opcode:'getElementStylePropertyV605',blockType:B.REPORTER,text:'style property [KEY] of [E]',arguments:{KEY:str(null,'fontSize'),E:str('elements')}},

    {blockType:B.LABEL,text:'─── Panel: editor styling ───'},
    {opcode:'setPanelBorderColorV605',blockType:B.COMMAND,text:'set panel [P] border color [C]',arguments:{P:str('panels'),C:{type:S.COLOR}}},
    {opcode:'setPanelBorderWidthV605',blockType:B.COMMAND,text:'set panel [P] border width [N] px',arguments:{P:str('panels'),N:num(2)}},
    {opcode:'setPanelBorderRadiusV605',blockType:B.COMMAND,text:'set panel [P] border radius [N] px',arguments:{P:str('panels'),N:num(10)}},
    {opcode:'setPanelPaddingV605',blockType:B.COMMAND,text:'set panel [P] padding [N] px',arguments:{P:str('panels'),N:num(10)}},
    {opcode:'setPanelStylePropertyV605',blockType:B.COMMAND,text:'set panel [P] style property [KEY] to [VALUE]',arguments:{P:str('panels'),KEY:str(null,'borderRadius'),VALUE:str(null,'10')}},
    {opcode:'getPanelStylePropertyV605',blockType:B.REPORTER,text:'panel [P] style property [KEY]',arguments:{P:str('panels'),KEY:str(null,'borderRadius')}},
    {opcode:'resetAdvancedPanelStyleV605',blockType:B.COMMAND,text:'reset advanced styling on panel [P]',arguments:{P:str('panels')}},

    {blockType:B.LABEL,text:'─── v6: coverage / inspection ───'},
    {opcode:'isPanelDragZoneV605',blockType:B.BOOLEAN,text:'is [E] a drag zone for panel [P]?',arguments:{E:str('elements'),P:str('panels')}},
    {opcode:'getV6TypeV605',blockType:B.REPORTER,text:'v6 type of [E]',arguments:{E:str('elements')}},
    {opcode:'isV6ItemV605',blockType:B.BOOLEAN,text:'[E] is a v6 item?',arguments:{E:str('elements')}},
    {opcode:'getV6TemplateNamesV605',blockType:B.REPORTER,text:'v6 template names JSON'},
    {opcode:'clearSuperGUIClipboardV605',blockType:B.COMMAND,text:'clear SuperGUI clipboard'},

    {blockType:B.LABEL,text:'─── v6: terminal state ───'},
    {opcode:'clearTerminalHistoryV605',blockType:B.COMMAND,text:'clear terminal [E] command history',arguments:{E:str('elements')}},
    {opcode:'getTerminalPromptV605',blockType:B.REPORTER,text:'terminal [E] prompt',arguments:{E:str('elements')}},
    {opcode:'terminalInputEnabledV605',blockType:B.BOOLEAN,text:'terminal [E] input enabled?',arguments:{E:str('elements')}},
    {opcode:'terminalEchoEnabledV605',blockType:B.BOOLEAN,text:'terminal [E] echoes commands?',arguments:{E:str('elements')}}
  ];

  info.blocks = blocks.concat(info.blocks || []);
  return info;
};

function _sgCoverageElement(ext,id){ return ext._findElement(String(id||'')); }
function _sgCoveragePanel(ext,name){ const k=ext._findPanelKeyByName(String(name||'')); return k?{k,p:ext.config.panels[k]}:null; }
function _sgCoverageRenderElement(ext,f){ if(f) ext._renderPanel(f.panelKey); }
function _sgCoverageCoerce(v){
  const s=String(v??'');
  if(s==='true') return true; if(s==='false') return false; if(s==='null') return null;
  if(s!=='' && Number.isFinite(Number(s))) return Number(s);
  return s;
}

SuperGUI.prototype.setElementTextAlignV605=function(a){const f=_sgCoverageElement(this,a.E);if(!f)return;f.el.style=f.el.style||{};f.el.style.textAlign=['left','center','right'].includes(String(a.ALIGN))?String(a.ALIGN):'left';_sgCoverageRenderElement(this,f);};
SuperGUI.prototype.setElementFontWeightV605=function(a){const f=_sgCoverageElement(this,a.E);if(!f)return;f.el.style=f.el.style||{};f.el.style.fontWeight=String(a.WEIGHT||'normal');_sgCoverageRenderElement(this,f);};
SuperGUI.prototype.setElementBorderWidthV605=function(a){const f=_sgCoverageElement(this,a.E);if(!f)return;f.el.style=f.el.style||{};f.el.style.borderWidth=Math.max(0,Number(a.N)||0);_sgCoverageRenderElement(this,f);};
SuperGUI.prototype.setElementBorderRadiusV605=function(a){const f=_sgCoverageElement(this,a.E);if(!f)return;f.el.style=f.el.style||{};f.el.style.borderRadius=Math.max(0,Number(a.N)||0);_sgCoverageRenderElement(this,f);};
SuperGUI.prototype.setElementPaddingV605=function(a){const f=_sgCoverageElement(this,a.E);if(!f)return;f.el.style=f.el.style||{};f.el.style.padding=Math.max(0,Number(a.N)||0);_sgCoverageRenderElement(this,f);};
SuperGUI.prototype.setElementStylePropertyV605=function(a){const f=_sgCoverageElement(this,a.E);if(!f)return;f.el.style=f.el.style||{};f.el.style[String(a.KEY||'')]=_sgCoverageCoerce(a.VALUE);_sgCoverageRenderElement(this,f);};
SuperGUI.prototype.getElementStylePropertyV605=function(a){const f=_sgCoverageElement(this,a.E);if(!f||!f.el.style)return'';const v=f.el.style[String(a.KEY||'')];return typeof v==='object'?JSON.stringify(v):(v??'');};

SuperGUI.prototype.setPanelBorderColorV605=function(a){const f=_sgCoveragePanel(this,a.P);if(!f)return;f.p.style=f.p.style||{};f.p.style.borderColor=String(a.C||'#4a4f5e');this._renderPanel(f.k);};
SuperGUI.prototype.setPanelBorderWidthV605=function(a){const f=_sgCoveragePanel(this,a.P);if(!f)return;f.p.style=f.p.style||{};f.p.style.borderWidth=Math.max(0,Number(a.N)||0);this._renderPanel(f.k);};
SuperGUI.prototype.setPanelBorderRadiusV605=function(a){const f=_sgCoveragePanel(this,a.P);if(!f)return;f.p.style=f.p.style||{};f.p.style.borderRadius=Math.max(0,Number(a.N)||0);this._renderPanel(f.k);};
SuperGUI.prototype.setPanelPaddingV605=function(a){const f=_sgCoveragePanel(this,a.P);if(!f)return;f.p.style=f.p.style||{};f.p.style.padding=Math.max(0,Number(a.N)||0);this._renderPanel(f.k);};
SuperGUI.prototype.setPanelStylePropertyV605=function(a){const f=_sgCoveragePanel(this,a.P);if(!f)return;f.p.style=f.p.style||{};f.p.style[String(a.KEY||'')]=_sgCoverageCoerce(a.VALUE);this._renderPanel(f.k);};
SuperGUI.prototype.getPanelStylePropertyV605=function(a){const f=_sgCoveragePanel(this,a.P);if(!f||!f.p.style)return'';const v=f.p.style[String(a.KEY||'')];return typeof v==='object'?JSON.stringify(v):(v??'');};
SuperGUI.prototype.resetAdvancedPanelStyleV605=function(a){const f=_sgCoveragePanel(this,a.P);if(!f)return;f.p.v6Style={};this._renderPanel(f.k);};

SuperGUI.prototype.isPanelDragZoneV605=function(a){const f=_sgCoveragePanel(this,a.P);return !!(f&&Array.isArray(f.p.dragZones)&&f.p.dragZones.includes(String(a.E||'')));};
SuperGUI.prototype.getV6TypeV605=function(a){const f=_sgCoverageElement(this,a.E);return f&&Array.isArray(V6_ITEM_TYPES)&&V6_ITEM_TYPES.includes(f.el.type)?String(f.el.type):'';};
SuperGUI.prototype.isV6ItemV605=function(a){const f=_sgCoverageElement(this,a.E);return !!(f&&Array.isArray(V6_ITEM_TYPES)&&V6_ITEM_TYPES.includes(f.el.type));};
SuperGUI.prototype.getV6TemplateNamesV605=function(){return JSON.stringify(typeof V6_TEMPLATE_NAMES!=='undefined'?V6_TEMPLATE_NAMES:[]);};
SuperGUI.prototype.clearSuperGUIClipboardV605=function(){this._v6Clipboard=null;};

SuperGUI.prototype.clearTerminalHistoryV605=function(a){const f=_sgCoverageElement(this,a.E);if(!f||f.el.type!=='terminal')return;f.el.commandHistory=[];};
SuperGUI.prototype.getTerminalPromptV605=function(a){const f=_sgCoverageElement(this,a.E);return f&&f.el.type==='terminal'?String(f.el.terminalPrompt??'$'):'';};
SuperGUI.prototype.terminalInputEnabledV605=function(a){const f=_sgCoverageElement(this,a.E);return !!(f&&f.el.type==='terminal'&&f.el.terminalInputEnabled!==false);};
SuperGUI.prototype.terminalEchoEnabledV605=function(a){const f=_sgCoverageElement(this,a.E);return !!(f&&f.el.type==='terminal'&&f.el.terminalEcho!==false);};
