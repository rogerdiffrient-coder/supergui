// Self-contained popup editor document.
export const SUPERGUI_EDITOR_HTML = String.raw`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>SuperGUI Editor</title>
<style>
:root { --bg:#1b1e29; --panel:#232735; --panel2:#2b2f3f; --border:#3a3f52; --accent:#5B6EE1; --accent2:#7c8bf0; --text:#e7e9f2; --text-dim:#9aa0b4; --danger:#e15b6e; }
* { box-sizing:border-box; } html, body { margin:0; height:100%; }
body { display:flex; flex-direction:column; background:var(--bg); color:var(--text); font-family:Inter,'Segoe UI',Arial,sans-serif; overflow:hidden; }
body.collapsed .layout { display:none; }
header { display:flex; align-items:center; gap:8px; padding:10px 14px; background:linear-gradient(135deg,var(--panel),#292e42); border-bottom:1px solid var(--border); flex-wrap:wrap; box-shadow:0 4px 18px #0004; z-index:2; }
header h1 { font-size:15px; margin:0; font-weight:700; color:var(--accent2); flex:1; letter-spacing:.01em; }
button { background:var(--panel2); color:var(--text); border:1px solid var(--border); padding:6px 11px; border-radius:7px; cursor:pointer; font-size:12px; transition:border-color .15s,background .15s,transform .15s; }
button:hover { border-color:var(--accent); background:#34394d; }
button:active { transform:translateY(1px); }
button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline:2px solid var(--accent2); outline-offset:1px; }
button.primary { background:var(--accent); border-color:var(--accent); color:#fff; }
button.danger { color:var(--danger); }
button.chrome { width:26px; height:26px; padding:0; font-size:14px; }
.layout { flex:1; display:flex; min-height:0; }
.sidebar { width:250px; background:var(--panel); border-right:1px solid var(--border); display:flex; flex-direction:column; padding:12px; gap:6px; overflow-y:auto; }
.sidebar h2 { font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:var(--text-dim); margin:8px 0 4px; }
.list-item { display:flex; align-items:center; gap:4px; padding:6px 7px; margin-bottom:3px; border-radius:7px; background:var(--panel2); cursor:pointer; font-size:12px; border:1px solid transparent; transition:border-color .15s,transform .15s; }
.list-item:hover { border-color:#50566c; transform:translateX(1px); }
.list-item.selected { border-color:var(--accent); box-shadow:0 0 0 1px #5b6ee133; }
.list-item span.name { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.list-item button { padding:1px 5px; font-size:10px; }
.center { flex:1; display:flex; flex-direction:column; min-width:0; }
.toolbar { display:flex; gap:6px; padding:8px 10px; background:var(--panel); border-bottom:1px solid var(--border); flex-wrap:wrap; align-items:center; }
.canvas-area { flex:1; display:flex; align-items:center; justify-content:center; overflow:auto; background:repeating-conic-gradient(#20232e 0% 25%,#1b1e29 0% 50%) 0 0/20px 20px; }
#stage { position:relative; width:480px; height:360px; background:#10131c; border:2px solid var(--border); border-radius:5px; overflow:hidden; flex-shrink:0; box-shadow:0 18px 45px #0008; }
.ed-panel { position:absolute; box-sizing:border-box; overflow:hidden; }
.ed-el { position:absolute; box-sizing:border-box; border:1px dashed transparent; cursor:move; }
.ed-el.selected { border-color:var(--accent2); }
.ed-el .handle { position:absolute; width:10px; height:10px; right:-5px; bottom:-5px; background:var(--accent2); border-radius:2px; cursor:nwse-resize; }
.ed-el .rothandle { position:absolute; width:10px; height:10px; left:50%; top:-16px; margin-left:-5px; background:#ffd166; border-radius:50%; cursor:grab; }
.ed-el .inner { width:100%; height:100%; pointer-events:none; overflow:hidden; }
.props { width:320px; background:var(--panel); border-left:1px solid var(--border); padding:10px; overflow-y:auto; }
.props h2 { font-size:11px; text-transform:uppercase; color:var(--text-dim); margin:12px 0 6px; }
.props h2:first-child { margin-top:0; }
.field { margin-bottom:8px; }
.field label { display:block; font-size:11px; color:var(--text-dim); margin-bottom:3px; }
.field input[type=text], .field input[type=number], .field select, .field textarea { width:100%; padding:5px 6px; background:var(--panel2); border:1px solid var(--border); color:var(--text); border-radius:5px; font-size:12px; }
.field textarea { resize:vertical; min-height:50px; font-family:monospace; }
.field input[type=color] { width:100%; height:26px; border:1px solid var(--border); border-radius:5px; background:var(--panel2); padding:2px; }
.field.row { display:flex; gap:6px; }
.field.row > div { flex:1; }
.field.checkbox { display:flex; align-items:center; gap:6px; }
.field.checkbox label { margin:0; }
.empty-hint { color:var(--text-dim); font-size:12px; padding:10px; text-align:center; }
#fileImport { display:none; }
.toast { position:fixed; bottom:16px; left:50%; transform:translateX(-50%); background:var(--accent); color:#fff; padding:8px 16px; border-radius:6px; font-size:13px; opacity:0; transition:opacity .2s; pointer-events:none; }
.toast.show { opacity:1; }
select#addElementType { width:100%; padding:5px 6px; background:var(--panel2); border:1px solid var(--border); color:var(--text); border-radius:5px; font-size:12px; }
select#addElementType optgroup { color:var(--accent2); font-weight:700; }
select#addElementType option { color:var(--text); font-weight:400; }
.art-preview { display:flex; gap:4px; margin-top:4px; }
.art-preview .art-box { width:50px; height:30px; background:#1b1e29; border:1px solid var(--border); border-radius:4px; background-size:100% 100%; background-repeat:no-repeat; }
</style></head>
<body>
<header>
  <h1>SuperGUI Editor</h1>
  <button id="btnAddPanel">+ Panel</button>
  <button id="btnPreview">Preview</button>
  <button id="btnImport">Import</button>
  <button id="btnExport">Export</button>
  <button id="btnSave" class="primary">Save</button>
  <button id="btnMin" class="chrome" title="Minimize">-</button>
  <button id="btnClose" class="chrome danger" title="Close" style="display:none">×</button>
  <input type="file" id="fileImport" accept="application/json">
</header>
<div class="layout">
  <div class="sidebar">
    <h2>Panels</h2>
    <div id="panelList"></div>
    <h2>Add element</h2>
    <select id="addElementType" aria-label="Element type">
      <optgroup label="Basic controls">
        <option value="label">Label</option><option value="button">Button</option>
        <option value="textinput">Text Input</option><option value="numberinput">Number Input</option>
        <option value="checkbox">Checkbox</option><option value="switch">Switch</option>
        <option value="slider">Slider</option><option value="knob">Knob</option>
      </optgroup>
      <optgroup label="Choices & navigation">
        <option value="dropdown">Dropdown</option><option value="radio">Radio Group</option>
        <option value="selector">Selector</option><option value="tabs">Tabs</option>
        <option value="accordion">Accordion</option><option value="search">Search</option>
        <option value="carousel">Carousel</option>
      </optgroup>
      <optgroup label="Status & feedback">
        <option value="progressbar">Progress Bar</option><option value="counter">Counter</option>
        <option value="badge">Badge</option><option value="spinner">Loading Spinner</option>
        <option value="rating">Star Rating</option><option value="healthbar">Health Bar</option>
        <option value="achievement">Achievement Card</option><option value="leaderboard">Leaderboard</option>
        <option value="tooltip">Tooltip</option><option value="divider">Divider</option>
      </optgroup>
      <optgroup label="Media & visuals">
        <option value="image">Image</option><option value="imagebutton">Image Button</option>
        <option value="background">Background</option><option value="video">Video</option>
        <option value="colorpicker">Color Picker</option><option value="code">Code Display</option>
        <option value="particles">Particles</option><option value="canvas">Canvas</option>
        <option value="container">Layout Container</option>
      </optgroup>
      <optgroup label="Game input">
        <option value="joystick">Joystick</option><option value="dpad">D-Pad</option>
      </optgroup>
    </select>
    <button id="btnAddElement" class="primary" style="margin-top:4px;">+ Add</button>
    <h2>Elements in panel</h2>
    <div id="elementList"></div>
  </div>
  <div class="center">
    <div class="toolbar"><span id="statusLine" style="font-size:12px;color:var(--text-dim);">No panel selected</span></div>
    <div class="canvas-area"><div id="stage"></div></div>
  </div>
  <div class="props" id="props"><div class="empty-hint">Select a panel or element to edit its properties.</div></div>
</div>
<div class="toast" id="toast"></div>
<script>
(function () {
  var ext = (window.parent && window.parent.__superGUIInstance) || (window.opener && window.opener.__superGUIInstance);
  if (!ext) { document.body.innerHTML = '<div style="padding:40px;color:#e7e9f2;background:#1b1e29;height:100vh;font-family:sans-serif;">SuperGUI editor could not connect to the extension.</div>'; return; }
  var config = JSON.parse(JSON.stringify(ext.config));
  var selectedPanel = config.panelOrder[0] || null;
  var selectedElement = null;
  var previewMode = false;

  function uid(p) { return p + '_' + Math.random().toString(36).slice(2, 9); }
  function defaultPanelStyle() { return { background:'#232735', borderColor:'#4a4f5e', borderWidth:2, borderRadius:10, padding:10, opacity:1 }; }
  function defaultElementStyle() { return { color:'#ffffff', background:'#3a3f52', borderColor:'#5B6EE1', borderWidth:1, borderRadius:6, padding:4, fontSize:14, fontWeight:'normal', textAlign:'left', opacity:1 }; }
  function defaultElement(t) {
    var b = { type:t, x:10, y:10, width:40, height:10, rotation:0, zIndex:((config.nextZ=(config.nextZ||1)+1)), locked:false, runtimeDraggable:false, hidden:false, disabled:false, style:defaultElementStyle() };
    if (t==='label') b.text='Label';
    else if (t==='button') b.text='Button';
    else if (t==='slider') { b.min=0; b.max=100; b.step=1; b.value=50; }
    else if (t==='checkbox') { b.text='Checkbox'; b.checked=false; b.height=8; }
    else if (t==='dropdown') { b.options=['A','B']; b.selected='A'; }
    else if (t==='textinput') { b.placeholder=''; b.value=''; }
    else if (t==='numberinput') { b.min=0; b.max=100; b.step=1; b.value=0; }
    else if (t==='image') { b.src=''; b.flipH=false; b.flipV=false; b.tint='#ffffff'; }
    else if (t==='background') { b.src=''; b.parallax=0; b.blur=0; b.sizeMode='cover'; b.color='#10131c'; b.x=0; b.y=0; b.width=100; b.height=100; }
    else if (t==='progressbar') { b.value=50; b.min=0; b.max=100; b.indeterminate=false; b.barColor='#5B6EE1'; b.trackColor='#3a3f52'; }
    else if (t==='switch') { b.on=false; b.onColor='#5B6EE1'; b.offColor='#5a5f72'; }
    else if (t==='radio') { b.options=['A','B','C']; b.selected='A'; b.orientation='vertical'; }
    else if (t==='colorpicker') b.value='#5B6EE1';
    else if (t==='selector') { b.rows=3; b.cols=5; b.cellGap=4; b.cells=[]; b.selectedIndex=0; b.width=50; b.height=50; }
    else if (t==='search') { b.placeholder='Search...'; b.value=''; b.results=[]; b.width=50; b.height=10; }
    else if (t==='imagebutton') { b.image=''; b.hoverImage=''; b.pressedImage=''; b.scaleOnPress=0.95; b.width=30; b.height=30; }
    else if (t==='counter') { b.value=0; b.prefix=''; b.suffix=''; b.decimals=0; b.format='normal'; }
    else if (t==='badge') { b.count=0; b.max=99; b.color='#e15b6e'; b.visible=true; b.width=8; b.height=8; }
    else if (t==='spinner') { b.size=24; b.color='#5B6EE1'; b.speed=1; b.visible=true; b.width=12; b.height=12; }
    else if (t==='divider') { b.orientation='horizontal'; b.thickness=1; b.color='#5a5f72'; b.width=50; b.height=1; }
    else if (t==='video') { b.src=''; b.autoplay=false; b.loop=false; b.muted=true; b.controls=false; b.volume=1; b.width=50; b.height=35; }
    else if (t==='rating') { b.value=0; b.max=5; b.icon='★'; b.color='#ffd166'; b.width=25; b.height=8; }
    else if (t==='healthbar') { b.segments=10; b.filled=10; b.orientation='horizontal'; b.fgColor='#5B6EE1'; b.bgColor='#3a3f52'; b.emptyColor='#1f2230'; b.leftArt=''; b.midArt=''; b.rightArt=''; b.artMode='image'; b.width=50; b.height=10; }
    else if (t==='joystick') { b.knobX=0; b.knobY=0; b.radius=35; b.knobColor='#5B6EE1'; b.baseColor='#3a3f52'; b.deadzone=0.1; b.width=30; b.height=30; }
    else if (t==='dpad') { b.direction='none'; b.size=30; b.color='#5B6EE1'; b.width=30; b.height=30; }
    else if (t==='tabs') { b.tabs=['Tab 1','Tab 2','Tab 3']; b.activeTab=0; b.width=60; b.height=25; }
    else if (t==='accordion') { b.items=[{title:'Section 1',content:'Content 1',open:false}]; b.multiOpen=false; b.width=50; b.height=35; }
    else if (t==='knob') { b.value=0; b.min=0; b.max=100; b.step=1; b.color='#5B6EE1'; b.width=18; b.height=18; }
    else if (t==='carousel') { b.slides=[{image:'',text:'Slide 1'}]; b.current=0; b.autoPlay=false; b.interval=3000; b.width=60; b.height=40; }
    else if (t==='code') { b.code='// code'; b.theme='dark'; b.width=50; b.height=30; }
    else if (t==='particles') { b.color='#ffffff'; b.count=20; b.speed=2; b.lifetime=1; b.gravity=0; b.size=3; b.width=40; b.height=40; }
    else if (t==='canvas') { b.width=50; b.height=30; }
    else if (t==='container') { b.layoutMode='vertical'; b.layoutGap=8; b.layoutPadding=8; b.layoutOverflow='auto'; b.layoutAlign='stretch'; b.layoutJustify='start'; b.layoutWrap=false; b.layoutColumns=2; b.children=[]; b.width=60; b.height=55; }
    else if (t==='tooltip') { b.text='Tooltip'; b.position='top'; b.delay=500; b.background='#232735'; b.textColor='#ffffff'; b.width=18; b.height=6; }
    else if (t==='achievement') { b.achievementId=''; b.title='Achievement unlocked!'; b.description='A new milestone reached'; b.icon='🏆'; b.points=10; b.progress=1; b.target=1; b.unlocked=true; b.accent='#ffd166'; b.width=58; b.height=18; }
    else if (t==='leaderboard') { b.boardId='main'; b.title='Leaderboard'; b.entries=[{player:'Player 1',score:100},{player:'Player 2',score:75},{player:'Player 3',score:50}]; b.maxVisible=5; b.highlightPlayer='Player 1'; b.accent='#5B6EE1'; b.width=52; b.height=55; }
    return b;
  }
  function defaultPanel() { return { name:'Panel', x:20, y:20, width:50, height:50, visible:true, minimized:false, draggable:false, titleBar:false, backgroundImage:'', zIndex:((config.nextZ=(config.nextZ||1)+1)), modal:false, style:defaultPanelStyle(), elementOrder:[], elements:{} }; }

  function toast(m) { var t=document.getElementById('toast'); t.textContent=m; t.className='toast show'; setTimeout(function(){t.className='toast';},1400); }

  function allIds() { var ids=[]; config.panelOrder.forEach(function(k){var p=config.panels[k]; if(p) ids=ids.concat(p.elementOrder);}); return ids; }
  function uniquePanelName(b) { var n=b,i=1; var ex=config.panelOrder.map(function(k){return config.panels[k].name;}); while(ex.indexOf(n)!==-1) n=b+' '+(++i); return n; }
  function uniqueElId(b) { var id=b,i=1,ex=allIds(); while(ex.indexOf(id)!==-1) id=b+(++i); return id; }

  function addPanel() { var key=uid('panel'); var p=defaultPanel(); p.name=uniquePanelName('Panel'); config.panels[key]=p; config.panelOrder.push(key); selectedPanel=key; selectedElement=null; renderAll(); }
  function deletePanel(k) { if (!confirm('Delete this panel and all its elements?')) return; delete config.panels[k]; config.panelOrder=config.panelOrder.filter(function(x){return x!==k;}); if (selectedPanel===k) selectedPanel=config.panelOrder[0]||null; selectedElement=null; renderAll(); }
  function renderPanelList() {
    var list=document.getElementById('panelList'); list.innerHTML='';
    config.panelOrder.forEach(function(key){
      var p=config.panels[key];
      var row=document.createElement('div'); row.className='list-item'+(key===selectedPanel?' selected':'');
      var sp=document.createElement('span'); sp.className='name'; sp.textContent=p.name; row.appendChild(sp);
      var del=document.createElement('button'); del.textContent='×'; del.className='danger';
      del.onclick=function(e){e.stopPropagation(); deletePanel(key);};
      row.appendChild(del);
      row.onclick=function(){selectedPanel=key; selectedElement=null; renderAll();};
      row.ondblclick=function(){ var n=prompt('Panel name:', p.name); if (n&&n.trim()){ var o=config.panelOrder.filter(function(k){return k!==key;}).map(function(k){return config.panels[k].name;}); if (o.indexOf(n.trim())===-1){ p.name=n.trim(); renderAll(); } else toast('Name in use'); } };
      list.appendChild(row);
    });
  }

  function addElement(type) { if (!selectedPanel){toast('Select a panel first'); return;} var panel=config.panels[selectedPanel]; var el=defaultElement(type); var id=uniqueElId(type.charAt(0).toUpperCase()+type.slice(1)); panel.elements[id]=el; panel.elementOrder.push(id); selectedElement=id; renderAll(); }
  function deleteElement(id) { var panel=config.panels[selectedPanel]; if (!panel) return; delete panel.elements[id]; panel.elementOrder=panel.elementOrder.filter(function(e){return e!==id;}); if (selectedElement===id) selectedElement=null; renderAll(); }
  function moveElement(id, dir) { var panel=config.panels[selectedPanel]; var i=panel.elementOrder.indexOf(id), j=i+dir; if (j<0||j>=panel.elementOrder.length) return; var t=panel.elementOrder[i]; panel.elementOrder[i]=panel.elementOrder[j]; panel.elementOrder[j]=t; renderAll(); }
  function renderElementList() {
    var list=document.getElementById('elementList'); list.innerHTML='';
    var panel=config.panels[selectedPanel]; if (!panel) return;
    panel.elementOrder.forEach(function(id){
      var el=panel.elements[id];
      var row=document.createElement('div'); row.className='list-item'+(id===selectedElement?' selected':''); row.dataset.elId=id; row.draggable=true;
      var sp=document.createElement('span'); sp.className='name'; sp.textContent=id+' ('+el.type+')'; row.appendChild(sp);
      var up=document.createElement('button'); up.textContent='↑'; up.onclick=function(e){e.stopPropagation(); moveElement(id,-1);};
      var dn=document.createElement('button'); dn.textContent='↓'; dn.onclick=function(e){e.stopPropagation(); moveElement(id,1);};
      var del=document.createElement('button'); del.textContent='×'; del.className='danger'; del.onclick=function(e){e.stopPropagation(); deleteElement(id);};
      row.appendChild(up); row.appendChild(dn); row.appendChild(del);
      row.onclick=function(){selectedElement=id; renderAll();};
      list.appendChild(row);
    });
  }

  function addField(container, label, type, value, onChange, options) {
    var f=document.createElement('div'); f.className='field'+(type==='checkbox'?' checkbox':'');
    if (type==='checkbox') {
      var i=document.createElement('input'); i.type='checkbox'; i.checked=!!value;
      i.addEventListener('change', function(){onChange(i.checked); renderStage();});
      f.appendChild(i);
      var l=document.createElement('label'); l.textContent=label; f.appendChild(l);
    } else {
      var l=document.createElement('label'); l.textContent=label; f.appendChild(l);
      var i;
      if (type==='text') { i=document.createElement('input'); i.type='text'; i.value=value||''; i.addEventListener('input',function(){onChange(i.value); renderStage();}); }
      else if (type==='number') { i=document.createElement('input'); i.type='number'; i.value=value; i.addEventListener('input',function(){onChange(Number(i.value)); renderStage();}); }
      else if (type==='color') { i=document.createElement('input'); i.type='color'; i.value=value; i.addEventListener('input',function(){onChange(i.value); renderStage();}); }
      else if (type==='textarea') { i=document.createElement('textarea'); i.value=value||''; i.addEventListener('input',function(){onChange(i.value); renderStage();}); }
      else if (type==='select') { i=document.createElement('select'); (options||[]).forEach(function(o){var opt=document.createElement('option'); opt.value=o; opt.textContent=o; if(o===value)opt.selected=true; i.appendChild(opt);}); i.addEventListener('change',function(){onChange(i.value); renderStage();}); }
      f.appendChild(i);
    }
    container.appendChild(f);
  }
  function renderStyleFields(container, style) {
    var h=document.createElement('h2'); h.textContent='Style'; container.appendChild(h);
    addField(container, 'Background', 'color', style.background, function(v){style.background=v;});
    addField(container, 'Text color', 'color', style.color, function(v){style.color=v;});
    addField(container, 'Border color', 'color', style.borderColor, function(v){style.borderColor=v;});
    var r=document.createElement('div'); r.className='field row';
    var w=document.createElement('div'); addField(w, 'Border w', 'number', style.borderWidth, function(v){style.borderWidth=v;}); r.appendChild(w);
    var rr=document.createElement('div'); addField(rr, 'Radius', 'number', style.borderRadius, function(v){style.borderRadius=v;}); r.appendChild(rr);
    container.appendChild(r);
    if ('fontSize' in style) {
      var r2=document.createElement('div'); r2.className='field row';
      var a=document.createElement('div'); addField(a, 'Font size', 'number', style.fontSize, function(v){style.fontSize=v;}); r2.appendChild(a);
      var b=document.createElement('div'); addField(b, 'Weight', 'select', style.fontWeight, function(v){style.fontWeight=v;}, ['normal','bold']); r2.appendChild(b);
      container.appendChild(r2);
      addField(container, 'Text align', 'select', style.textAlign, function(v){style.textAlign=v;}, ['left','center','right']);
    }
    addField(container, 'Padding', 'number', style.padding, function(v){style.padding=v;});
    addField(container, 'Opacity (0-1)', 'number', style.opacity, function(v){style.opacity=v;});
  }

  function artSVG(kind, color) {
    var path = kind==='left' ? 'M16 0 L0 0 L4 8 L0 16 L16 16 Z' : kind==='right' ? 'M0 0 L16 0 L12 8 L16 16 L0 16 Z' : 'M0 0 L16 0 L12 8 L16 16 L0 16 L4 8 Z';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%"><path d="'+path+'" fill="'+color+'" stroke="#000" stroke-width="1"/><path d="'+path+'" fill="none" stroke="#fff" stroke-width="0.5" opacity="0.4"/></svg>');
  }

  function renderTypeFields(container, el) {
    var t=el.type;
    if (t==='label'||t==='button') addField(container, 'Text', 'text', el.text, function(v){el.text=v;});
    if (t==='checkbox') {
      addField(container, 'Label text', 'text', el.text, function(v){el.text=v;});
      addField(container, 'Default checked', 'checkbox', el.checked, function(v){el.checked=v;});
    }
    if (t==='slider'||t==='numberinput') {
      var r=document.createElement('div'); r.className='field row';
      var a=document.createElement('div'); addField(a, 'Min', 'number', el.min, function(v){el.min=v;}); r.appendChild(a);
      var b=document.createElement('div'); addField(b, 'Max', 'number', el.max, function(v){el.max=v;}); r.appendChild(b);
      container.appendChild(r);
      var r2=document.createElement('div'); r2.className='field row';
      var c=document.createElement('div'); addField(c, 'Step', 'number', el.step, function(v){el.step=v;}); r2.appendChild(c);
      var d=document.createElement('div'); addField(d, 'Default', 'number', el.value, function(v){el.value=v;}); r2.appendChild(d);
      container.appendChild(r2);
    }
    if (t==='dropdown'||t==='radio') {
      addField(container, 'Options (one per line)', 'textarea', (el.options||[]).join('\n'), function(v){
        el.options=v.split('\n').map(function(s){return s.trim();}).filter(Boolean);
        if (el.options.indexOf(el.selected)===-1) el.selected=el.options[0]||'';
        renderStage();
      });
      addField(container, 'Default selected', 'text', el.selected, function(v){el.selected=v;});
      if (t==='radio') addField(container, 'Orientation', 'select', el.orientation, function(v){el.orientation=v;}, ['vertical','horizontal']);
    }
    if (t==='textinput'||t==='search') {
      addField(container, 'Placeholder', 'text', el.placeholder||'', function(v){el.placeholder=v;});
      addField(container, 'Default value', 'text', el.value||'', function(v){el.value=v;});
    }
    if (t==='image'||t==='imagebutton'||t==='background') {
      addField(container, 'Image URL', 'text', el.src||el.image||'', function(v){if (t==='image'||t==='background') el.src=v; else el.image=v;});
      if (t==='image') {
        addField(container, 'Flip H', 'checkbox', el.flipH, function(v){el.flipH=v;});
        addField(container, 'Flip V', 'checkbox', el.flipV, function(v){el.flipV=v;});
        addField(container, 'Tint', 'color', el.tint||'#ffffff', function(v){el.tint=v;});
      }
      if (t==='imagebutton') {
        addField(container, 'Hover image', 'text', el.hoverImage||'', function(v){el.hoverImage=v;});
        addField(container, 'Pressed image', 'text', el.pressedImage||'', function(v){el.pressedImage=v;});
        addField(container, 'Press scale', 'number', el.scaleOnPress, function(v){el.scaleOnPress=v;});
      }
      if (t==='background') {
        addField(container, 'Parallax (0-1)', 'number', el.parallax, function(v){el.parallax=v;});
        addField(container, 'Blur (px)', 'number', el.blur, function(v){el.blur=v;});
        addField(container, 'Color', 'color', el.color, function(v){el.color=v;});
        addField(container, 'Size mode', 'select', el.sizeMode, function(v){el.sizeMode=v;}, ['cover','contain','stretch','tile']);
      }
    }
    if (t==='progressbar') {
      addField(container, 'Value', 'number', el.value, function(v){el.value=v;});
      var r=document.createElement('div'); r.className='field row';
      var a=document.createElement('div'); addField(a, 'Min', 'number', el.min, function(v){el.min=v;}); r.appendChild(a);
      var b=document.createElement('div'); addField(b, 'Max', 'number', el.max, function(v){el.max=v;}); r.appendChild(b);
      container.appendChild(r);
      addField(container, 'Indeterminate', 'checkbox', el.indeterminate, function(v){el.indeterminate=v;});
      addField(container, 'Bar color', 'color', el.barColor, function(v){el.barColor=v;});
      addField(container, 'Track color', 'color', el.trackColor, function(v){el.trackColor=v;});
    }
    if (t==='switch') {
      addField(container, 'On by default', 'checkbox', el.on, function(v){el.on=v;});
      addField(container, 'On color', 'color', el.onColor, function(v){el.onColor=v;});
      addField(container, 'Off color', 'color', el.offColor, function(v){el.offColor=v;});
    }
    if (t==='colorpicker') addField(container, 'Default color', 'color', el.value, function(v){el.value=v;});
    if (t==='selector') {
      var r=document.createElement('div'); r.className='field row';
      var a=document.createElement('div'); addField(a, 'Rows', 'number', el.rows, function(v){el.rows=v;}); r.appendChild(a);
      var b=document.createElement('div'); addField(b, 'Cols', 'number', el.cols, function(v){el.cols=v;}); r.appendChild(b);
      container.appendChild(r);
      addField(container, 'Cell gap', 'number', el.cellGap, function(v){el.cellGap=v;});
      addField(container, 'Selected index', 'number', el.selectedIndex, function(v){el.selectedIndex=v;});
      addField(container, 'Cells JSON', 'textarea', JSON.stringify(el.cells||[]), function(v){ try{ el.cells=JSON.parse(v); renderStage(); } catch(e){} });
    }
    if (t==='counter') {
      addField(container, 'Value', 'number', el.value, function(v){el.value=v;});
      addField(container, 'Format', 'select', el.format, function(v){el.format=v;}, ['normal','percent','currency']);
      addField(container, 'Prefix', 'text', el.prefix, function(v){el.prefix=v;});
      addField(container, 'Suffix', 'text', el.suffix, function(v){el.suffix=v;});
      addField(container, 'Decimals', 'number', el.decimals, function(v){el.decimals=v;});
    }
    if (t==='badge') {
      addField(container, 'Count', 'number', el.count, function(v){el.count=v;});
      addField(container, 'Max', 'number', el.max, function(v){el.max=v;});
      addField(container, 'Color', 'color', el.color, function(v){el.color=v;});
      addField(container, 'Visible', 'checkbox', el.visible, function(v){el.visible=v;});
    }
    if (t==='spinner') {
      addField(container, 'Size', 'number', el.size, function(v){el.size=v;});
      addField(container, 'Color', 'color', el.color, function(v){el.color=v;});
    }
    if (t==='divider') {
      addField(container, 'Orientation', 'select', el.orientation, function(v){el.orientation=v;}, ['horizontal','vertical']);
      addField(container, 'Thickness', 'number', el.thickness, function(v){el.thickness=v;});
      addField(container, 'Color', 'color', el.color, function(v){el.color=v;});
    }
    if (t==='video') {
      addField(container, 'Video URL', 'text', el.src, function(v){el.src=v;});
      addField(container, 'Autoplay', 'checkbox', el.autoplay, function(v){el.autoplay=v;});
      addField(container, 'Loop', 'checkbox', el.loop, function(v){el.loop=v;});
      addField(container, 'Muted', 'checkbox', el.muted, function(v){el.muted=v;});
      addField(container, 'Show controls', 'checkbox', el.controls, function(v){el.controls=v;});
    }
    if (t==='rating') {
      addField(container, 'Value', 'number', el.value, function(v){el.value=v;});
      addField(container, 'Max', 'number', el.max, function(v){el.max=v;});
      addField(container, 'Icon', 'text', el.icon, function(v){el.icon=v;});
      addField(container, 'Color', 'color', el.color, function(v){el.color=v;});
    }
    if (t==='healthbar') {
      addField(container, 'Segments', 'number', el.segments, function(v){el.segments=v;});
      addField(container, 'Filled', 'number', el.filled, function(v){el.filled=v;});
      addField(container, 'FG color', 'color', el.fgColor, function(v){el.fgColor=v;});
      addField(container, 'BG color', 'color', el.bgColor, function(v){el.bgColor=v;});
      addField(container, 'Empty color', 'color', el.emptyColor, function(v){el.emptyColor=v;});
      addField(container, 'Art mode', 'select', el.artMode||'image', function(v){el.artMode=v;}, ['image','builtIn','none']);
      addField(container, 'Left art URL', 'text', el.leftArt||'', function(v){el.leftArt=v;});
      addField(container, 'Middle art URL', 'text', el.midArt||'', function(v){el.midArt=v;});
      addField(container, 'Right art URL', 'text', el.rightArt||'', function(v){el.rightArt=v;});
      // Preview thumbnails of the SVG art for the colors
      var prev=document.createElement('div'); prev.className='art-preview';
      var colors = el.artMode==='builtIn' ? [el.fgColor, el.emptyColor] : ['#5B6EE1','#1f2230'];
      ['left','mid','right'].forEach(function(k){
        var box=document.createElement('div');
        box.className='art-box';
        box.style.backgroundImage='url('+JSON.stringify(artSVG(k, k==='mid' ? el.fgColor : (k==='left' ? el.fgColor : el.fgColor)))+')';
        prev.appendChild(box);
      });
      container.appendChild(prev);
    }
    if (t==='joystick') {
      addField(container, 'Radius', 'number', el.radius, function(v){el.radius=v;});
      addField(container, 'Deadzone', 'number', el.deadzone, function(v){el.deadzone=v;});
      addField(container, 'Knob color', 'color', el.knobColor, function(v){el.knobColor=v;});
      addField(container, 'Base color', 'color', el.baseColor, function(v){el.baseColor=v;});
    }
    if (t==='dpad') {
      addField(container, 'Size', 'number', el.size, function(v){el.size=v;});
      addField(container, 'Color', 'color', el.color, function(v){el.color=v;});
    }
    if (t==='tabs') {
      addField(container, 'Tabs (one per line)', 'textarea', (el.tabs||[]).join('\n'), function(v){ el.tabs=v.split('\n').map(function(s){return s.trim();}).filter(Boolean); renderStage(); });
      addField(container, 'Active tab index', 'number', el.activeTab, function(v){el.activeTab=v;});
    }
    if (t==='accordion') {
      addField(container, 'Multi-open', 'checkbox', el.multiOpen, function(v){el.multiOpen=v;});
      addField(container, 'Items JSON', 'textarea', JSON.stringify(el.items||[], null, 2), function(v){ try{ el.items=JSON.parse(v); renderStage(); } catch(e){} });
    }
    if (t==='knob') {
      addField(container, 'Value', 'number', el.value, function(v){el.value=v;});
      var r=document.createElement('div'); r.className='field row';
      var a=document.createElement('div'); addField(a, 'Min', 'number', el.min, function(v){el.min=v;}); r.appendChild(a);
      var b=document.createElement('div'); addField(b, 'Max', 'number', el.max, function(v){el.max=v;}); r.appendChild(b);
      container.appendChild(r);
      addField(container, 'Color', 'color', el.color, function(v){el.color=v;});
    }
    if (t==='carousel') {
      addField(container, 'Current', 'number', el.current, function(v){el.current=v;});
      addField(container, 'Autoplay', 'checkbox', el.autoPlay, function(v){el.autoPlay=v;});
      addField(container, 'Interval (ms)', 'number', el.interval, function(v){el.interval=v;});
      addField(container, 'Slides JSON', 'textarea', JSON.stringify(el.slides||[], null, 2), function(v){ try{ el.slides=JSON.parse(v); renderStage(); } catch(e){} });
    }
    if (t==='code') {
      addField(container, 'Code', 'textarea', el.code, function(v){el.code=v;});
      addField(container, 'Theme', 'select', el.theme, function(v){el.theme=v;}, ['dark','light','monokai']);
    }
    if (t==='particles') {
      addField(container, 'Color', 'color', el.color, function(v){el.color=v;});
      addField(container, 'Count', 'number', el.count, function(v){el.count=v;});
      addField(container, 'Speed', 'number', el.speed, function(v){el.speed=v;});
      addField(container, 'Lifetime (s)', 'number', el.lifetime, function(v){el.lifetime=v;});
      addField(container, 'Gravity', 'number', el.gravity, function(v){el.gravity=v;});
      addField(container, 'Size', 'number', el.size, function(v){el.size=v;});
    }
    if (t==='tooltip') {
      addField(container, 'Text', 'text', el.text, function(v){el.text=v;});
      addField(container, 'Position', 'select', el.position, function(v){el.position=v;}, ['top','bottom','left','right']);
      addField(container, 'Delay (ms)', 'number', el.delay, function(v){el.delay=v;});
    }
    if (t==='achievement') {
      addField(container, 'Achievement ID', 'text', el.achievementId||'', function(v){el.achievementId=v;});
      addField(container, 'Title', 'text', el.title, function(v){el.title=v;});
      addField(container, 'Description', 'text', el.description, function(v){el.description=v;});
      addField(container, 'Icon', 'text', el.icon, function(v){el.icon=v;});
      addField(container, 'Points', 'number', el.points, function(v){el.points=v;});
      addField(container, 'Progress', 'number', el.progress, function(v){el.progress=v;});
      addField(container, 'Target', 'number', el.target, function(v){el.target=v;});
      addField(container, 'Unlocked', 'checkbox', el.unlocked, function(v){el.unlocked=v;});
      addField(container, 'Accent', 'color', el.accent, function(v){el.accent=v;});
    }
    if (t==='leaderboard') {
      addField(container, 'Board ID', 'text', el.boardId||'main', function(v){el.boardId=v;});
      addField(container, 'Title', 'text', el.title, function(v){el.title=v;});
      addField(container, 'Visible rows', 'number', el.maxVisible, function(v){el.maxVisible=v;});
      addField(container, 'Highlighted player', 'text', el.highlightPlayer||'', function(v){el.highlightPlayer=v;});
      addField(container, 'Accent', 'color', el.accent, function(v){el.accent=v;});
      addField(container, 'Preview entries JSON', 'textarea', JSON.stringify(el.entries||[], null, 2), function(v){ try{el.entries=JSON.parse(v);renderStage();}catch(e){} });
    }
  }

  function buildInnerPreview(el) {
    var s=el.style;
    var inner=document.createElement('div'); inner.className='inner';
    inner.style.cssText='width:100%;height:100%;box-sizing:border-box;display:flex;align-items:center;justify-content:center;';
    if (el.type==='label'||el.type==='button') { inner.style.color=s.color; inner.style.fontSize=s.fontSize+'px'; inner.style.fontWeight=s.fontWeight; inner.style.background=(el.type==='button')?s.background:'transparent'; inner.style.border=(el.type==='button')?(s.borderWidth+'px solid '+s.borderColor):'none'; inner.style.borderRadius=(el.type==='button')?(s.borderRadius+'px'):'0'; inner.textContent=el.text; }
    else if (el.type==='slider') { inner.innerHTML='<div style="width:80%;height:4px;background:'+s.borderColor+';border-radius:2px;position:relative;"><div style="position:absolute;left:'+((el.value-el.min)/(el.max-el.min)*100)+'%;top:-4px;width:10px;height:10px;border-radius:50%;background:'+s.color+';"></div></div>'; }
    else if (el.type==='checkbox') { inner.style.justifyContent='flex-start'; inner.style.gap='4px'; inner.style.color=s.color; inner.style.fontSize=s.fontSize+'px'; inner.innerHTML='<span style="width:12px;height:12px;border:1px solid '+s.borderColor+';background:'+(el.checked?s.borderColor:'transparent')+';"></span><span>'+el.text+'</span>'; }
    else if (el.type==='dropdown') { inner.style.color=s.color; inner.style.fontSize=s.fontSize+'px'; inner.style.background=s.background; inner.style.border=s.borderWidth+'px solid '+s.borderColor; inner.style.borderRadius=s.borderRadius+'px'; inner.textContent=(el.selected||'')+' ▾'; }
    else if (el.type==='textinput'||el.type==='search') { inner.style.color=s.color; inner.style.fontSize=s.fontSize+'px'; inner.style.background=s.background; inner.style.border=s.borderWidth+'px solid '+s.borderColor; inner.style.borderRadius=s.borderRadius+'px'; inner.style.justifyContent='flex-start'; inner.textContent=el.value||el.placeholder||''; }
    else if (el.type==='numberinput') { inner.style.color=s.color; inner.style.fontSize=s.fontSize+'px'; inner.style.background=s.background; inner.style.border=s.borderWidth+'px solid '+s.borderColor; inner.style.borderRadius=s.borderRadius+'px'; inner.textContent=String(el.value); }
    else if (el.type==='image'||el.type==='imagebutton') { inner.style.backgroundImage=(el.src||el.image)?'url("'+(el.src||el.image)+'")':'none'; inner.style.backgroundSize='100% 100%'; if(!(el.src||el.image)){ inner.style.background=s.background; inner.style.border='1px dashed '+s.borderColor; inner.style.color=s.color; inner.style.fontSize='10px'; inner.textContent='image'; } }
    else if (el.type==='background') { inner.style.backgroundImage=el.src?'url("'+el.src+'")':'none'; inner.style.backgroundSize=(el.sizeMode==='stretch')?'100% 100%':el.sizeMode; inner.style.backgroundColor=el.color; if(!el.src) inner.textContent='bg'; }
    else if (el.type==='progressbar') { inner.style.background=el.trackColor; inner.style.borderRadius='3px'; inner.innerHTML='<div style="height:100%;width:'+((el.value-el.min)/(el.max-el.min)*100)+'%;background:'+el.barColor+';"></div>'; }
    else if (el.type==='switch') { inner.style.background=(el.on?el.onColor:el.offColor); inner.style.borderRadius='999px'; inner.style.justifyContent='flex-start'; inner.innerHTML='<div style="width:35%;height:80%;background:#fff;border-radius:50%;margin-left:'+(el.on?'60%':'5%')+';transition:margin 0.2s;"></div>'; }
    else if (el.type==='radio') { inner.style.flexDirection=(el.orientation==='horizontal'?'row':'column'); inner.style.gap='2px'; inner.style.fontSize='10px'; inner.style.color=s.color; inner.innerHTML=(el.options||[]).map(function(o){return '<label style="display:flex;align-items:center;gap:2px;"><span style="width:8px;height:8px;border-radius:50%;border:1px solid '+s.borderColor+';background:'+(o===el.selected?s.borderColor:'transparent')+';"></span>'+o+'</label>';}).join(''); }
    else if (el.type==='colorpicker') { inner.style.background=el.value; inner.style.border='1px solid '+s.borderColor; }
    else if (el.type==='selector') { var rows=[]; for (var r=0;r<el.rows;r++){ var cells=[]; for (var c=0;c<el.cols;c++){ var i=r*el.cols+c; var cell=(el.cells||[])[i]||{}; cells.push('<div style="flex:1;background:'+(cell.color||'#3a3f52')+';border:2px solid '+(i===el.selectedIndex?'#5B6EE1':'transparent')+';border-radius:2px;background-size:cover;'+(cell.image?'background-image:url('+JSON.stringify(cell.image)+');':'')+'"></div>'); } rows.push('<div style="display:flex;flex:1;gap:2px;">'+cells.join('')+'</div>'); } inner.style.flexDirection='column'; inner.style.gap='2px'; inner.innerHTML=rows.join(''); }
    else if (el.type==='counter') { var v=el.value; if (el.format==='percent') v=Math.round(v)+'%'; else if (el.format==='currency') v='$'+v.toFixed(el.decimals); else v=v.toFixed(el.decimals); inner.style.color=s.color; inner.style.fontSize=s.fontSize+'px'; inner.textContent=(el.prefix||'')+v+(el.suffix||''); }
    else if (el.type==='badge') { inner.style.background=el.color; inner.style.color='#fff'; inner.style.borderRadius='50%'; inner.style.fontSize='9px'; inner.style.fontWeight='bold'; inner.style.minWidth='12px'; inner.style.minHeight='12px'; inner.textContent=el.count>el.max?(el.max+'+'):el.count; }
    else if (el.type==='spinner') { inner.innerHTML='<div style="width:16px;height:16px;border:2px solid '+el.color+'33;border-top-color:'+el.color+';border-radius:50%;animation:spin 1s linear infinite;"></div>'; }
    else if (el.type==='divider') { inner.style.padding='0'; inner.innerHTML='<div style="'+(el.orientation==='horizontal'?'width:100%;height:'+el.thickness+'px':'height:100%;width:'+el.thickness+'px')+';background:'+el.color+';"></div>'; }
    else if (el.type==='video') { inner.style.background='#000'; inner.style.color='#fff'; inner.style.fontSize='10px'; inner.textContent=el.src?'▶ video':'video'; }
    else if (el.type==='rating') { inner.style.color=el.color; inner.style.fontSize=s.fontSize+'px'; inner.style.gap='1px'; inner.innerHTML=Array.from({length:el.max},function(_,i){return '<span style="opacity:'+(i<el.value?1:0.25)+';">'+el.icon+'</span>';}).join(''); }
    else if (el.type==='healthbar') {
      // Use the same art system as the runtime for an accurate preview.
      var segW = 100 / el.segments;
      var html = '<div style="display:flex;width:100%;height:100%;">';
      for (var r=0; r<el.segments; r++) {
        var isFilled = r < el.filled;
        var fillColor = isFilled ? el.fgColor : el.emptyColor;
        if (el.artMode === 'builtIn') {
          html += '<div style="flex:1;display:flex;background:#000;background-image:url('+JSON.stringify(artSVG('left', fillColor))+'),url('+JSON.stringify(artSVG('mid', fillColor))+'),url('+JSON.stringify(artSVG('right', fillColor))+');background-size:30% 100%,40% 100%,30% 100%;background-repeat:no-repeat;background-position:left,center,right;"></div>';
        } else if (el.leftArt || el.midArt || el.rightArt) {
          html += '<div style="flex:1;display:flex;background:#000;background-image:url('+JSON.stringify(el.leftArt||'')+'),url('+JSON.stringify(el.midArt||'')+'),url('+JSON.stringify(el.rightArt||'')+');background-size:30% 100%,40% 100%,30% 100%;background-repeat:no-repeat;background-position:left,center,right;"></div>';
        } else {
          html += '<div style="flex:1;background:'+fillColor+';"></div>';
        }
      }
      html += '</div>';
      inner.style.cssText += 'padding:0;';
      inner.innerHTML = html;
    }
    else if (el.type==='joystick') { inner.style.background=el.baseColor; inner.style.borderRadius='50%'; inner.innerHTML='<div style="width:40%;height:40%;background:'+el.knobColor+';border-radius:50%;position:absolute;left:30%;top:30%;"></div>'; inner.style.position='relative'; }
    else if (el.type==='dpad') { inner.innerHTML='<div style="display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:1px;width:100%;height:100%;"><div></div><div style="background:'+el.color+';color:#fff;display:flex;align-items:center;justify-content:center;">▲</div><div></div><div style="background:'+el.color+';color:#fff;display:flex;align-items:center;justify-content:center;">◀</div><div style="background:'+el.color+';"></div><div style="background:'+el.color+';color:#fff;display:flex;align-items:center;justify-content:center;">▶</div><div></div><div style="background:'+el.color+';color:#fff;display:flex;align-items:center;justify-content:center;">▼</div><div></div></div>'; }
    else if (el.type==='tabs') { inner.style.flexDirection='column'; inner.style.alignItems='stretch'; var btns=(el.tabs||[]).map(function(t,i){return '<div style="padding:2px 4px;background:'+(i===el.activeTab?s.background:'transparent')+';border-bottom:1px solid '+s.borderColor+';color:'+s.color+';font-size:'+s.fontSize+'px;">'+t+'</div>';}).join(''); inner.innerHTML=btns+'<div style="flex:1;color:'+s.color+';font-size:10px;padding:2px;">content for '+(el.tabs[el.activeTab]||'')+'</div>'; }
    else if (el.type==='accordion') { inner.style.flexDirection='column'; inner.style.alignItems='stretch'; inner.style.gap='2px'; inner.innerHTML=(el.items||[]).map(function(it){return '<div style="background:'+s.background+';border-radius:2px;padding:2px 4px;color:'+s.color+';font-size:10px;">'+(it.open?'▼ ':'▶ ')+it.title+(it.open?'<div style="padding:2px;">'+it.content+'</div>':'')+'</div>';}).join(''); }
    else if (el.type==='knob') { var pct=(el.value-el.min)/(el.max-el.min); inner.style.background='radial-gradient(circle,'+el.color+' 0%,'+el.color+'55 70%)'; inner.style.borderRadius='50%'; inner.style.position='relative'; inner.innerHTML='<div style="position:absolute;left:50%;top:10%;width:2px;height:40%;background:#fff;transform-origin:50% 100%;transform:translateX(-50%) rotate('+(-135+pct*270)+'deg);"></div>'; }
    else if (el.type==='carousel') { var slide=(el.slides||[])[el.current]||{}; inner.style.background='#000'; inner.style.color='#fff'; inner.style.fontSize='10px'; if (slide.image) inner.style.backgroundImage='url('+JSON.stringify(slide.image)+')'; inner.style.backgroundSize='cover'; inner.textContent=slide.image?'':slide.text||'slide'; }
    else if (el.type==='code') { var themes={dark:{bg:'#1b1e29',color:'#e7e9f2'},light:{bg:'#fff',color:'#1b1e29'},monokai:{bg:'#272822',color:'#f8f8f2'}}; var th=themes[el.theme]||themes.dark; inner.style.background=th.bg; inner.style.color=th.color; inner.style.fontFamily='monospace'; inner.style.fontSize='9px'; inner.style.justifyContent='flex-start'; inner.style.alignItems='flex-start'; inner.style.whiteSpace='pre-wrap'; inner.style.padding='3px'; inner.textContent=(el.code||'').slice(0,80); }
    else if (el.type==='particles') { inner.style.background='#222'; inner.style.color='#fff'; inner.style.fontSize='10px'; inner.textContent='* particles'; }
    else if (el.type==='canvas') { inner.style.background='#fff'; inner.style.color='#888'; inner.style.fontSize='10px'; inner.textContent='canvas'; }
    else if (el.type==='tooltip') { inner.style.background=el.background; inner.style.color=el.textColor; inner.style.borderRadius='3px'; inner.style.fontSize='9px'; inner.style.padding='2px 4px'; inner.textContent=el.text; }
    else if (el.type==='achievement') {
      inner.style.cssText += 'display:grid;grid-template-columns:auto 1fr auto;gap:5px;padding:5px;border-left:3px solid '+el.accent+';border-radius:'+s.borderRadius+'px;background:'+s.background+';color:'+s.color+';';
      var ai=document.createElement('span'); ai.textContent=el.icon||'🏆'; ai.style.fontSize='17px';
      var ac=document.createElement('span'); ac.style.cssText='min-width:0;font-size:8px;'; var at=document.createElement('b'); at.textContent=el.title||'Achievement'; var ad=document.createElement('span'); ad.textContent=el.description||''; ad.style.cssText='display:block;opacity:.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'; ac.appendChild(at); ac.appendChild(ad);
      var ap=document.createElement('b'); ap.textContent='+'+(Number(el.points)||0); ap.style.color=el.accent; inner.appendChild(ai); inner.appendChild(ac); inner.appendChild(ap);
    }
    else if (el.type==='leaderboard') {
      inner.style.cssText += 'display:flex;flex-direction:column;align-items:stretch;justify-content:flex-start;background:'+s.background+';color:'+s.color+';border:1px solid '+s.borderColor+';border-radius:'+s.borderRadius+'px;overflow:hidden;font-size:7px;';
      var lh=document.createElement('b'); lh.textContent=el.title||'Leaderboard'; lh.style.cssText='padding:3px 5px;background:'+el.accent+';color:#fff;'; inner.appendChild(lh);
      (el.entries||[]).slice(0,Number(el.maxVisible)||5).forEach(function(entry,i){var row=document.createElement('div');row.style.cssText='display:grid;grid-template-columns:14px 1fr auto;padding:2px 4px;';var rank=document.createElement('b');rank.textContent=i+1;var player=document.createElement('span');player.textContent=entry.player||'player';var score=document.createElement('b');score.textContent=Number(entry.score)||0;row.appendChild(rank);row.appendChild(player);row.appendChild(score);inner.appendChild(row);});
    }
    else inner.textContent=el.type;
    return inner;
  }

  function renderStage() {
    var stage=document.getElementById('stage'); stage.innerHTML='';
    config.panelOrder.forEach(function(key){
      var panel=config.panels[key];
      if (previewMode&&!panel.visible) return;
      var div=document.createElement('div'); div.className='ed-panel';
      var s=panel.style;
      div.style.cssText='left:'+panel.x+'%;top:'+panel.y+'%;width:'+panel.width+'%;height:'+((panel.minimized?Math.min(panel.height,6):panel.height))+'%;background:'+(panel.backgroundImage?('url('+JSON.stringify(panel.backgroundImage)+') center/cover no-repeat, '+s.background):s.background)+';border:'+s.borderWidth+'px solid '+(key===selectedPanel&&!previewMode?'#7c8bf0':s.borderColor)+';border-radius:'+s.borderRadius+'px;padding:'+s.padding+'px;opacity:'+(previewMode?s.opacity:(key===selectedPanel?s.opacity:0.5))+';z-index:'+(panel.zIndex||1)+';';
      if (!previewMode) div.addEventListener('mousedown', function(e){ if(e.target===div){selectedPanel=key; selectedElement=null; renderAll();}});
      if (!panel.minimized) {
        panel.elementOrder.slice().sort(function(a,b){return (panel.elements[a].zIndex||1)-(panel.elements[b].zIndex||1);}).forEach(function(id){
          var el=panel.elements[id];
          if (el.hidden&&previewMode) return;
          var wrap=document.createElement('div'); wrap.className='ed-el'+((!previewMode&&id===selectedElement)?' selected':''); wrap.dataset.elId=id; wrap.dataset.panelKey=key;
          wrap.style.cssText='left:'+el.x+'%;top:'+el.y+'%;width:'+el.width+'%;height:'+el.height+'%;z-index:'+(el.zIndex||1)+';transform:rotate('+(el.rotation||0)+'deg);';
          if (el.skin&&el.skin.url) { wrap.style.border=(Number(el.skin.width)||0)+'px solid transparent'; wrap.style.borderImageSource='url("'+el.skin.url+'")'; wrap.style.borderImageSlice=(Number(el.skin.slice)||0)+' fill'; wrap.style.borderImageWidth=String(Number(el.skin.width)||0); wrap.style.borderImageRepeat=el.skin.repeat||'stretch'; }
          wrap.appendChild(buildInnerPreview(el));
          if (!previewMode) {
            wrap.addEventListener('mousedown', function(e){e.stopPropagation(); selectedPanel=key; selectedElement=id; renderAll(); startDrag(e, panel, el);});
            var h=document.createElement('div'); h.className='handle'; h.addEventListener('mousedown', function(e){e.stopPropagation(); selectedPanel=key; selectedElement=id; renderAll(); startResize(e, panel, el);}); wrap.appendChild(h);
            var rh=document.createElement('div'); rh.className='rothandle'; rh.addEventListener('mousedown', function(e){
    e.stopPropagation();
    selectedPanel=key;
    selectedElement=id;
    startRotate(e, panel, el, wrap);
  }); wrap.appendChild(rh);
          }
          div.appendChild(wrap);
        });
      }
      stage.appendChild(div);
    });
  }
  function stagePx() { var s=document.getElementById('stage'); return {w:s.clientWidth, h:s.clientHeight}; }
  function startDrag(e, p, el) {
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
  function startResize(e, p, el) {
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
  function startRotate(e, p, el, wrapNode) {
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

  function renderProps() {
    var props=document.getElementById('props'); props.innerHTML='';
    var panel=config.panels[selectedPanel];
    if (selectedElement&&panel&&panel.elements[selectedElement]) {
      var el=panel.elements[selectedElement];
      var h=document.createElement('h2'); h.textContent='Element'; props.appendChild(h);
      addField(props, 'ID', 'text', selectedElement, function(v){
        if (!v||v===selectedElement) return;
        if (allIds().indexOf(v)!==-1){toast('ID in use'); return;}
        panel.elements[v]=panel.elements[selectedElement];
        delete panel.elements[selectedElement];
        panel.elementOrder=panel.elementOrder.map(function(x){return x===selectedElement?v:x;});
        selectedElement=v; renderAll();
      });
      var r=document.createElement('div'); r.className='field row';
      var a=document.createElement('div'); addField(a, 'X %', 'number', el.x, function(v){el.x=v;}); r.appendChild(a);
      var b=document.createElement('div'); addField(b, 'Y %', 'number', el.y, function(v){el.y=v;}); r.appendChild(b);
      props.appendChild(r);
      var r2=document.createElement('div'); r2.className='field row';
      var c=document.createElement('div'); addField(c, 'W %', 'number', el.width, function(v){el.width=v;}); r2.appendChild(c);
      var d=document.createElement('div'); addField(d, 'H %', 'number', el.height, function(v){el.height=v;}); r2.appendChild(d);
      props.appendChild(r2);
      var r3=document.createElement('div'); r3.className='field row';
      var e=document.createElement('div'); addField(e, 'Rot°', 'number', el.rotation||0, function(v){el.rotation=v;}); r3.appendChild(e);
      var f=document.createElement('div'); addField(f, 'Z', 'number', el.zIndex||1, function(v){el.zIndex=v;}); r3.appendChild(f);
      props.appendChild(r3);
      var lr=document.createElement('div'); lr.style.cssText='display:flex;gap:6px;margin-bottom:8px;';
      var fb=document.createElement('button'); fb.textContent='To front'; fb.style.flex='1';
      fb.onclick=function(){el.zIndex=((config.nextZ=(config.nextZ||1)+1)); renderAll();};
      var bb=document.createElement('button'); bb.textContent='To back'; bb.style.flex='1';
      bb.onclick=function(){el.zIndex=0; renderAll();};
      lr.appendChild(fb); lr.appendChild(bb); props.appendChild(lr);
      addField(props, 'Locked', 'checkbox', el.locked, function(v){el.locked=v;});
      addField(props, 'Player-draggable', 'checkbox', el.runtimeDraggable, function(v){el.runtimeDraggable=v;});
      addField(props, 'Visible', 'checkbox', !el.hidden, function(v){el.hidden=!v;});
      addField(props, 'Disabled', 'checkbox', el.disabled, function(v){el.disabled=v;});
      var th=document.createElement('h2'); th.textContent='Type-specific'; props.appendChild(th);
      renderTypeFields(props, el);
      var sh=document.createElement('h2'); sh.textContent='Custom 9-slice skin'; props.appendChild(sh);
      if (!el.skin) el.skin={url:'',slice:16,width:8,repeat:'stretch'};
      addField(props, 'Skin image URL', 'text', el.skin.url||'', function(v){el.skin.url=v;});
      addField(props, 'Slice', 'number', el.skin.slice||16, function(v){el.skin.slice=v;});
      addField(props, 'Border width', 'number', el.skin.width||8, function(v){el.skin.width=v;});
      addField(props, 'Repeat', 'select', el.skin.repeat||'stretch', function(v){el.skin.repeat=v;}, ['stretch','round','repeat','space']);
      renderStyleFields(props, el.style);
      return;
    }
    if (panel) {
      var hh=document.createElement('h2'); hh.textContent='Panel'; props.appendChild(hh);
      addField(props, 'Name', 'text', panel.name, function(v){
        if (!v) return;
        var o=config.panelOrder.filter(function(k){return k!==selectedPanel;}).map(function(k){return config.panels[k].name;});
        if (o.indexOf(v)!==-1){toast('Name in use'); return;}
        panel.name=v;
      });
      var r1=document.createElement('div'); r1.className='field row';
      var a=document.createElement('div'); addField(a, 'X %', 'number', panel.x, function(v){panel.x=v;}); r1.appendChild(a);
      var b=document.createElement('div'); addField(b, 'Y %', 'number', panel.y, function(v){panel.y=v;}); r1.appendChild(b);
      props.appendChild(r1);
      var r2=document.createElement('div'); r2.className='field row';
      var c=document.createElement('div'); addField(c, 'W %', 'number', panel.width, function(v){panel.width=v;}); r2.appendChild(c);
      var d=document.createElement('div'); addField(d, 'H %', 'number', panel.height, function(v){panel.height=v;}); r2.appendChild(d);
      props.appendChild(r2);
      addField(props, 'Visible', 'checkbox', panel.visible, function(v){panel.visible=v;});
      addField(props, 'Minimized', 'checkbox', panel.minimized, function(v){panel.minimized=v;});
      addField(props, 'Draggable', 'checkbox', panel.draggable, function(v){panel.draggable=v;});
      addField(props, 'Title bar', 'checkbox', panel.titleBar, function(v){panel.titleBar=v;});
      addField(props, 'Modal', 'checkbox', panel.modal, function(v){panel.modal=v;});
      addField(props, 'Background image', 'text', panel.backgroundImage||'', function(v){panel.backgroundImage=v;});
      renderStyleFields(props, panel.style);
      return;
    }
    props.innerHTML='<div class="empty-hint">Select a panel or element to edit its properties.</div>';
  }

  // ---- SuperGUI v5 editor layer -------------------------------------------------
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
    function fillSelect(sel,items){items.forEach(function(pair){var op=document.createElement('option');op.value=pair[0];op.textContent=pair[1];sel.appendChild(op);});}
    var al=document.createElement('select');fillSelect(al,[['','Align...'],['left','Left'],['right','Right'],['top','Top'],['bottom','Bottom'],['hcenter','H Center'],['vcenter','V Center']]);al.onchange=function(){if(al.value)v5Align(al.value);al.value='';};tb.appendChild(al);
    var ds=document.createElement('select');fillSelect(ds,[['','Distribute...'],['h','Horizontal'],['v','Vertical']]);ds.onchange=function(){if(ds.value)v5Distribute(ds.value);ds.value='';};tb.appendChild(ds);
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

  function renderAll() {
    document.getElementById('statusLine').textContent=selectedPanel?('Editing: '+config.panels[selectedPanel].name+(selectedElement?' \u2192 '+selectedElement:'')):'No panel selected';
    renderPanelList(); renderElementList(); renderStage(); renderProps(); v5AfterRender();
  }

  document.getElementById('btnAddPanel').onclick=addPanel;
  document.getElementById('btnAddElement').onclick=function(){ addElement(document.getElementById('addElementType').value); };
  document.getElementById('addElementType').addEventListener('dblclick', function(){ addElement(this.value); });
  document.getElementById('btnPreview').onclick=function(){ previewMode=!previewMode; this.textContent=previewMode?'Exit Preview':'Preview'; renderStage(); };
  document.getElementById('btnSave').onclick=function(){ ext._replaceConfig(config); config=JSON.parse(JSON.stringify(ext.config)); ext.saveGUI(); toast('Saved'); };
  document.getElementById('btnExport').onclick=function(){ var blob=new Blob([JSON.stringify(config,null,2)],{type:'application/json'}); var url=URL.createObjectURL(blob); var a=document.createElement('a'); a.href=url; a.download='supergui-config.json'; a.click(); URL.revokeObjectURL(url); };
  document.getElementById('btnImport').onclick=function(){ document.getElementById('fileImport').click(); };
  document.getElementById('fileImport').addEventListener('change', function(e){
    var f=e.target.files[0]; if (!f) return;
    var r=new FileReader();
    r.onload=function(){
      try { var p=JSON.parse(r.result); if (p&&p.panels&&p.panelOrder){ config=ext._normalizeConfig(p); selectedPanel=config.panelOrder[0]||null; selectedElement=null; renderAll(); toast('Imported'); } else toast('Invalid file'); } catch(err) { toast('Bad file'); }
    };
    r.readAsText(f);
  });
  var collapsed=false, restoreSize=null;
  document.getElementById('btnMin').onclick=function(){
    collapsed=!collapsed; document.body.classList.toggle('collapsed', collapsed);
    try { if (collapsed){ restoreSize={w:window.outerWidth, h:window.outerHeight}; window.resizeTo(260,44); } else if (restoreSize) window.resizeTo(restoreSize.w, restoreSize.h); } catch(e){}
  };
  document.getElementById('btnClose').onclick=function(){ if (confirm('Close the SuperGUI editor? Unsaved changes will be lost.')) window.close(); };
  var s=document.createElement('style'); s.textContent='@keyframes spin{to{transform:rotate(360deg)}}'; document.head.appendChild(s);
  renderAll();
})();
</script>
</body></html>`;
