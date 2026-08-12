from pathlib import Path
import re
import json

ROOT = Path(__file__).resolve().parents[1]

# --- Model: add first-class container elements ---
p = ROOT / 'src/constants-and-model.js'
s = p.read_text()
s = s.replace("  'tooltip', 'achievement', 'leaderboard'\n];", "  'tooltip', 'achievement', 'leaderboard', 'container'\n];")
s = s.replace("      case 'canvas': return Object.assign(base, { width:50, height:30 });\n", "      case 'canvas': return Object.assign(base, { width:50, height:30 });\n      case 'container': return Object.assign(base, { layoutMode:'vertical', layoutGap:8, layoutPadding:8, layoutOverflow:'auto', layoutAlign:'stretch', layoutJustify:'start', layoutWrap:false, layoutColumns:2, children:[], width:60, height:55 });\n")
p.write_text(s)

# --- Bundle the v5 module after the core class ---
p = ROOT / 'scripts/build.mjs'
s = p.read_text()
if "'src/v5-layout.js'" not in s:
    s = s.replace("  'src/super-gui.js'\n];", "  'src/super-gui.js',\n  'src/v5-layout.js'\n];")
s = s.replace('// SuperGUI v4 - generated file;', '// SuperGUI v5 - generated file;')
p.write_text(s)

# --- Package version ---
p = ROOT / 'package.json'
if p.exists():
    data = json.loads(p.read_text())
    data['version'] = '5.0.0'
    p.write_text(json.dumps(data, indent=2) + '\n')

# --- Editor upgrades ---
p = ROOT / 'src/editor/editor-template.js'
s = p.read_text()

# Add container to the element picker and editor-side defaults.
s = s.replace('<option value="particles">Particles</option><option value="canvas">Canvas</option>', '<option value="particles">Particles</option><option value="canvas">Canvas</option>\n        <option value="container">Layout Container</option>')
s = s.replace("    else if (t==='canvas') { b.width=50; b.height=30; }", "    else if (t==='canvas') { b.width=50; b.height=30; }\n    else if (t==='container') { b.layoutMode='vertical'; b.layoutGap=8; b.layoutPadding=8; b.layoutOverflow='auto'; b.layoutAlign='stretch'; b.layoutJustify='start'; b.layoutWrap=false; b.layoutColumns=2; b.children=[]; b.width=60; b.height=55; }")

# Add stable IDs to rendered rows/nodes so the v5 editor layer can enhance them.
s = s.replace("var row=document.createElement('div'); row.className='list-item'+(id===selectedElement?' selected':'');", "var row=document.createElement('div'); row.className='list-item'+(id===selectedElement?' selected':''); row.dataset.elId=id; row.draggable=true;")
s = s.replace("var wrap=document.createElement('div'); wrap.className='ed-el'+((!previewMode&&id===selectedElement)?' selected':'');", "var wrap=document.createElement('div'); wrap.className='ed-el'+((!previewMode&&id===selectedElement)?' selected':''); wrap.dataset.elId=id; wrap.dataset.panelKey=key;")

# Make drag/resize direct-DOM and grid-snapped instead of rebuilding the stage every pixel.
pat = re.compile(r"  function startDrag\(e, p, el\) \{.*?\n  function startResize", re.S)
replacement = """  function startDrag(e, p, el) {
    if (el.locked) return;
    v5Checkpoint();
    var sx=e.clientX, sy=e.clientY, ox=el.x, oy=el.y, sz=stagePx(), pw=sz.w*p.width/100, ph=sz.h*p.height/100;
    var node=e.target.closest('.ed-el');
    function m(ev){
      var dx=(ev.clientX-sx)/pw*100, dy=(ev.clientY-sy)/ph*100;
      el.x=v5SnapValue(Math.max(0,Math.min(100-el.width,ox+dx)));
      el.y=v5SnapValue(Math.max(0,Math.min(100-el.height,oy+dy)));
      if(node){node.style.left=el.x+'%';node.style.top=el.y+'%';}
    }
    function u(){document.removeEventListener('mousemove',m);document.removeEventListener('mouseup',u);renderAll();}
    document.addEventListener('mousemove',m); document.addEventListener('mouseup',u);
  }
  function startResize"""
s, n = pat.subn(replacement, s, count=1)
if n != 1:
    raise SystemExit('Could not patch startDrag')

