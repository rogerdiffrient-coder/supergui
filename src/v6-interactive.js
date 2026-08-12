// SuperGUI v6.0.2 interactive controls and terminal support.

const v602OriginalGetInfo = SuperGUI.prototype.getInfo;
SuperGUI.prototype.getInfo = function () {
  const info = v602OriginalGetInfo.call(this);
  const B = Scratch.BlockType, S = Scratch.ArgumentType;
  const str = (menu, value='') => ({ type:S.STRING, ...(menu ? {menu} : {}), defaultValue:value });
  const bool = value => ({ type:S.BOOLEAN, defaultValue:value });
  const blocks = [
    {blockType:B.LABEL,text:'─── v6: Interactive controls ───'},
    {opcode:'whenV6ItemActivated',blockType:B.HAT,text:'when v6 item [E] activated',arguments:{E:str('elements')}},
    {opcode:'getV6ActivatedItem',blockType:B.REPORTER,text:'last activated item of [E]',arguments:{E:str('elements')}},
    {opcode:'whenV6FileSelected',blockType:B.HAT,text:'when file selected in [E]',arguments:{E:str('elements')}},
    {opcode:'getV6SelectedFileName',blockType:B.REPORTER,text:'selected file name of [E]',arguments:{E:str('elements')}},

    {blockType:B.LABEL,text:'─── v6: Terminal ───'},
    {opcode:'whenTerminalCommandV6',blockType:B.HAT,text:'when terminal [E] command entered',arguments:{E:str('elements')}},
    {opcode:'getLastTerminalCommandV6',blockType:B.REPORTER,text:'last command from terminal [E]',arguments:{E:str('elements')}},
    {opcode:'setTerminalPromptV6',blockType:B.COMMAND,text:'set terminal [E] prompt [PROMPT]',arguments:{E:str('elements'),PROMPT:{type:S.STRING,defaultValue:'$'}}},
    {opcode:'setTerminalInputEnabledV6',blockType:B.COMMAND,text:'set terminal [E] input enabled [ENABLED]',arguments:{E:str('elements'),ENABLED:bool(true)}},
    {opcode:'setTerminalEchoV6',blockType:B.COMMAND,text:'set terminal [E] echo commands [ENABLED]',arguments:{E:str('elements'),ENABLED:bool(true)}},
    {opcode:'focusTerminalV6',blockType:B.COMMAND,text:'focus terminal [E]',arguments:{E:str('elements')}},
    {opcode:'getTerminalHistoryV6',blockType:B.REPORTER,text:'terminal [E] command history JSON',arguments:{E:str('elements')}}
  ];
  info.blocks = blocks.concat(info.blocks || []);
  return info;
};

SuperGUI.prototype.whenV6ItemActivated = function(){ return false; };
SuperGUI.prototype.whenV6FileSelected = function(){ return false; };
SuperGUI.prototype.whenTerminalCommandV6 = function(){ return false; };

function v602Find(ext,id){ return ext._findElement(String(id || '')); }
function v602FireChanged(ext,id){ try { ext.runtime.startHats(EXT_ID + '_whenElementChanged', {E:id}); } catch(e){} }
function v602FireActivated(ext,id,item){
  const f=v602Find(ext,id); if(!f)return;
  f.el.lastActivatedItem=item;
  try { ext.runtime.startHats(EXT_ID + '_whenV6ItemActivated', {E:id}); } catch(e){}
  v602FireChanged(ext,id);
}
function v602StyleControl(n,el){
  const s=el.style||{};
  n.style.cssText='width:100%;height:100%;box-sizing:border-box;background:'+(s.background||'#232735')+';color:'+(s.color||'#fff')+';border:'+(Number(s.borderWidth)||1)+'px solid '+(s.borderColor||'#5B6EE1')+';border-radius:'+(Number(s.borderRadius)||6)+'px;padding:'+(Number(s.padding)||4)+'px;font-size:'+(Number(s.fontSize)||14)+'px;';
}
function v602ReplaceContent(wrap,node){
  if(!wrap)return;
  const art=wrap.querySelector && wrap.querySelector('.supergui-custom-art');
  Array.from(wrap.children).forEach(c=>{ if(c!==art) c.remove(); });
  if(art) wrap.insertBefore(node,art); else wrap.appendChild(node);
}

