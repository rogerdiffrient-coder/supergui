// SuperGUI v6 runtime layer: drag zones, advanced panels, templates, clipboard, and new item types.

const V6_ITEM_TYPES = [
  'icon','avatar','card','panelheader','breadcrumb','pagination','notification','toast','alert','chip',
  'tag','pill','meter','gauge','thermometer','sparkline','barchart','linechart','piechart','minimap',
  'mapmarker','clock','timer','calendar','datepicker','filepicker','textarea','passwordinput','emailinput','urlinput',
  'stepper','segmentedcontrol','toolbar','menubar','contextmenu','treeview','list','listitem','table','datagrid',
  'statcard','keycap','hotkey','spacer','scrollarea','iframe','markdown','richtext','terminal','chatbubble'
];

const V6_TEMPLATE_NAMES = ['Browser Window','Dialog','Settings','Sidebar App','HUD','Leaderboard','Inventory','Chat','Mobile App','Desktop Window'];

const v6OriginalGetInfo = SuperGUI.prototype.getInfo;
SuperGUI.prototype.getInfo = function () {
  const info = v6OriginalGetInfo.call(this);
  const B = Scratch.BlockType, S = Scratch.ArgumentType;
  const str = (menu, value='') => ({ type:S.STRING, ...(menu ? {menu} : {}), defaultValue:value });
  const num = value => ({ type:S.NUMBER, defaultValue:value });
  info.menus = info.menus || {};
  info.menus.v6Templates = {acceptReporters:false, items:V6_TEMPLATE_NAMES};
  info.menus.panelImageFits = {acceptReporters:false, items:['cover','contain','stretch','tile']};
  info.menus.panelBorderStyles = {acceptReporters:false, items:['solid','dashed','dotted','double','none']};
  const blocks = [
    {blockType:B.LABEL,text:'─── v6: Drag Zones ───'},
    {opcode:'addPanelDragZone',blockType:B.COMMAND,text:'make [E] a drag zone for panel [P]',arguments:{E:str('elements'),P:str('panels')}},
    {opcode:'removePanelDragZone',blockType:B.COMMAND,text:'remove [E] drag zone from panel [P]',arguments:{E:str('elements'),P:str('panels')}},
    {opcode:'clearPanelDragZones',blockType:B.COMMAND,text:'clear drag zones in panel [P]',arguments:{P:str('panels')}},
    {opcode:'getPanelDragZones',blockType:B.REPORTER,text:'drag zones in panel [P]',arguments:{P:str('panels')}},

    {blockType:B.LABEL,text:'─── v6: Panel styling ───'},
    {opcode:'setPanelGradient',blockType:B.COMMAND,text:'set panel [P] gradient [CSS]',arguments:{P:str('panels'),CSS:str(null,'linear-gradient(135deg,#232735,#5B6EE1)')}},
    {opcode:'setPanelShadow',blockType:B.COMMAND,text:'set panel [P] shadow x [X] y [Y] blur [BLUR] spread [SPREAD] color [C]',arguments:{P:str('panels'),X:num(0),Y:num(12),BLUR:num(30),SPREAD:num(0),C:str(null,'#00000066')}},
    {opcode:'setPanelBackdropBlur',blockType:B.COMMAND,text:'set panel [P] backdrop blur [N] px',arguments:{P:str('panels'),N:num(0)}},
    {opcode:'setPanelBorderStyleV6',blockType:B.COMMAND,text:'set panel [P] border style [STYLE]',arguments:{P:str('panels'),STYLE:str('panelBorderStyles','solid')}},
    {opcode:'setPanelOutline',blockType:B.COMMAND,text:'set panel [P] outline [W] px [C]',arguments:{P:str('panels'),W:num(0),C:str(null,'#ffffff')}},
    {opcode:'setPanelBackgroundFit',blockType:B.COMMAND,text:'set panel [P] background image fit [FIT]',arguments:{P:str('panels'),FIT:str('panelImageFits','cover')}},
    {opcode:'setPanelSaturation',blockType:B.COMMAND,text:'set panel [P] saturation [N]%',arguments:{P:str('panels'),N:num(100)}},
    {opcode:'setPanelBrightness',blockType:B.COMMAND,text:'set panel [P] brightness [N]%',arguments:{P:str('panels'),N:num(100)}},

    {blockType:B.LABEL,text:'─── v6: Templates ───'},
    {opcode:'createFromTemplate',blockType:B.COMMAND,text:'create [TEMPLATE] template named [NAME]',arguments:{TEMPLATE:str('v6Templates','Browser Window'),NAME:str(null,'My Window')}},
    {opcode:'templateAsJSON',blockType:B.REPORTER,text:'[TEMPLATE] template JSON',arguments:{TEMPLATE:str('v6Templates','Browser Window')}},

    {blockType:B.LABEL,text:'─── v6: Copy / Paste ───'},
    {opcode:'copyElementV6',blockType:B.COMMAND,text:'copy element [E]',arguments:{E:str('elements')}},
    {opcode:'pasteElementV6',blockType:B.REPORTER,text:'paste copied element into [P] as [ID]',arguments:{P:str('panels'),ID:str(null,'PastedElement')}},
    {opcode:'copyPanelV6',blockType:B.COMMAND,text:'copy panel [P]',arguments:{P:str('panels')}},
    {opcode:'pastePanelV6',blockType:B.REPORTER,text:'paste copied panel as [NAME]',arguments:{NAME:str(null,'Pasted Panel')}},
    {opcode:'clipboardTypeV6',blockType:B.REPORTER,text:'SuperGUI clipboard type'},

    {blockType:B.LABEL,text:'─── v6: Items ───'},
    {opcode:'setV6ItemData',blockType:B.COMMAND,text:'set [E] data JSON [JSON]',arguments:{E:str('elements'),JSON:str(null,'{}')}},
    {opcode:'getV6ItemData',blockType:B.REPORTER,text:'[E] data JSON',arguments:{E:str('elements')}},
    {opcode:'setV6ItemText',blockType:B.COMMAND,text:'set [E] v6 text [TEXT]',arguments:{E:str('elements'),TEXT:str(null,'Text')}},
    {opcode:'setV6ItemIcon',blockType:B.COMMAND,text:'set [E] v6 icon/image [VALUE]',arguments:{E:str('elements'),VALUE:str(null,'★')}},
    {opcode:'setV6ItemItems',blockType:B.COMMAND,text:'set [E] v6 items JSON [JSON]',arguments:{E:str('elements'),JSON:str(null,'[]')}}
  ];
  info.blocks = blocks.concat(info.blocks || []);
  return info;
};