pat = re.compile(r"  function startResize\(e, p, el\) \{.*?\n  function startRotate", re.S)
replacement = """  function startResize(e, p, el) {
    if (el.locked) return;
    v5Checkpoint();
    var sx=e.clientX, sy=e.clientY, ow=el.width, oh=el.height, sz=stagePx(), pw=sz.w*p.width/100, ph=sz.h*p.height/100;
    var node=e.target.closest('.ed-el');
    function m(ev){
      var dw=(ev.clientX-sx)/pw*100, dh=(ev.clientY-sy)/ph*100;
      el.width=v5SnapValue(Math.max(4,Math.min(100-el.x,ow+dw)));
      el.height=v5SnapValue(Math.max(4,Math.min(100-el.y,oh+dh)));
      if(node){node.style.width=el.width+'%';node.style.height=el.height+'%';}
    }
    function u(){document.removeEventListener('mousemove',m);document.removeEventListener('mouseup',u);renderAll();}
    document.addEventListener('mousemove',m); document.addEventListener('mouseup',u);
  }
  function startRotate"""
s, n = pat.subn(replacement, s, count=1)
if n != 1:
    raise SystemExit('Could not patch startResize')

# Responsive rotation + Shift=15deg, Alt=5deg snapping + live angle display.
pat = re.compile(r"  function startRotate\(e, p, el, wrapNode\) \{.*?\n\}\n\n  function renderProps", re.S)
replacement = """  function startRotate(e, p, el, wrapNode) {
    if (el.locked) return;
    e.preventDefault(); v5Checkpoint();
    var r=wrapNode.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
    function angle(ev){return Math.atan2(ev.clientY-cy,ev.clientX-cx)*180/Math.PI+90;}
    function m(ev){
      var step=ev.shiftKey?15:(ev.altKey?5:1);
      el.rotation=Math.round(angle(ev)/step)*step;
      wrapNode.style.transform='rotate('+el.rotation+'deg)';
      document.getElementById('statusLine').textContent='Rotation: '+el.rotation+' degrees'+(ev.shiftKey?' (15 degree snap)':(ev.altKey?' (5 degree snap)':''));
    }
    function u(){document.removeEventListener('mousemove',m);document.removeEventListener('mouseup',u);renderAll();}
    m(e); document.addEventListener('mousemove',m); document.addEventListener('mouseup',u);
  }

  function renderProps"""
s, n = pat.subn(replacement, s, count=1)
if n != 1:
    raise SystemExit('Could not patch startRotate')

# Inject the v5 editor layer immediately before renderAll(), where it can access editor-local state.
marker = "  function renderAll() {"
if marker not in s:
    raise SystemExit('renderAll marker missing')