const v602OriginalCreateElementDom = SuperGUI.prototype._createElementDom;
SuperGUI.prototype._createElementDom = function(panelKey, elId, el){
  const wrap=v602OriginalCreateElementDom.call(this,panelKey,elId,el);
  if(!wrap||!el)return wrap;

  if(el.type==='terminal'){
    el.lines=Array.isArray(el.lines)?el.lines:(String(el.text||'')?String(el.text).split('\n'):[]);
    el.commandHistory=Array.isArray(el.commandHistory)?el.commandHistory:[];
    if(el.terminalPrompt===undefined)el.terminalPrompt='$';
    if(el.terminalInputEnabled===undefined)el.terminalInputEnabled=true;
    if(el.terminalEcho===undefined)el.terminalEcho=true;

    const root=document.createElement('div');
    root.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;background:#090b10;color:#d7ffe1;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;border-radius:inherit;overflow:hidden;box-sizing:border-box;';
    const output=document.createElement('div');
    output.className='supergui-terminal-output';
    output.style.cssText='flex:1;overflow:auto;white-space:pre-wrap;word-break:break-word;padding:6px;font-size:12px;line-height:1.35;user-select:text;';
    output.textContent=el.lines.join('\n');
    root.appendChild(output);
    const row=document.createElement('div');
    row.style.cssText='display:flex;align-items:center;gap:5px;padding:5px 6px;border-top:1px solid #ffffff18;background:#0d1118;';
    const prompt=document.createElement('span'); prompt.textContent=String(el.terminalPrompt||'$'); prompt.style.color='#7dff9b';
    const input=document.createElement('input'); input.type='text'; input.autocomplete='off'; input.spellcheck=false; input.disabled=!el.terminalInputEnabled;
    input.style.cssText='flex:1;min-width:0;background:transparent;border:0;outline:0;color:#fff;font:inherit;padding:0;';
    input.addEventListener('keydown',ev=>{
      if(ev.key==='ArrowUp' && el.commandHistory.length){ ev.preventDefault(); input.value=el.commandHistory[el.commandHistory.length-1]||''; return; }
      if(ev.key!=='Enter')return;
      ev.preventDefault();
      const command=input.value;
      el.lastTerminalCommand=command;
      el.commandHistory.push(command);
      if(el.commandHistory.length>100)el.commandHistory.shift();
      if(el.terminalEcho){ el.lines.push(String(el.terminalPrompt||'$')+' '+command); el.text=el.lines.join('\n'); output.textContent=el.text; output.scrollTop=output.scrollHeight; }
      input.value='';
      try { this.runtime.startHats(EXT_ID+'_whenTerminalCommandV6',{E:elId}); } catch(e){}
      v602FireChanged(this,elId);
    });
    row.appendChild(prompt); row.appendChild(input); root.appendChild(row);
    v602ReplaceContent(wrap,root);
    wrap.dataset.v6Interactive='terminal';
    return wrap;
  }

  if(['textarea','passwordinput','emailinput','urlinput','datepicker'].includes(el.type)){
    const n=el.type==='textarea'?document.createElement('textarea'):document.createElement('input');
    if(el.type!=='textarea') n.type=el.type==='passwordinput'?'password':el.type==='emailinput'?'email':el.type==='urlinput'?'url':'date';
    n.value=String(el.value??''); n.placeholder=String(el.placeholder||''); n.disabled=!!el.disabled;
    v602StyleControl(n,el); if(el.type==='textarea')n.style.resize='none';
    n.addEventListener('input',()=>{el.value=n.value;v602FireChanged(this,elId);});
    v602ReplaceContent(wrap,n); wrap.dataset.v6Interactive='input'; return wrap;
  }

  if(el.type==='filepicker'){
    const n=document.createElement('input'); n.type='file'; n.disabled=!!el.disabled; v602StyleControl(n,el); n.style.padding='3px';
    n.addEventListener('change',()=>{const file=n.files&&n.files[0];el.selectedFileName=file?file.name:'';el.value=el.selectedFileName;try{this.runtime.startHats(EXT_ID+'_whenV6FileSelected',{E:elId});}catch(e){}v602FireChanged(this,elId);});
    v602ReplaceContent(wrap,n); wrap.dataset.v6Interactive='file'; return wrap;
  }

  if(el.type==='stepper'){
    el.value=Number(el.value)||0; el.step=Number(el.step)||1;
    const root=document.createElement('div'); v602StyleControl(root,el); root.style.display='grid'; root.style.gridTemplateColumns='1fr 1.4fr 1fr'; root.style.padding='0'; root.style.overflow='hidden';
    const make=(txt,fn)=>{const b=document.createElement('button');b.textContent=txt;b.style.cssText='border:0;background:transparent;color:inherit;font:inherit;cursor:pointer;';b.disabled=!!el.disabled;b.onclick=fn;return b;};
    const value=document.createElement('div');value.textContent=String(el.value);value.style.cssText='display:flex;align-items:center;justify-content:center;border-left:1px solid #ffffff20;border-right:1px solid #ffffff20;';
    const change=d=>{const min=Number.isFinite(Number(el.min))?Number(el.min):-Infinity,max=Number.isFinite(Number(el.max))?Number(el.max):Infinity;el.value=Math.max(min,Math.min(max,Number(el.value)+d*(Number(el.step)||1)));value.textContent=String(el.value);v602FireActivated(this,elId,el.value);};
    root.append(make('−',()=>change(-1)),value,make('+',()=>change(1))); v602ReplaceContent(wrap,root); return wrap;
  }

  if(['segmentedcontrol','toolbar','menubar','pagination','list'].includes(el.type)){
    const items=Array.isArray(el.items)&&el.items.length?el.items:(el.type==='pagination'?['1','2','3']:['Item 1','Item 2','Item 3']);
    const root=document.createElement('div'); v602StyleControl(root,el); root.style.display='flex'; root.style.gap='4px'; root.style.alignItems='center'; root.style.overflow='auto'; root.style.flexDirection=el.type==='list'?'column':'row';
    items.forEach((item,index)=>{const b=document.createElement('button');b.textContent=typeof item==='object'?(item.label??item.text??JSON.stringify(item)):String(item);b.disabled=!!el.disabled;b.style.cssText='flex:'+(el.type==='list'?'0 0 auto':'1')+';width:'+(el.type==='list'?'100%':'auto')+';border:1px solid #ffffff22;border-radius:4px;padding:4px;background:'+(Number(el.selectedIndex||0)===index?'#ffffff20':'transparent')+';color:inherit;cursor:pointer;text-align:'+(el.type==='list'?'left':'center')+';';b.onclick=()=>{el.selectedIndex=index;el.value=typeof item==='object'?(item.value??item.label??item.text??index):item;v602FireActivated(this,elId,el.value);this._renderPanel(panelKey);};root.appendChild(b);});
    v602ReplaceContent(wrap,root); return wrap;
  }

  return wrap;
};