SuperGUI.prototype._v6Panel = function (name) {
  const k = this._findPanelKeyByName(name); return k ? {k,p:this.config.panels[k]} : null;
};

SuperGUI.prototype.addPanelDragZone = function(a){ const f=this._v6Panel(a.P), e=this._findElement(a.E); if(!f||!e||e.panelKey!==f.k)return; f.p.dragZones=Array.isArray(f.p.dragZones)?f.p.dragZones:[]; if(!f.p.dragZones.includes(a.E))f.p.dragZones.push(a.E); this._renderPanel(f.k); };
SuperGUI.prototype.removePanelDragZone = function(a){ const f=this._v6Panel(a.P); if(!f)return; f.p.dragZones=(f.p.dragZones||[]).filter(x=>x!==a.E); this._renderPanel(f.k); };
SuperGUI.prototype.clearPanelDragZones = function(a){ const f=this._v6Panel(a.P); if(!f)return; f.p.dragZones=[]; this._renderPanel(f.k); };
SuperGUI.prototype.getPanelDragZones = function(a){ const f=this._v6Panel(a.P); return f?JSON.stringify(f.p.dragZones||[]):'[]'; };

function v6RestylePanel(ext,name,mutate){ const f=ext._v6Panel(name); if(!f)return; f.p.v6Style=f.p.v6Style||{}; mutate(f.p.v6Style); ext._renderPanel(f.k); }
SuperGUI.prototype.setPanelGradient=function(a){v6RestylePanel(this,a.P,s=>s.gradient=String(a.CSS||''));};
SuperGUI.prototype.setPanelShadow=function(a){v6RestylePanel(this,a.P,s=>s.shadow=`${Number(a.X)||0}px ${Number(a.Y)||0}px ${Math.max(0,Number(a.BLUR)||0)}px ${Number(a.SPREAD)||0}px ${String(a.C||'#00000066')}`);};
SuperGUI.prototype.setPanelBackdropBlur=function(a){v6RestylePanel(this,a.P,s=>s.backdropBlur=Math.max(0,Number(a.N)||0));};
SuperGUI.prototype.setPanelBorderStyleV6=function(a){v6RestylePanel(this,a.P,s=>s.borderStyle=String(a.STYLE||'solid'));};
SuperGUI.prototype.setPanelOutline=function(a){v6RestylePanel(this,a.P,s=>{s.outlineWidth=Math.max(0,Number(a.W)||0);s.outlineColor=String(a.C||'#fff');});};
SuperGUI.prototype.setPanelBackgroundFit=function(a){v6RestylePanel(this,a.P,s=>s.backgroundFit=String(a.FIT||'cover'));};
SuperGUI.prototype.setPanelSaturation=function(a){v6RestylePanel(this,a.P,s=>s.saturation=Math.max(0,Number(a.N)||0));};
SuperGUI.prototype.setPanelBrightness=function(a){v6RestylePanel(this,a.P,s=>s.brightness=Math.max(0,Number(a.N)||0));};

