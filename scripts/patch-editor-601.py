from pathlib import Path
import json

p=Path('src/editor/editor-template.js')
s=p.read_text()

# Keep the dragged DOM node alive. renderAll() used to replace it immediately before
# startDrag/startResize captured it, so the model changed while the visible element did not.
old="wrap.addEventListener('mousedown', function(e){e.stopPropagation(); selectedPanel=key; selectedElement=id; renderAll(); startDrag(e, panel, el);});"
new="wrap.addEventListener('mousedown', function(e){e.stopPropagation(); selectedPanel=key; selectedElement=id; document.querySelectorAll('.ed-el.selected').forEach(function(n){n.classList.remove('selected');}); wrap.classList.add('selected'); renderElementList(); renderProps(); startDrag(e, panel, el);});"
if old not in s: raise SystemExit('drag handler marker not found')
s=s.replace(old,new,1)
old="var h=document.createElement('div'); h.className='handle'; h.addEventListener('mousedown', function(e){e.stopPropagation(); selectedPanel=key; selectedElement=id; renderAll(); startResize(e, panel, el);}); wrap.appendChild(h);"
new="var h=document.createElement('div'); h.className='handle'; h.addEventListener('mousedown', function(e){e.stopPropagation(); selectedPanel=key; selectedElement=id; document.querySelectorAll('.ed-el.selected').forEach(function(n){n.classList.remove('selected');}); wrap.classList.add('selected'); renderElementList(); renderProps(); startResize(e, panel, el);}); wrap.appendChild(h);"
if old not in s: raise SystemExit('resize handler marker not found')
s=s.replace(old,new,1)