v5 = r'''  // ---- SuperGUI v5 editor layer -------------------------------------------------
  var v5Undo=[], v5Redo=[], v5Selection=new Set(), v5Clipboard=[], v5Zoom=1, v5Snap=1, v5Filter='', v5HistoryLimit=60;
  var v5DraftKey='supergui_editor_draft_v5', v5HistoryKey='supergui_editor_history_v5';
  function v5Clone(v){return JSON.parse(JSON.stringify(v));}
  function v5Snapshot(){return JSON.stringify(config);}
  function v5Checkpoint(){
    var snap=v5Snapshot();
    if(!v5Undo.length||v5Undo[v5Undo.length-1]!==snap){v5Undo.push(snap);if(v5Undo.length>v5HistoryLimit)v5Undo.shift();}
    v5Redo=[];
    try{localStorage.setItem(v5DraftKey,snap);localStorage.setItem(v5HistoryKey,JSON.stringify(v5Undo.slice(-10)));}catch(e){}
  }
  function v5Restore(snap){try{config=JSON.parse(snap);selectedPanel=config.panelOrder[0]||null;selectedElement=null;v5Selection.clear();renderAll();}catch(e){toast('Could not restore history');}}
  function v5UndoNow(){if(!v5Undo.length)return;var current=v5Snapshot(),target=v5Undo.pop();if(target===current&&v5Undo.length)target=v5Undo.pop();v5Redo.push(current);v5Restore(target);}
  function v5RedoNow(){if(!v5Redo.length)return;var current=v5Snapshot(),target=v5Redo.pop();v5Undo.push(current);v5Restore(target);}
  function v5SnapValue(v){var g=Number(v5Snap)||0;return g?Math.round(v/g)*g:v;}
  function v5Ids(){var a=Array.from(v5Selection);if(!a.length&&selectedElement)a=[selectedElement];return a;}
  function v5Els(){var panel=config.panels[selectedPanel];if(!panel)return[];return v5Ids().map(function(id){return{id:id,el:panel.elements[id]};}).filter(function(x){return!!x.el;});}
  function v5SelectOnly(id){v5Selection.clear();if(id)v5Selection.add(id);selectedElement=id||null;}
  function v5Unique(base){var id=base||'Element',n=2;while(allIds().indexOf(id)!==-1)id=(base||'Element')+(n++);return id;}

  function v5Duplicate(){
    var panel=config.panels[selectedPanel],items=v5Els();if(!panel||!items.length)return;v5Checkpoint();v5Selection.clear();
    items.forEach(function(it){var id=v5Unique(it.id+'Copy'),el=v5Clone(it.el);el.x=Math.min(96,(Number(el.x)||0)+2);el.y=Math.min(96,(Number(el.y)||0)+2);panel.elements[id]=el;panel.elementOrder.push(id);v5Selection.add(id);selectedElement=id;});renderAll();
  }
  function v5Copy(){v5Clipboard=v5Els().map(function(it){return{id:it.id,el:v5Clone(it.el)};});toast(v5Clipboard.length+' element(s) copied');}
  function v5Paste(){var panel=config.panels[selectedPanel];if(!panel||!v5Clipboard.length)return;v5Checkpoint();v5Selection.clear();v5Clipboard.forEach(function(it){var id=v5Unique(it.id+'Copy'),el=v5Clone(it.el);el.x=Math.min(96,(Number(el.x)||0)+2);el.y=Math.min(96,(Number(el.y)||0)+2);panel.elements[id]=el;panel.elementOrder.push(id);v5Selection.add(id);selectedElement=id;});renderAll();}
  function v5DeleteSelected(){var panel=config.panels[selectedPanel],ids=v5Ids();if(!panel||!ids.length)return;v5Checkpoint();ids.forEach(function(id){delete panel.elements[id];panel.elementOrder=panel.elementOrder.filter(function(x){return x!==id;});});v5Selection.clear();selectedElement=null;renderAll();}

  function v5Align(mode){
    var items=v5Els();if(items.length<2)return;v5Checkpoint();
    var minX=Math.min.apply(null,items.map(function(x){return x.el.x;})),maxX=Math.max.apply(null,items.map(function(x){return x.el.x+x.el.width;}));
    var minY=Math.min.apply(null,items.map(function(x){return x.el.y;})),maxY=Math.max.apply(null,items.map(function(x){return x.el.y+x.el.height;}));
    items.forEach(function(x){var e=x.el;if(mode==='left')e.x=minX;else if(mode==='right')e.x=maxX-e.width;else if(mode==='top')e.y=minY;else if(mode==='bottom')e.y=maxY-e.height;else if(mode==='hcenter')e.x=(minX+maxX-e.width)/2;else if(mode==='vcenter')e.y=(minY+maxY-e.height)/2;});renderAll();
  }
  function v5Distribute(axis){
    var items=v5Els();if(items.length<3)return;v5Checkpoint();
    items.sort(function(a,b){return axis==='h'?a.el.x-b.el.x:a.el.y-b.el.y;});
    var first=items[0].el,last=items[items.length-1].el,start=axis==='h'?first.x:first.y,end=axis==='h'?last.x:last.y,step=(end-start)/(items.length-1);
    items.forEach(function(x,i){if(axis==='h')x.el.x=start+step*i;else x.el.y=start+step*i;});renderAll();
  }
  function v5Nudge(dx,dy){var items=v5Els();if(!items.length)return;v5Checkpoint();items.forEach(function(x){x.el.x=Math.max(0,Math.min(100-x.el.width,x.el.x+dx));x.el.y=Math.max(0,Math.min(100-x.el.height,x.el.y+dy));});renderAll();}

  function v5SavePreset(){var it=v5Els()[0];if(!it)return;var name=prompt('Preset name?',it.id);if(!name)return;try{localStorage.setItem('supergui_v5_preset_'+name,JSON.stringify(it.el));toast('Preset saved');}catch(e){toast('Could not save preset');}}
  function v5InsertPreset(){var name=prompt('Preset name to insert?');if(!name)return;var raw;try{raw=localStorage.getItem('supergui_v5_preset_'+name);}catch(e){}if(!raw){toast('Preset not found');return;}var panel=config.panels[selectedPanel];if(!panel)return;v5Checkpoint();try{var el=JSON.parse(raw),id=v5Unique(name.replace(/[^a-z0-9_]/gi,'')||'Preset');panel.elements[id]=el;panel.elementOrder.push(id);v5SelectOnly(id);renderAll();}catch(e){toast('Invalid preset');}}
  function v5ExportComponent(){var items=v5Els();if(!items.length)return;var data={superguiComponent:1,elements:items};var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='supergui-component.json';a.click();URL.revokeObjectURL(url);}
  function v5ImportComponentFile(file){var panel=config.panels[selectedPanel];if(!panel||!file)return;var r=new FileReader();r.onload=function(){try{var data=JSON.parse(r.result),items=data.elements||[];v5Checkpoint();v5Selection.clear();items.forEach(function(it){var id=v5Unique(it.id||'Imported');panel.elements[id]=v5Clone(it.el||it);panel.elementOrder.push(id);v5Selection.add(id);selectedElement=id;});renderAll();toast('Component imported');}catch(e){toast('Invalid component file');}};r.readAsText(file);}

  function v5GroupLogical(){var ids=v5Ids();if(ids.length<2)return;var name=prompt('Group name?','Group');if(!name)return;v5Checkpoint();var panel=config.panels[selectedPanel];ids.forEach(function(id){if(panel.elements[id])panel.elements[id].editorGroup=name;});toast('Grouped '+ids.length+' elements as '+name);renderAll();}
  function v5SelectGroup(){var panel=config.panels[selectedPanel],it=panel&&panel.elements[selectedElement];if(!it||!it.editorGroup)return;v5Selection.clear();panel.elementOrder.forEach(function(id){if(panel.elements[id]&&panel.elements[id].editorGroup===it.editorGroup)v5Selection.add(id);});renderAll();}

  function v5AppendProps(){
    var panel=config.panels[selectedPanel],el=panel&&panel.elements[selectedElement],props=document.getElementById('props');if(!el||!props||props.querySelector('[data-v5-props]'))return;
    var box=document.createElement('div');box.dataset.v5Props='1';var h=document.createElement('h2');h.textContent='V5 Layout / Responsive';box.appendChild(h);
    function field(label,type,value,change,options){var d=document.createElement('div');d.className='field';var l=document.createElement('label');l.textContent=label;d.appendChild(l);var i=document.createElement(type==='select'?'select':'input');if(type==='select'){(options||[]).forEach(function(o){var op=document.createElement('option');op.value=o;op.textContent=o;if(o===value)op.selected=true;i.appendChild(op);});i.onchange=function(){v5Checkpoint();change(i.value);renderStage();};}else if(type==='checkbox'){i.type='checkbox';i.checked=!!value;i.onchange=function(){v5Checkpoint();change(i.checked);renderStage();};}else{i.type=type;i.value=value;i.oninput=function(){change(type==='number'?Number(i.value):i.value);renderStage();};i.onfocus=function(){v5Checkpoint();};}d.appendChild(i);box.appendChild(d);}
    field('Anchor','select',el.anchor||'none',function(v){el.anchor=v;el.anchorOffsets={left:el.x,top:el.y,right:100-el.x-el.width,bottom:100-el.y-el.height};},['none','top-left','top','top-right','left','center','right','bottom-left','bottom','bottom-right']);
    field('Auto size','checkbox',el.autoSize,function(v){el.autoSize=v;});field('Wrap text','checkbox',el.wrapText,function(v){el.wrapText=v;});
    var containers=panel.elementOrder.filter(function(id){return panel.elements[id]&&panel.elements[id].type==='container'&&id!==selectedElement;});
    field('Parent container','select',el.parentContainer||'',function(v){panel.elementOrder.forEach(function(id){var c=panel.elements[id];if(c&&Array.isArray(c.children))c.children=c.children.filter(function(x){return x!==selectedElement;});});el.parentContainer=v;if(v){var c=panel.elements[v];c.children=Array.isArray(c.children)?c.children:[];if(c.children.indexOf(selectedElement)===-1)c.children.push(selectedElement);}},[''].concat(containers));
    if(el.type==='container'){
      field('Layout','select',el.layoutMode||'vertical',function(v){el.layoutMode=v;},['free','vertical','horizontal','grid']);field('Gap px','number',el.layoutGap||0,function(v){el.layoutGap=v;});field('Padding px','number',el.layoutPadding||0,function(v){el.layoutPadding=v;});field('Overflow','select',el.layoutOverflow||'auto',function(v){el.layoutOverflow=v;},['visible','hidden','scroll','auto']);field('Align','select',el.layoutAlign||'stretch',function(v){el.layoutAlign=v;},['start','center','end','stretch']);field('Justify','select',el.layoutJustify||'start',function(v){el.layoutJustify=v;},['start','center','end','space-between','space-around','space-evenly']);field('Wrap','checkbox',el.layoutWrap,function(v){el.layoutWrap=v;});field('Grid columns','number',el.layoutColumns||2,function(v){el.layoutColumns=Math.max(1,Math.round(v||1));});
    }
    props.appendChild(box);
  }

  function v5BuildUI(){
    var tb=document.querySelector('.toolbar');if(!tb||document.getElementById('v5Undo'))return;
    function btn(id,text,fn){var b=document.createElement('button');b.id=id;b.textContent=text;b.dataset.v5Nohistory='1';b.onclick=fn;tb.appendChild(b);return b;}
    btn('v5Undo','Undo',v5UndoNow);btn('v5Redo','Redo',v5RedoNow);btn('v5Duplicate','Duplicate',v5Duplicate);btn('v5Group','Group',v5GroupLogical);btn('v5SelectGroup','Select Group',v5SelectGroup);
    var al=document.createElement('select');al.innerHTML='<option value="">Align...</option><option value="left">Left</option><option value="right">Right</option><option value="top">Top</option><option value="bottom">Bottom</option><option value="hcenter">H Center</option><option value="vcenter">V Center</option>';al.onchange=function(){if(al.value)v5Align(al.value);al.value='';};tb.appendChild(al);
    var ds=document.createElement('select');ds.innerHTML='<option value="">Distribute...</option><option value="h">Horizontal</option><option value="v">Vertical</option>';ds.onchange=function(){if(ds.value)v5Distribute(ds.value);ds.value='';};tb.appendChild(ds);
    var snap=document.createElement('select');snap.title='Snap grid';['0','0.5','1','2','5','10'].forEach(function(v){var o=document.createElement('option');o.value=v;o.textContent='Snap '+v+'%';if(v==='1')o.selected=true;snap.appendChild(o);});snap.onchange=function(){v5Snap=Number(snap.value)||0;};tb.appendChild(snap);
    btn('v5ZoomOut','Zoom -',function(){v5Zoom=Math.max(.5,v5Zoom-.1);v5AfterRender();});btn('v5ZoomIn','Zoom +',function(){v5Zoom=Math.min(2.5,v5Zoom+.1);v5AfterRender();});
    btn('v5PresetSave','Save Preset',v5SavePreset);btn('v5PresetAdd','Insert Preset',v5InsertPreset);btn('v5ExportComp','Export Component',v5ExportComponent);
    var imp=document.createElement('input');imp.type='file';imp.accept='application/json';imp.style.display='none';imp.id='v5ImportFile';imp.onchange=function(){v5ImportComponentFile(imp.files[0]);imp.value='';};tb.appendChild(imp);btn('v5ImportComp','Import Component',function(){imp.click();});
    btn('v5Recover','Recover Draft',function(){var raw;try{raw=localStorage.getItem(v5DraftKey);}catch(e){}if(raw&&confirm('Restore the latest editor draft?'))v5Restore(raw);});
    var sidebar=document.querySelector('.sidebar'),list=document.getElementById('elementList');if(sidebar&&list&&!document.getElementById('v5Search')){var search=document.createElement('input');search.id='v5Search';search.placeholder='Filter elements...';search.style.cssText='width:100%;padding:6px;background:var(--panel2);border:1px solid var(--border);color:var(--text);border-radius:5px;';search.oninput=function(){v5Filter=search.value.toLowerCase();v5FilterList();};sidebar.insertBefore(search,list);}
  }
  function v5FilterList(){var list=document.getElementById('elementList');if(!list)return;Array.prototype.forEach.call(list.children,function(row){row.style.display=!v5Filter||row.textContent.toLowerCase().indexOf(v5Filter)!==-1?'flex':'none';});}
  function v5EnhanceLayers(){
    var list=document.getElementById('elementList');if(!list)return;
    Array.prototype.forEach.call(list.querySelectorAll('[data-el-id]'),function(row){
      row.ondragstart=function(e){e.dataTransfer.setData('text/supergui-el',row.dataset.elId);};
      row.ondragover=function(e){e.preventDefault();};
      row.ondrop=function(e){e.preventDefault();var from=e.dataTransfer.getData('text/supergui-el'),to=row.dataset.elId,panel=config.panels[selectedPanel];if(!from||!to||from===to||!panel)return;v5Checkpoint();var order=panel.elementOrder.filter(function(x){return x!==from;}),idx=order.indexOf(to);order.splice(idx,0,from);panel.elementOrder=order;renderAll();};
    });
  }
  function v5AfterRender(){
    v5BuildUI();var stage=document.getElementById('stage');if(stage){stage.style.transform='scale('+v5Zoom+')';stage.style.transformOrigin='center center';}
    Array.prototype.forEach.call(document.querySelectorAll('.ed-el[data-el-id]'),function(n){if(v5Selection.has(n.dataset.elId))n.classList.add('selected');var panel=config.panels[n.dataset.panelKey],el=panel&&panel.elements[n.dataset.elId];if(el&&el.type==='container'){n.style.outline='2px dotted #7c8bf0';var inner=n.querySelector('.inner');if(inner){inner.textContent=(el.layoutMode||'vertical')+' container';inner.style.color='#9aa0b4';inner.style.fontSize='10px';inner.style.display='flex';inner.style.alignItems='center';inner.style.justifyContent='center';}}});
    v5FilterList();v5EnhanceLayers();v5AppendProps();
  }

  document.addEventListener('mousedown',function(e){
    if(e.target.closest&&e.target.closest('[data-v5-nohistory]'))return;
    var node=e.target.closest&&e.target.closest('.ed-el[data-el-id]');
    if(node&&!e.target.closest('.handle')&&!e.target.closest('.rothandle')){
      var id=node.dataset.elId;if(e.shiftKey||e.metaKey||e.ctrlKey){e.preventDefault();e.stopImmediatePropagation();selectedPanel=node.dataset.panelKey;selectedElement=id;if(v5Selection.has(id))v5Selection.delete(id);else v5Selection.add(id);renderAll();return;}v5Selection.clear();v5Selection.add(id);
    }
  },true);

  document.addEventListener('keydown',function(e){
    var tag=(e.target&&e.target.tagName)||'';if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT')return;
    var mod=e.ctrlKey||e.metaKey;
    if(mod&&e.key.toLowerCase()==='z'){e.preventDefault();if(e.shiftKey)v5RedoNow();else v5UndoNow();return;}
    if(mod&&e.key.toLowerCase()==='y'){e.preventDefault();v5RedoNow();return;}
    if(mod&&e.key.toLowerCase()==='c'){e.preventDefault();v5Copy();return;}
    if(mod&&e.key.toLowerCase()==='v'){e.preventDefault();v5Paste();return;}
    if(mod&&e.key.toLowerCase()==='d'){e.preventDefault();v5Duplicate();return;}
    if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();v5DeleteSelected();return;}
    var step=e.shiftKey?5:1;if(e.key==='ArrowLeft'){e.preventDefault();v5Nudge(-step,0);}else if(e.key==='ArrowRight'){e.preventDefault();v5Nudge(step,0);}else if(e.key==='ArrowUp'){e.preventDefault();v5Nudge(0,-step);}else if(e.key==='ArrowDown'){e.preventDefault();v5Nudge(0,step);}
  });
  setInterval(function(){try{localStorage.setItem(v5DraftKey,v5Snapshot());}catch(e){}},5000);

'''
s = s.replace(marker, v5 + marker, 1)

# Ensure all enhanced UI is reapplied after the editor's normal rerender.
s = s.replace("    renderPanelList(); renderElementList(); renderStage(); renderProps();\n  }", "    renderPanelList(); renderElementList(); renderStage(); renderProps(); v5AfterRender();\n  }", 1)

p.write_text(s)
print('Applied SuperGUI v5 source/editor upgrades')