const v6OriginalRenderPanel = SuperGUI.prototype._renderPanel;
SuperGUI.prototype._renderPanel = function(k){
  const out=v6OriginalRenderPanel.call(this,k); const p=this.config.panels[k], dom=this.panelDoms[k];
  if(p&&dom){ const s=p.v6Style||{}, scale=this._stageScale||1; dom.style.boxShadow=s.shadow||''; dom.style.backdropFilter=s.backdropBlur?`blur(${s.backdropBlur*scale}px)`:''; dom.style.webkitBackdropFilter=dom.style.backdropFilter; dom.style.borderStyle=s.borderStyle||'solid'; dom.style.outline=s.outlineWidth?`${s.outlineWidth*scale}px solid ${s.outlineColor||'#fff'}`:''; dom.style.filter=`saturate(${s.saturation??100}%) brightness(${s.brightness??100}%)`; if(s.gradient)dom.style.background=s.gradient; if(p.backgroundImage){dom.style.backgroundImage=`url("${p.backgroundImage}")`; const fit=s.backgroundFit||'cover'; dom.style.backgroundSize=fit==='stretch'?'100% 100%':fit==='tile'?'auto':fit; dom.style.backgroundRepeat=fit==='tile'?'repeat':'no-repeat'; dom.style.backgroundPosition='center';}}
  return out;
};

