from pathlib import Path

p = Path('src/editor/editor-template.js')
s = p.read_text()

helper_marker = "  function renderProps() {"
helper = r'''  function v5xEditorField(props,label,type,value,onchange,options) {
    var d=document.createElement('div'); d.className='field';
    var l=document.createElement('label'); l.textContent=label; d.appendChild(l);
    var i=document.createElement(type==='select'?'select':(type==='textarea'?'textarea':'input'));
    if(type==='select') (options||[]).forEach(function(o){var op=document.createElement('option');op.value=o;op.textContent=o;if(String(value)===String(o))op.selected=true;i.appendChild(op);});
    else { i.type=type==='number'?'number':'text'; i.value=value==null?'':value; }
    if(type==='textarea') { i.value=value==null?'':value; i.style.minHeight='92px'; }
    i.addEventListener(type==='text'||type==='number'||type==='textarea'?'input':'change',function(){onchange(type==='number'?Number(i.value):i.value);});
    d.appendChild(i); props.appendChild(d); return i;
  }
  function v5xRenderElementProps(props,el) {
    if(!el.customArt||typeof el.customArt!=='object') el.customArt={normal:'',hover:'',pressed:'',mode:'overlay',fit:'cover',opacity:1};
    var h=document.createElement('h2'); h.textContent='Custom Art'; props.appendChild(h);
    v5xEditorField(props,'Normal image URL','text',el.customArt.normal,function(v){el.customArt.normal=v;renderStage();});
    v5xEditorField(props,'Hover image URL','text',el.customArt.hover,function(v){el.customArt.hover=v;renderStage();});
    v5xEditorField(props,'Pressed image URL','text',el.customArt.pressed,function(v){el.customArt.pressed=v;renderStage();});
    v5xEditorField(props,'Art mode','select',el.customArt.mode,function(v){el.customArt.mode=v;renderStage();},['background','overlay','replace']);
    v5xEditorField(props,'Image fit','select',el.customArt.fit,function(v){el.customArt.fit=v;renderStage();},['cover','contain','stretch','tile']);
    var opacity=v5xEditorField(props,'Art opacity','number',el.customArt.opacity==null?1:el.customArt.opacity,function(v){el.customArt.opacity=Math.max(0,Math.min(1,v));renderStage();});
    opacity.step='0.05'; opacity.min='0'; opacity.max='1';

    if(el.type==='leaderboard') {
      if(!Array.isArray(el.customRows)) el.customRows=[];
      var lh=document.createElement('h2'); lh.textContent='Custom Leaderboard'; props.appendChild(lh);
      v5xEditorField(props,'Data mode','select',el.leaderboardMode||'service',function(v){el.leaderboardMode=v;renderStage();},['service','custom']);
      v5xEditorField(props,'Leaderboard title','text',el.title||'Leaderboard',function(v){el.title=v;renderStage();});
      v5xEditorField(props,'Maximum rows','number',el.maxCustomRows||el.maxVisible||10,function(v){el.maxCustomRows=Math.max(1,Math.floor(v||1));renderStage();});
      v5xEditorField(props,'Row height (px)','number',el.customRowHeight||30,function(v){el.customRowHeight=Math.max(20,v||30);renderStage();});
      v5xEditorField(props,'Rows JSON','textarea',JSON.stringify(el.customRows,null,2),function(v){try{var rows=JSON.parse(v);if(Array.isArray(rows)){el.customRows=rows;el.leaderboardMode='custom';renderStage();}}catch(e){} });
      var hint=document.createElement('div'); hint.className='empty-hint'; hint.style.textAlign='left'; hint.textContent='Row fields: player, score, extra, image, icon, color, background, rankText, rankColor.'; props.appendChild(hint);
    }
  }

'''
if helper_marker not in s:
    raise SystemExit('renderProps marker missing')
s = s.replace(helper_marker, helper + helper_marker, 1)

props_marker = "      var el=panel.elements[selectedElement];\n      var h=document.createElement('h2'); h.textContent='Element'; props.appendChild(h);"
props_replacement = "      var el=panel.elements[selectedElement];\n      v5xRenderElementProps(props,el);\n      var h=document.createElement('h2'); h.textContent='Element'; props.appendChild(h);"
if props_marker not in s:
    raise SystemExit('selected element props marker missing')
s = s.replace(props_marker, props_replacement, 1)

return_marker = "    else inner.textContent=el.type;\n    return inner;"
preview = r'''    else inner.textContent=el.type;

    if(el.type==='leaderboard' && el.leaderboardMode==='custom') {
      inner.innerHTML='';
      inner.style.cssText += 'display:flex;flex-direction:column;align-items:stretch;justify-content:flex-start;background:'+s.background+';color:'+s.color+';border:1px solid '+s.borderColor+';border-radius:'+s.borderRadius+'px;overflow:auto;font-size:7px;';
      var clh=document.createElement('b'); clh.textContent=el.title||'Leaderboard'; clh.style.cssText='padding:3px 5px;background:'+(el.accent||'#5B6EE1')+';color:#fff;'; inner.appendChild(clh);
      (el.customRows||[]).slice(0,Number(el.maxCustomRows)||10).forEach(function(entry,i){
        var row=document.createElement('div'); row.style.cssText='min-height:18px;display:grid;grid-template-columns:14px 18px 1fr auto;gap:2px;align-items:center;padding:2px 4px;background:'+(entry.background||'transparent')+';';
        var rank=document.createElement('b'); rank.textContent=entry.rankText||String(i+1); rank.style.color=entry.rankColor||el.accent||'#5B6EE1';
        var img=document.createElement('div'); img.style.cssText='width:16px;height:16px;background-size:contain;background-position:center;background-repeat:no-repeat;'; if(entry.image)img.style.backgroundImage='url("'+entry.image+'")';else img.textContent=entry.icon||'';
        var txt=document.createElement('span'); txt.textContent=(entry.player||'Player')+(entry.extra?' · '+entry.extra:''); txt.style.cssText='overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:'+(entry.color||'inherit')+';';
        var score=document.createElement('b'); score.textContent=String(entry.score==null?0:entry.score);
        row.appendChild(rank);row.appendChild(img);row.appendChild(txt);row.appendChild(score);inner.appendChild(row);
      });
    }

    if(el.customArt&&(el.customArt.normal||el.customArt.hover||el.customArt.pressed)) {
      var art=document.createElement('div');
      var fit=el.customArt.fit||'cover',url=el.customArt.normal||el.customArt.hover||el.customArt.pressed||'';
      var bg=fit==='stretch'?'url("'+url+'") center/100% 100% no-repeat':(fit==='tile'?'url("'+url+'") 0 0/auto repeat':'url("'+url+'") center/'+fit+' no-repeat');
      art.style.cssText='position:absolute;inset:0;pointer-events:none;opacity:'+Math.max(0,Math.min(1,Number(el.customArt.opacity==null?1:el.customArt.opacity)))+';background:'+bg+';z-index:50;';
      if(el.customArt.mode==='background')art.style.zIndex='0';
      if(el.customArt.mode==='replace')inner.style.opacity='0';
      inner.parentNode && inner.parentNode.appendChild(art);
    }
    return inner;'''
if return_marker not in s:
    raise SystemExit('preview return marker missing')
s = s.replace(return_marker, preview, 1)

p.write_text(s)