# Real editor previews for the v6 element family instead of the old type-name fallback.
marker="  function buildInnerPreview(el) {"
if marker not in s: raise SystemExit('preview function marker not found')
helper=r'''  var V6_EDITOR_TYPES=['icon','avatar','card','panelheader','breadcrumb','pagination','notification','toast','alert','chip','tag','pill','meter','gauge','thermometer','sparkline','barchart','linechart','piechart','minimap','mapmarker','clock','timer','calendar','datepicker','filepicker','textarea','passwordinput','emailinput','urlinput','stepper','segmentedcontrol','toolbar','menubar','contextmenu','treeview','list','listitem','table','datagrid','statcard','keycap','hotkey','spacer','scrollarea','iframe','markdown','richtext','terminal','chatbubble'];
  function v6PreviewBox(inner,s){inner.style.background=s.background;inner.style.color=s.color;inner.style.border=(s.borderWidth||1)+'px solid '+s.borderColor;inner.style.borderRadius=(s.borderRadius||6)+'px';inner.style.padding='4px';inner.style.fontSize='9px';}
  function v6MiniBars(inner,s){inner.innerHTML='';inner.style.cssText+='display:flex;align-items:flex-end;justify-content:space-around;gap:3px;padding:5px;background:'+s.background+';border-radius:'+s.borderRadius+'px;';[45,78,35,92,60].forEach(function(v){var b=document.createElement('i');b.style.cssText='display:block;width:12%;height:'+v+'%;background:'+s.borderColor+';border-radius:2px 2px 0 0;';inner.appendChild(b);});}
  function buildV6EditorPreview(inner,el,s){
    var t=el.type, text=el.text||t, items=(el.items&&el.items.length?el.items:['Home','Edit','View']);
    v6PreviewBox(inner,s);
    if(t==='icon'){inner.textContent=el.icon||'★';inner.style.fontSize='22px';}
    else if(t==='avatar'){inner.textContent=el.icon||'🙂';inner.style.borderRadius='50%';inner.style.fontSize='20px';}
    else if(t==='card'||t==='statcard'){inner.innerHTML='<div style="font-weight:800">'+(t==='statcard'?'1,337':text)+'</div><div style="opacity:.65;font-size:7px">'+(t==='statcard'?'Total score':'Card content')+'</div>';inner.style.display='block';}
    else if(t==='panelheader'){inner.textContent=text||'Window title';inner.style.justifyContent='flex-start';inner.style.fontWeight='800';}
    else if(t==='breadcrumb'){inner.textContent='Home  ›  Games  ›  Level';inner.style.justifyContent='flex-start';}
    else if(t==='pagination'){inner.textContent='‹  1  2  3  ›';}
    else if(['notification','toast','alert'].indexOf(t)!==-1){inner.innerHTML='<b>'+({notification:'Notification',toast:'Saved!',alert:'Warning!'}[t])+'</b><span style="opacity:.7;margin-left:4px">'+text+'</span>';}
    else if(['chip','tag','pill'].indexOf(t)!==-1){inner.textContent=text;inner.style.borderRadius=t==='pill'?'999px':'6px';inner.style.width='fit-content';inner.style.padding='3px 8px';}
    else if(['meter','gauge','thermometer'].indexOf(t)!==-1){inner.innerHTML='<div style="width:80%;height:8px;background:#0005;border-radius:99px;overflow:hidden"><div style="width:65%;height:100%;background:'+s.borderColor+'"></div></div>';}
    else if(t==='barchart'){v6MiniBars(inner,s);}
    else if(t==='sparkline'||t==='linechart'){inner.innerHTML='<svg viewBox="0 0 100 40" width="100%" height="100%"><polyline fill="none" stroke="'+s.borderColor+'" stroke-width="4" points="0,32 18,22 35,29 53,10 70,18 100,4"/></svg>';}
    else if(t==='piechart'){inner.innerHTML='<div style="width:32px;height:32px;border-radius:50%;background:conic-gradient('+s.borderColor+' 0 42%,#ffd166 42% 73%,#e15b6e 73%)"></div>';}
    else if(t==='minimap'){inner.innerHTML='<div style="position:relative;width:100%;height:100%;background:linear-gradient(30deg,#243,#354);border-radius:4px"><b style="position:absolute;left:60%;top:35%;color:#ff5">●</b></div>';inner.style.padding='2px';}
    else if(t==='mapmarker'){inner.textContent='📍';inner.style.fontSize='22px';inner.style.background='transparent';inner.style.border='none';}
    else if(t==='clock'){inner.textContent='12:34';inner.style.fontWeight='800';inner.style.fontSize='14px';}
    else if(t==='timer'){inner.textContent='00:42.8';inner.style.fontFamily='monospace';inner.style.fontWeight='800';}
    else if(t==='calendar'||t==='datepicker'){inner.innerHTML='<b>AUG 2026</b><div style="font-size:7px;margin-top:3px">S M T W T F S<br>9 10 <u>11</u> 12 13 14 15</div>';inner.style.display='block';inner.style.textAlign='center';}
    else if(t==='filepicker'){inner.textContent='Choose file…';inner.style.justifyContent='flex-start';}
    else if(['textarea','passwordinput','emailinput','urlinput'].indexOf(t)!==-1){inner.textContent=t==='passwordinput'?'••••••••':(t==='emailinput'?'name@example.com':(t==='urlinput'?'https://example.com':'Write something…'));inner.style.justifyContent='flex-start';inner.style.opacity='.85';}
    else if(t==='stepper'){inner.textContent='−   1   +';}
    else if(t==='segmentedcontrol'){inner.innerHTML='<span style="background:'+s.borderColor+';padding:3px 6px;border-radius:4px">One</span><span style="padding:3px 6px">Two</span>';}
    else if(t==='toolbar'||t==='menubar'){inner.textContent=items.join('   ');inner.style.justifyContent='flex-start';}
    else if(t==='contextmenu'){inner.innerHTML='<div style="text-align:left">Open<br>Rename<br>Delete</div>';inner.style.justifyContent='flex-start';}
    else if(t==='treeview'){inner.innerHTML='<div style="text-align:left">▾ Project<br>&nbsp;&nbsp;▸ Assets<br>&nbsp;&nbsp;▸ Scripts</div>';inner.style.justifyContent='flex-start';}
    else if(t==='list'||t==='listitem'){inner.innerHTML=t==='list'?'<div style="text-align:left">• First item<br>• Second item<br>• Third item</div>':'• '+text;inner.style.justifyContent='flex-start';}
    else if(t==='table'||t==='datagrid'){inner.innerHTML='<table style="width:100%;font-size:7px;border-collapse:collapse"><tr><th>Name</th><th>Score</th></tr><tr><td>Roger</td><td>100</td></tr><tr><td>Joe</td><td>73</td></tr></table>';}
    else if(t==='keycap'){inner.textContent='⌘';inner.style.boxShadow='inset 0 -3px 0 #0005';inner.style.fontWeight='800';}
    else if(t==='hotkey'){inner.textContent='⌘  +  K';inner.style.fontWeight='700';}
    else if(t==='spacer'){inner.innerHTML='<div style="width:100%;border-top:1px dashed '+s.borderColor+'"></div>';inner.style.background='transparent';inner.style.border='none';}
    else if(t==='scrollarea'){inner.innerHTML='<div style="width:100%;height:100%;overflow:hidden;text-align:left">Scrollable content<br>More content<br>More content<br>More content</div>';}
    else if(t==='iframe'){inner.innerHTML='<div style="font-size:18px">🌐</div><small style="margin-left:5px">Web Embed</small>';}
    else if(t==='markdown'){inner.innerHTML='<div style="text-align:left"><b style="font-size:12px">Heading</b><br><i>Markdown preview</i></div>';inner.style.justifyContent='flex-start';}
    else if(t==='richtext'){inner.innerHTML='<div style="text-align:left"><b>Bold</b> <i>italic</i> <u>underline</u></div>';inner.style.justifyContent='flex-start';}
    else if(t==='terminal'){inner.innerHTML='<div style="font-family:monospace;text-align:left;width:100%"><span style="color:#8f8">$</span> run game<br><span style="opacity:.65">Ready.</span></div>';inner.style.background='#090b10';inner.style.justifyContent='flex-start';}
    else if(t==='chatbubble'){inner.textContent='Hey! This is a chat bubble.';inner.style.borderRadius='12px 12px 12px 3px';inner.style.justifyContent='flex-start';}
    else inner.textContent=text;
  }

'''
s=s.replace(marker,helper+marker,1)
old="    else inner.textContent=el.type;"
new="    else if(V6_EDITOR_TYPES.indexOf(el.type)!==-1) buildV6EditorPreview(inner,el,s);\n    else inner.textContent=el.type;"
if old not in s: raise SystemExit('fallback preview marker not found')
s=s.replace(old,new,1)
p.write_text(s)

# Version + bundle banner.
p=Path('package.json'); data=json.loads(p.read_text()); data['version']='6.0.1'; p.write_text(json.dumps(data,indent=2)+'\n')
p=Path('scripts/build.mjs'); b=p.read_text(); b=b.replace('// SuperGUI v6.0 - generated file;', '// SuperGUI v6.0.1 - generated file;').replace('// SuperGUI v5.2 - generated file;', '// SuperGUI v6.0.1 - generated file;'); p.write_text(b)