function v6UniquePanelKey(ext){ let i=1,k='v6_'+Date.now().toString(36); while(ext.config.panels[k])k='v6_'+Date.now().toString(36)+'_'+i++; return k; }
function v6BasePanel(name){ return {name,x:12,y:12,width:76,height:70,visible:true,minimized:false,draggable:false,titleBar:false,backgroundImage:'',zIndex:20,modal:false,style:{background:'#202534',borderColor:'#4a526b',borderWidth:2,borderRadius:12,padding:8,opacity:1},elementOrder:[],elements:{},dragZones:[],v6Style:{shadow:'0px 12px 30px 0px #00000066'}}; }
function v6El(type,x,y,w,h,text){ const e=defaultElement(type); e.x=x;e.y=y;e.width=w;e.height=h;if(text!==undefined){e.text=text;e.value=text;}return e; }
function v6Template(name){
  const p=v6BasePanel(name);
  const add=(id,e)=>{p.elements[id]=e;p.elementOrder.push(id);return id;};
  return {
    'Browser Window':()=>{p.width=82;p.height=76;add('WindowBar',v6El('panelheader',0,0,100,10,'My Browser'));p.dragZones=['WindowBar'];add('Back',v6El('button',2,12,9,9,'←'));add('Forward',v6El('button',12,12,9,9,'→'));add('Address',v6El('urlinput',22,12,60,9,'https://'));add('Go',v6El('button',83,12,14,9,'Go'));add('Page',v6El('iframe',2,23,95,74,''));return p;},
    'Dialog':()=>{p.width=55;p.height=38;p.x=22;p.y=30;p.modal=true;add('DialogTitle',v6El('panelheader',0,0,100,18,'Dialog'));p.dragZones=['DialogTitle'];add('Message',v6El('label',6,23,88,35,'Are you sure?'));add('Cancel',v6El('button',48,70,22,20,'Cancel'));add('OK',v6El('button',72,70,22,20,'OK'));return p;},
    'Settings':()=>{p.width=65;p.height=78;add('Header',v6El('panelheader',0,0,100,10,'Settings'));p.dragZones=['Header'];add('Nav',v6El('list',2,13,27,83,'General'));add('Content',v6El('scrollarea',31,13,67,83,''));return p;},
    'Sidebar App':()=>{p.width=78;p.height=78;add('Header',v6El('panelheader',0,0,100,9,'App'));p.dragZones=['Header'];add('Sidebar',v6El('menubar',0,10,23,90,'Home'));add('Content',v6El('scrollarea',24,10,76,90,''));return p;},
    'HUD':()=>{p.style.background='#00000000';p.style.borderWidth=0;p.v6Style.shadow='';add('Health',v6El('healthbar',2,3,35,10,''));add('Score',v6El('statcard',70,3,28,12,'Score'));add('MiniMap',v6El('minimap',76,70,22,27,''));return p;},
    'Leaderboard':()=>{add('Header',v6El('panelheader',0,0,100,10,'Leaderboard'));p.dragZones=['Header'];add('Board',v6El('leaderboard',3,13,94,84,''));return p;},
    'Inventory':()=>{add('Header',v6El('panelheader',0,0,100,10,'Inventory'));p.dragZones=['Header'];add('Grid',v6El('datagrid',4,14,92,80,''));return p;},
    'Chat':()=>{add('Header',v6El('panelheader',0,0,100,10,'Chat'));p.dragZones=['Header'];add('Messages',v6El('scrollarea',3,13,94,70,''));add('Message',v6El('textarea',3,85,75,12,''));add('Send',v6El('button',80,85,17,12,'Send'));return p;},
    'Mobile App':()=>{p.width=38;p.height=86;p.x=31;p.y=7;p.style.borderRadius=22;add('Header',v6El('panelheader',0,0,100,8,'Mobile'));p.dragZones=['Header'];add('Content',v6El('scrollarea',3,10,94,80,''));add('Toolbar',v6El('toolbar',3,91,94,7,''));return p;},
    'Desktop Window':()=>{p.width=72;p.height=68;add('TitleBar',v6El('panelheader',0,0,100,10,'Window'));p.dragZones=['TitleBar'];add('Toolbar',v6El('toolbar',0,10,100,9,''));add('Content',v6El('scrollarea',2,21,96,76,''));return p;}
  };
}
SuperGUI.prototype.createFromTemplate=function(a){ const name=String(a.NAME||a.TEMPLATE||'Panel'), factory=v6Template(name)[a.TEMPLATE]; if(!factory)return; const p=factory(), key=v6UniquePanelKey(this); p.name=name; p.zIndex=this._nextZ(); this.config.panels[key]=p; this.config.panelOrder.push(key); this._renderPanel(key); return name; };
SuperGUI.prototype.templateAsJSON=function(a){ const factory=v6Template('Template')[a.TEMPLATE]; return factory?JSON.stringify(factory()):'{}'; };

