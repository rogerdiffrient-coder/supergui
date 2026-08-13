// SuperGUI 6.1.2: built-in safe Markdown + code display.
// No external parser dependency; content is built with DOM nodes instead of injecting Markdown as HTML.

const _sg612MarkdownGetInfo = SuperGUI.prototype.getInfo;
SuperGUI.prototype.getInfo = function () {
  const info = _sg612MarkdownGetInfo.call(this);
  const B = Scratch.BlockType, S = Scratch.ArgumentType;
  info.menus = info.menus || {};
  info.menus.sgContentMode = {acceptReporters:false,items:['plain','markdown','code']};
  const blocks = [
    {blockType:B.LABEL,text:'─── Markdown / Code ───'},
    {opcode:'setContentModeV612',blockType:B.COMMAND,text:'set [E] content mode [MODE]',arguments:{E:{type:S.STRING,menu:'elements'},MODE:{type:S.STRING,menu:'sgContentMode',defaultValue:'plain'}}},
    {opcode:'getContentModeV612',blockType:B.REPORTER,text:'content mode of [E]',arguments:{E:{type:S.STRING,menu:'elements'}}},
    {opcode:'setCodeLanguageV612',blockType:B.COMMAND,text:'set [E] code language [LANGUAGE]',arguments:{E:{type:S.STRING,menu:'elements'},LANGUAGE:{type:S.STRING,defaultValue:'JavaScript'}}},
    {opcode:'getCodeLanguageV612',blockType:B.REPORTER,text:'code language of [E]',arguments:{E:{type:S.STRING,menu:'elements'}}},
    {opcode:'setMarkdownSourceV612',blockType:B.COMMAND,text:'set markdown [E] source [TEXT]',arguments:{E:{type:S.STRING,menu:'elements'},TEXT:{type:S.STRING,defaultValue:'**Hello!**'}}},
    {opcode:'setCodeSourceV612',blockType:B.COMMAND,text:'set code [E] source [TEXT]',arguments:{E:{type:S.STRING,menu:'elements'},TEXT:{type:S.STRING,defaultValue:'console.log("Hello!");'}}}
  ];
  info.blocks = blocks.concat(info.blocks || []);
  return info;
};

function sg612ContentElement(ext,id) { return ext._findElement(String(id || '')); }
function sg612RenderFound(ext,f) { if (f) ext._renderPanel(f.panelKey); }
function sg612Mode(value) { const v=String(value||'plain').toLowerCase(); return ['plain','markdown','code'].includes(v)?v:'plain'; }

SuperGUI.prototype.setContentModeV612=function(a){const f=sg612ContentElement(this,a.E);if(!f)return;f.el.contentMode=sg612Mode(a.MODE);sg612RenderFound(this,f);};
SuperGUI.prototype.getContentModeV612=function(a){const f=sg612ContentElement(this,a.E);if(!f)return'';return sg612Mode(f.el.type==='markdown'?'markdown':(f.el.contentMode||'plain'));};
SuperGUI.prototype.setCodeLanguageV612=function(a){const f=sg612ContentElement(this,a.E);if(!f)return;f.el.codeLanguage=String(a.LANGUAGE||'');sg612RenderFound(this,f);};
SuperGUI.prototype.getCodeLanguageV612=function(a){const f=sg612ContentElement(this,a.E);return f?String(f.el.codeLanguage||''):'';};
SuperGUI.prototype.setMarkdownSourceV612=function(a){const f=sg612ContentElement(this,a.E);if(!f)return;f.el.text=String(a.TEXT??'');f.el.value=f.el.text;f.el.contentMode='markdown';sg612RenderFound(this,f);};
SuperGUI.prototype.setCodeSourceV612=function(a){const f=sg612ContentElement(this,a.E);if(!f)return;f.el.text=String(a.TEXT??'');f.el.value=f.el.text;f.el.contentMode='code';sg612RenderFound(this,f);};

function sg612AppendInline(parent,text){
  const source=String(text??'');
  const pattern=/(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|~~([^~]+)~~|\*([^*]+)\*)/g;
  let last=0,m;
  while((m=pattern.exec(source))){
    if(m.index>last)parent.appendChild(document.createTextNode(source.slice(last,m.index)));
    if(m[2]&&m[3]){const a=document.createElement('a');a.textContent=m[2];a.href=m[3];a.target='_blank';a.rel='noopener noreferrer';a.style.color='inherit';a.style.textDecoration='underline';parent.appendChild(a);}
    else if(m[4]){const code=document.createElement('code');code.textContent=m[4];code.style.cssText='font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:rgba(127,127,127,.18);padding:.08em .3em;border-radius:.3em;';parent.appendChild(code);}
    else if(m[5]){const strong=document.createElement('strong');strong.textContent=m[5];parent.appendChild(strong);}
    else if(m[6]){const del=document.createElement('del');del.textContent=m[6];parent.appendChild(del);}
    else if(m[7]){const em=document.createElement('em');em.textContent=m[7];parent.appendChild(em);}
    last=pattern.lastIndex;
  }
  if(last<source.length)parent.appendChild(document.createTextNode(source.slice(last)));
}