SuperGUI.prototype.getV6ActivatedItem=function(a){const f=v602Find(this,a.E);return f?(f.el.lastActivatedItem??''):'';};
SuperGUI.prototype.getV6SelectedFileName=function(a){const f=v602Find(this,a.E);return f?String(f.el.selectedFileName||''):'';};
SuperGUI.prototype.getLastTerminalCommandV6=function(a){const f=v602Find(this,a.E);return f?String(f.el.lastTerminalCommand||''):'';};
SuperGUI.prototype.setTerminalPromptV6=function(a){const f=v602Find(this,a.E);if(!f||f.el.type!=='terminal')return;f.el.terminalPrompt=String(a.PROMPT??'$');this._renderPanel(f.panelKey);};
SuperGUI.prototype.setTerminalInputEnabledV6=function(a){const f=v602Find(this,a.E);if(!f||f.el.type!=='terminal')return;f.el.terminalInputEnabled=!!a.ENABLED;this._renderPanel(f.panelKey);};
SuperGUI.prototype.setTerminalEchoV6=function(a){const f=v602Find(this,a.E);if(!f||f.el.type!=='terminal')return;f.el.terminalEcho=!!a.ENABLED;this._renderPanel(f.panelKey);};
SuperGUI.prototype.focusTerminalV6=function(a){const n=this.elementDoms&&this.elementDoms[a.E];const i=n&&n.querySelector('input');if(i)i.focus();};
SuperGUI.prototype.getTerminalHistoryV6=function(a){const f=v602Find(this,a.E);return f&&f.el.type==='terminal'?JSON.stringify(f.el.commandHistory||[]):'[]';};