SuperGUI.prototype.copyElementV6=function(a){ const f=this._findElement(a.E); if(f)this._v6Clipboard={type:'element',data:JSON.parse(JSON.stringify(f.el))}; };
SuperGUI.prototype.pasteElementV6=function(a){ if(!this._v6Clipboard||this._v6Clipboard.type!=='element')return ''; const k=this._findPanelKeyByName(a.P); if(!k)return ''; const id=this._uniqueId(String(a.ID||'PastedElement')); this.config.panels[k].elements[id]=JSON.parse(JSON.stringify(this._v6Clipboard.data)); this.config.panels[k].elementOrder.push(id); this._renderPanel(k); return id; };
SuperGUI.prototype.copyPanelV6=function(a){ const f=this._v6Panel(a.P); if(f)this._v6Clipboard={type:'panel',data:JSON.parse(JSON.stringify(f.p))}; };
SuperGUI.prototype.pastePanelV6=function(a){ if(!this._v6Clipboard||this._v6Clipboard.type!=='panel')return ''; const p=JSON.parse(JSON.stringify(this._v6Clipboard.data)), key=v6UniquePanelKey(this); p.name=String(a.NAME||'Pasted Panel'); p.zIndex=this._nextZ(); for(const old of [...p.elementOrder]){ if(this._findElement(old)){ const next=this._uniqueId(old); p.elements[next]=p.elements[old]; delete p.elements[old]; p.elementOrder[p.elementOrder.indexOf(old)]=next; p.dragZones=(p.dragZones||[]).map(x=>x===old?next:x); }} this.config.panels[key]=p;this.config.panelOrder.push(key);this._renderPanel(key);return p.name; };
SuperGUI.prototype.clipboardTypeV6=function(){return this._v6Clipboard?this._v6Clipboard.type:'';};

SuperGUI.prototype.setV6ItemData=function(a){const f=this._findElement(a.E);if(!f)return;try{f.el.v6Data=JSON.parse(String(a.JSON||'{}'));this._renderPanel(f.panelKey);}catch(e){}};
SuperGUI.prototype.getV6ItemData=function(a){const f=this._findElement(a.E);return f?JSON.stringify(f.el.v6Data||{}):'{}';};
SuperGUI.prototype.setV6ItemText=function(a){const f=this._findElement(a.E);if(!f)return;f.el.text=String(a.TEXT||'');f.el.value=f.el.text;this._renderPanel(f.panelKey);};
SuperGUI.prototype.setV6ItemIcon=function(a){const f=this._findElement(a.E);if(!f)return;f.el.icon=String(a.VALUE||'');f.el.image=f.el.icon;this._renderPanel(f.panelKey);};
SuperGUI.prototype.setV6ItemItems=function(a){const f=this._findElement(a.E);if(!f)return;try{const v=JSON.parse(String(a.JSON||'[]'));if(Array.isArray(v))f.el.items=v;this._renderPanel(f.panelKey);}catch(e){}};