function sg612CodeNode(text,language){
  const root=document.createElement('div');root.className='supergui-code-display';root.style.cssText='width:100%;height:100%;box-sizing:border-box;display:flex;flex-direction:column;overflow:hidden;background:#11151d;color:#eef2ff;border-radius:inherit;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;';
  if(language){const bar=document.createElement('div');bar.textContent=String(language);bar.style.cssText='flex:0 0 auto;padding:4px 7px;font-size:.78em;opacity:.65;border-bottom:1px solid rgba(255,255,255,.1);user-select:text;';root.appendChild(bar);}
  const pre=document.createElement('pre');pre.style.cssText='flex:1;min-height:0;margin:0;padding:8px;overflow:auto;white-space:pre;tab-size:4;font:inherit;line-height:1.4;user-select:text;';const code=document.createElement('code');code.textContent=String(text??'');pre.appendChild(code);root.appendChild(pre);return root;
}

function sg612MarkdownNode(text){
  const root=document.createElement('div');root.className='supergui-markdown-display';root.style.cssText='width:100%;height:100%;box-sizing:border-box;overflow:auto;white-space:normal;word-break:break-word;user-select:text;';
  const lines=String(text??'').replace(/\r\n?/g,'\n').split('\n');
  let inFence=false,fenceLang='',fenceLines=[],list=null,listOrdered=false;
  const flushList=()=>{if(list){root.appendChild(list);list=null;}};
  const flushFence=()=>{if(inFence){root.appendChild(sg612CodeNode(fenceLines.join('\n'),fenceLang));inFence=false;fenceLang='';fenceLines=[];}};
  for(const line of lines){
    const fence=line.match(/^```\s*([^`]*)$/);
    if(fence){if(inFence)flushFence();else{flushList();inFence=true;fenceLang=fence[1].trim();fenceLines=[];}continue;}
    if(inFence){fenceLines.push(line);continue;}
    const heading=line.match(/^(#{1,6})\s+(.*)$/);
    if(heading){flushList();const h=document.createElement('h'+heading[1].length);h.style.cssText='margin:.45em 0 .25em;line-height:1.2;';sg612AppendInline(h,heading[2]);root.appendChild(h);continue;}
    const quote=line.match(/^>\s?(.*)$/);
    if(quote){flushList();const q=document.createElement('blockquote');q.style.cssText='margin:.4em 0;padding:.2em .7em;border-left:3px solid currentColor;opacity:.82;';sg612AppendInline(q,quote[1]);root.appendChild(q);continue;}
    const item=line.match(/^\s*([-*+] |\d+\. )(.*)$/);
    if(item){const ordered=/^\d/.test(item[1]);if(!list||ordered!==listOrdered){flushList();list=document.createElement(ordered?'ol':'ul');listOrdered=ordered;list.style.cssText='margin:.35em 0;padding-left:1.5em;';}const li=document.createElement('li');sg612AppendInline(li,item[2]);list.appendChild(li);continue;}
    flushList();
    if(/^\s*---+\s*$/.test(line)){root.appendChild(document.createElement('hr'));continue;}
    if(!line.trim()){const spacer=document.createElement('div');spacer.style.height='.55em';root.appendChild(spacer);continue;}
    const p=document.createElement('div');p.style.cssText='margin:.18em 0;line-height:1.4;';sg612AppendInline(p,line);root.appendChild(p);
  }
  flushList();flushFence();return root;
}

function sg612ReplaceContentNode(wrap,node){
  if(!wrap||!node)return;
  const art=wrap.querySelector&&wrap.querySelector('.supergui-custom-art');
  Array.from(wrap.children).forEach(c=>{if(c!==art)c.remove();});
  if(art)wrap.insertBefore(node,art);else wrap.appendChild(node);
}

const _sg612OriginalCreateV6ElementDom=SuperGUI.prototype._createV6ElementDom;
SuperGUI.prototype._createV6ElementDom=function(panelKey,elId,el,wrap){
  const out=_sg612OriginalCreateV6ElementDom.call(this,panelKey,elId,el,wrap);
  if(!wrap||!el)return out;
  const text=String(el.text??el.value??'');
  const mode=el.type==='markdown'?'markdown':sg612Mode(el.contentMode||'plain');
  const eligible=new Set(['markdown','richtext','chatbubble','card','statcard','notification','toast','alert','listitem','panelheader']);
  if(!eligible.has(el.type)||mode==='plain'||el.type==='richtext'&&mode==='plain')return out;
  const node=mode==='code'?sg612CodeNode(text,el.codeLanguage||''):sg612MarkdownNode(text);
  node.style.color=(el.style&&el.style.color)||'inherit';
  node.style.fontSize=((el.style&&Number(el.style.fontSize))||14)*(this._stageScale||1)+'px';
  sg612ReplaceContentNode(wrap,node);
  wrap.dataset.contentMode=mode;
  return wrap;
};