function v6CommonNode(ext,el){ const n=document.createElement('div'),s=el.style||{},scale=ext._stageScale||1;n.style.cssText=`width:100%;height:100%;box-sizing:border-box;color:${s.color||'#fff'};background:${s.background||'transparent'};border:${(s.borderWidth||0)*scale}px solid ${s.borderColor||'transparent'};border-radius:${(s.borderRadius||0)*scale}px;padding:${(s.padding||0)*scale}px;font-size:${(s.fontSize||14)*scale}px;font-weight:${s.fontWeight||'normal'};opacity:${s.opacity??1};overflow:hidden;`;return n; }
function v6Text(el,fallback){return String(el.text??el.value??fallback??'');}
SuperGUI.prototype._createV6ElementDom=function(panelKey,elId,el,wrap){
  const n=v6CommonNode(this,el),type=el.type,data=el.v6Data||{},items=Array.isArray(el.items)?el.items:[];
  if(['icon','mapmarker','keycap','hotkey'].includes(type)){n.style.display='flex';n.style.alignItems='center';n.style.justifyContent='center';n.style.fontWeight='800';n.textContent=el.icon||v6Text(el,type==='mapmarker'?'●':type==='icon'?'★':'⌘');}
  else if(type==='avatar'){n.style.borderRadius='50%';n.style.backgroundSize='cover';n.style.backgroundPosition='center';if(el.image)n.style.backgroundImage=`url("${el.image}")`;else{n.style.display='flex';n.style.alignItems='center';n.style.justifyContent='center';n.textContent=v6Text(el,'A').slice(0,2).toUpperCase();}}
  else if(['card','statcard','notification','toast','alert','chatbubble'].includes(type)){n.style.display='flex';n.style.flexDirection='column';n.style.justifyContent='center';n.style.gap='3px';const strong=document.createElement('strong');strong.textContent=data.title||v6Text(el,type==='statcard'?'Statistic':type);n.appendChild(strong);if(data.subtitle||data.value!==undefined){const sub=document.createElement('span');sub.textContent=data.subtitle??data.value;sub.style.opacity='.7';n.appendChild(sub);}}
  else if(type==='panelheader'){n.style.display='flex';n.style.alignItems='center';n.style.fontWeight='800';n.style.cursor='grab';n.textContent=v6Text(el,'Window');}
  else if(['chip','tag','pill'].includes(type)){n.style.display='inline-flex';n.style.alignItems='center';n.style.justifyContent='center';n.style.borderRadius=type==='pill'?'999px':n.style.borderRadius;n.textContent=v6Text(el,type);}
  else if(['meter','gauge','thermometer'].includes(type)){const value=Math.max(0,Math.min(100,Number(data.value??el.value??50)));n.style.position='relative';const fill=document.createElement('div');fill.style.cssText=`position:absolute;left:0;bottom:0;background:${data.color||'#5B6EE1'};${type==='thermometer'?`width:100%;height:${value}%`:`height:100%;width:${value}%`};`;n.appendChild(fill);}
  else if(['sparkline','barchart','linechart','piechart'].includes(type)){const vals=(data.values||items||[20,55,35,80,60]).map(Number);const max=Math.max(1,...vals);n.style.display='flex';n.style.alignItems='end';n.style.gap='3px';if(type==='piechart'){n.style.background=`conic-gradient(#5B6EE1 0 35%,#7c8bf0 35% 65%,#3a3f52 65% 100%)`;n.style.borderRadius='50%';}else vals.forEach(v=>{const b=document.createElement('div');b.style.cssText=`flex:1;height:${Math.max(3,v/max*100)}%;background:${data.color||'#5B6EE1'};border-radius:2px;`;n.appendChild(b);});}
  else if(type==='minimap'){n.style.position='relative';n.style.background=data.background||'#10131c';(data.markers||[{x:50,y:50}]).forEach(m=>{const d=document.createElement('i');d.style.cssText=`position:absolute;left:${m.x||0}%;top:${m.y||0}%;width:6px;height:6px;border-radius:50%;background:${m.color||'#ffd166'};transform:translate(-50%,-50%);`;n.appendChild(d);});}
  else if(['clock','timer'].includes(type)){n.style.display='flex';n.style.alignItems='center';n.style.justifyContent='center';n.style.fontVariantNumeric='tabular-nums';n.textContent=type==='clock'?new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}):v6Text(el,'00:00');}
  else if(['calendar','datepicker'].includes(type)){n.style.display='grid';n.style.gridTemplateColumns='repeat(7,1fr)';n.style.gap='2px';for(let i=1;i<=28;i++){const d=document.createElement('span');d.textContent=i;d.style.textAlign='center';n.appendChild(d);}}
  else if(type==='filepicker'){const inp=document.createElement('input');inp.type='file';inp.style.width='100%';n.appendChild(inp);}
  else if(['textarea','passwordinput','emailinput','urlinput'].includes(type)){const inp=type==='textarea'?document.createElement('textarea'):document.createElement('input');if(type!=='textarea')inp.type=type.replace('input','')||'text';inp.value=String(el.value||'');inp.placeholder=el.placeholder||'';inp.style.cssText='width:100%;height:100%;box-sizing:border-box;background:transparent;color:inherit;border:0;outline:0;resize:none;';inp.addEventListener('input',()=>{el.value=inp.value;this.runtime.startHats(EXT_ID+'_whenElementChanged',{E:elId});});n.appendChild(inp);}
  else if(type==='stepper'){n.style.display='grid';n.style.gridTemplateColumns='1fr auto auto';const val=document.createElement('span');val.textContent=String(el.value??0);const minus=document.createElement('button');minus.textContent='−';const plus=document.createElement('button');plus.textContent='+';minus.onclick=()=>{el.value=Number(el.value||0)-1;this._renderPanel(panelKey)};plus.onclick=()=>{el.value=Number(el.value||0)+1;this._renderPanel(panelKey)};n.append(val,minus,plus);}
  else if(['segmentedcontrol','toolbar','menubar','breadcrumb','pagination'].includes(type)){n.style.display='flex';n.style.alignItems='center';n.style.gap='4px';(items.length?items:(type==='breadcrumb'?['Home','Section','Page']:['One','Two','Three'])).forEach((x,i)=>{const b=document.createElement('span');b.textContent=typeof x==='object'?(x.label??x.text??String(i+1)):String(x);b.style.cssText='padding:3px 6px;border-radius:4px;background:rgba(255,255,255,.06);white-space:nowrap;';n.appendChild(b);if(type==='breadcrumb'&&i<(items.length?items.length:3)-1)n.append('›');});}
  else if(['contextmenu','treeview','list','listitem'].includes(type)){n.style.overflow='auto';const arr=type==='listitem'?[v6Text(el,'Item')]:(items.length?items:['Item 1','Item 2','Item 3']);arr.forEach((x,i)=>{const row=document.createElement('div');row.textContent=typeof x==='object'?(x.label??x.text??JSON.stringify(x)):String(x);row.style.cssText='padding:4px 6px;border-bottom:1px solid rgba(255,255,255,.07);';if(type==='treeview')row.style.paddingLeft=(6+(x.depth||0)*12)+'px';n.appendChild(row);});}
  else if(['table','datagrid'].includes(type)){const rows=data.rows||items||[['A','B'],['1','2']];n.style.display='grid';n.style.gridTemplateColumns=`repeat(${Math.max(1,Number(data.columns)||2)},1fr)`;rows.flat().forEach(x=>{const c=document.createElement('div');c.textContent=typeof x==='object'?JSON.stringify(x):String(x);c.style.cssText='padding:4px;border:1px solid rgba(255,255,255,.08);overflow:hidden;text-overflow:ellipsis;';n.appendChild(c);});}
  else if(type==='spacer'){n.style.background='transparent';n.style.border='0';}
  else if(type==='scrollarea'){n.style.overflow='auto';n.textContent=v6Text(el,'Scrollable area');}
  else if(type==='iframe'){const fr=document.createElement('iframe');fr.src=String(el.value||data.url||'about:blank');fr.style.cssText='width:100%;height:100%;border:0;background:white;';fr.setAttribute('sandbox','allow-scripts allow-forms allow-popups allow-same-origin');n.appendChild(fr);}
  else if(['markdown','richtext','terminal'].includes(type)){n.style.overflow='auto';n.style.whiteSpace=type==='richtext'?'normal':'pre-wrap';n.style.fontFamily=type==='terminal'?'ui-monospace,monospace':'inherit';n.textContent=v6Text(el,type==='terminal'?'$ ready':'Text');}
  else n.textContent=v6Text(el,type);
  wrap.appendChild(n); return wrap;
};

const v6OriginalCreateElementDom=SuperGUI.prototype._createElementDom;
SuperGUI.prototype._createElementDom=function(panelKey,elId,el){
  const wrap=v6OriginalCreateElementDom.call(this,panelKey,elId,el); if(!wrap)return wrap;
  const panel=this.config.panels[panelKey];
  if(panel&&Array.isArray(panel.dragZones)&&panel.dragZones.includes(elId)){
    wrap.dataset.superguiDragZone='true';wrap.style.cursor='grab';
    wrap.addEventListener('pointerdown',ev=>{
      if(ev.button!==0)return; ev.preventDefault();ev.stopPropagation();
      const startX=ev.clientX,startY=ev.clientY,ox=panel.x,oy=panel.y,rect=this.overlay.getBoundingClientRect();wrap.setPointerCapture&&wrap.setPointerCapture(ev.pointerId);wrap.style.cursor='grabbing';
      const move=e=>{panel.x=ox+(e.clientX-startX)/Math.max(1,rect.width)*100;panel.y=oy+(e.clientY-startY)/Math.max(1,rect.height)*100;const d=this.panelDoms[panelKey];if(d){d.style.left=panel.x+'%';d.style.top=panel.y+'%';}};
      const up=e=>{wrap.style.cursor='grab';window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);saveConfigToStorage(this.config);};
      window.addEventListener('pointermove',move);window.addEventListener('pointerup',up,{once:true});
    });
  }
  return wrap;
};
