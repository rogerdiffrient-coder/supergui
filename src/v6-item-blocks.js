// SuperGUI 6.0.6: dedicated block coverage for every v6 item type.
const _sg606GetInfo=SuperGUI.prototype.getInfo;
SuperGUI.prototype.getInfo=function(){
  const info=_sg606GetInfo.call(this),B=Scratch.BlockType,S=Scratch.ArgumentType;
  const str=(menu,v='')=>({type:S.STRING,...(menu?{menu}:{}),defaultValue:v}),num=v=>({type:S.NUMBER,defaultValue:v}),bool=v=>({type:S.BOOLEAN,defaultValue:v});
  info.menus=info.menus||{};
  info.menus.sg606Side={acceptReporters:false,items:['left','right']};
  info.menus.sg606Clock={acceptReporters:false,items:['24h','12h','seconds','date+time']};
  info.menus.sg606Sort={acceptReporters:false,items:['ascending','descending']};
  const blocks=[
    {blockType:B.LABEL,text:'─── v6: icon / avatar / cards ───'},
    {opcode:'sg606Icon',blockType:B.COMMAND,text:'set icon [E] glyph [V]',arguments:{E:str('elements'),V:str(null,'★')}},
    {opcode:'sg606Avatar',blockType:B.COMMAND,text:'set avatar [E] image [URL] fallback [TEXT]',arguments:{E:str('elements'),URL:str(null,''),TEXT:str(null,'?')}},
    {opcode:'sg606Card',blockType:B.COMMAND,text:'set card [E] title [TITLE] subtitle [SUB]',arguments:{E:str('elements'),TITLE:str(null,'Card'),SUB:str(null,'Subtitle')}},
    {opcode:'sg606PanelHeader',blockType:B.COMMAND,text:'set panel header [E] title [TEXT]',arguments:{E:str('elements'),TEXT:str(null,'Window')}},
    {opcode:'sg606Breadcrumb',blockType:B.COMMAND,text:'set breadcrumbs [E] items JSON [JSON]',arguments:{E:str('elements'),JSON:str(null,'["Home","Page"]')}},
    {opcode:'sg606Pagination',blockType:B.COMMAND,text:'set pagination [E] page [PAGE] of [COUNT]',arguments:{E:str('elements'),PAGE:num(1),COUNT:num(5)}},

    {blockType:B.LABEL,text:'─── v6: notification / badges ───'},
    {opcode:'sg606Notification',blockType:B.COMMAND,text:'set notification [E] icon [ICON] text [TEXT]',arguments:{E:str('elements'),ICON:str(null,'!'),TEXT:str(null,'Notification')}},
    {opcode:'sg606Toast',blockType:B.COMMAND,text:'show toast [E] text [TEXT] for [SECONDS] sec',arguments:{E:str('elements'),TEXT:str(null,'Saved!'),SECONDS:num(3)}},
    {opcode:'sg606Alert',blockType:B.COMMAND,text:'set alert [E] level [LEVEL] text [TEXT]',arguments:{E:str('elements'),LEVEL:str(null,'info'),TEXT:str(null,'Alert')}},
    {opcode:'sg606Chip',blockType:B.COMMAND,text:'set chip [E] text [TEXT]',arguments:{E:str('elements'),TEXT:str(null,'Chip')}},
    {opcode:'sg606Tag',blockType:B.COMMAND,text:'set tag [E] text [TEXT]',arguments:{E:str('elements'),TEXT:str(null,'Tag')}},
    {opcode:'sg606Pill',blockType:B.COMMAND,text:'set pill [E] text [TEXT]',arguments:{E:str('elements'),TEXT:str(null,'Pill')}},

    {blockType:B.LABEL,text:'─── v6: meters / charts / maps ───'},
    {opcode:'sg606Meter',blockType:B.COMMAND,text:'set meter [E] value [V] min [MIN] max [MAX]',arguments:{E:str('elements'),V:num(50),MIN:num(0),MAX:num(100)}},
    {opcode:'sg606Gauge',blockType:B.COMMAND,text:'set gauge [E] value [V] min [MIN] max [MAX]',arguments:{E:str('elements'),V:num(50),MIN:num(0),MAX:num(100)}},
    {opcode:'sg606Thermometer',blockType:B.COMMAND,text:'set thermometer [E] value [V] min [MIN] max [MAX]',arguments:{E:str('elements'),V:num(20),MIN:num(0),MAX:num(100)}},
    {opcode:'sg606Sparkline',blockType:B.COMMAND,text:'set sparkline [E] values JSON [JSON]',arguments:{E:str('elements'),JSON:str(null,'[1,4,2,8]')}},
    {opcode:'sg606BarChart',blockType:B.COMMAND,text:'set bar chart [E] labels [LABELS] values [VALUES]',arguments:{E:str('elements'),LABELS:str(null,'["A","B"]'),VALUES:str(null,'[10,20]')}},
    {opcode:'sg606LineChart',blockType:B.COMMAND,text:'set line chart [E] labels [LABELS] values [VALUES]',arguments:{E:str('elements'),LABELS:str(null,'["A","B"]'),VALUES:str(null,'[10,20]')}},
    {opcode:'sg606PieChart',blockType:B.COMMAND,text:'set pie chart [E] labels [LABELS] values [VALUES]',arguments:{E:str('elements'),LABELS:str(null,'["A","B"]'),VALUES:str(null,'[10,20]')}},
    {opcode:'sg606MiniMap',blockType:B.COMMAND,text:'set mini map [E] markers JSON [JSON]',arguments:{E:str('elements'),JSON:str(null,'[]')}},
    {opcode:'sg606MapMarker',blockType:B.COMMAND,text:'set map marker [E] label [TEXT] icon [ICON]',arguments:{E:str('elements'),TEXT:str(null,'Here'),ICON:str(null,'●')}},

    {blockType:B.LABEL,text:'─── v6: time / date ───'},
    {opcode:'sg606Clock',blockType:B.COMMAND,text:'set clock [E] format [FORMAT] UTC offset [OFFSET]',arguments:{E:str('elements'),FORMAT:str('sg606Clock','24h'),OFFSET:num(0)}},
    {opcode:'sg606Timer',blockType:B.COMMAND,text:'set timer [E] seconds [SECONDS] running [RUNNING]',arguments:{E:str('elements'),SECONDS:num(60),RUNNING:bool(true)}},
    {opcode:'sg606Calendar',blockType:B.COMMAND,text:'set calendar [E] selected date [DATE]',arguments:{E:str('elements'),DATE:str(null,'2026-08-12')}},
    {opcode:'sg606DatePicker',blockType:B.COMMAND,text:'set date picker [E] value [DATE]',arguments:{E:str('elements'),DATE:str(null,'2026-08-12')}},

    {blockType:B.LABEL,text:'─── v6: inputs ───'},
    {opcode:'sg606FilePicker',blockType:B.COMMAND,text:'set file picker [E] accept [TYPES] multiple [MULTIPLE]',arguments:{E:str('elements'),TYPES:str(null,'image/*'),MULTIPLE:bool(false)}},
    {opcode:'sg606TextArea',blockType:B.COMMAND,text:'set text area [E] text [TEXT] placeholder [PLACEHOLDER]',arguments:{E:str('elements'),TEXT:str(null,''),PLACEHOLDER:str(null,'Type here...')}},
    {opcode:'sg606Password',blockType:B.COMMAND,text:'set password input [E] value [VALUE]',arguments:{E:str('elements'),VALUE:str(null,'')}},
    {opcode:'sg606Email',blockType:B.COMMAND,text:'set email input [E] value [VALUE]',arguments:{E:str('elements'),VALUE:str(null,'name@example.com')}},
    {opcode:'sg606URLInput',blockType:B.COMMAND,text:'set URL input [E] value [VALUE]',arguments:{E:str('elements'),VALUE:str(null,'https://example.com')}},
    {opcode:'sg606Stepper',blockType:B.COMMAND,text:'set stepper [E] value [VALUE] step [STEP]',arguments:{E:str('elements'),VALUE:num(0),STEP:num(1)}},

    {blockType:B.LABEL,text:'─── v6: selectors / menus / lists ───'},
    {opcode:'sg606Segmented',blockType:B.COMMAND,text:'set segmented control [E] options JSON [JSON]',arguments:{E:str('elements'),JSON:str(null,'["One","Two"]')}},
    {opcode:'sg606Toolbar',blockType:B.COMMAND,text:'set toolbar [E] items JSON [JSON]',arguments:{E:str('elements'),JSON:str(null,'[]')}},
    {opcode:'sg606MenuBar',blockType:B.COMMAND,text:'set menu bar [E] items JSON [JSON]',arguments:{E:str('elements'),JSON:str(null,'[]')}},
    {opcode:'sg606ContextMenu',blockType:B.COMMAND,text:'show context menu [E] x [X] y [Y] items [JSON]',arguments:{E:str('elements'),X:num(50),Y:num(50),JSON:str(null,'[]')}},
    {opcode:'sg606HideContextMenu',blockType:B.COMMAND,text:'hide context menu [E]',arguments:{E:str('elements')}},
    {opcode:'sg606Tree',blockType:B.COMMAND,text:'set tree view [E] nodes JSON [JSON]',arguments:{E:str('elements'),JSON:str(null,'[]')}},
    {opcode:'sg606List',blockType:B.COMMAND,text:'set list [E] items JSON [JSON]',arguments:{E:str('elements'),JSON:str(null,'[]')}},
    {opcode:'sg606ListItem',blockType:B.COMMAND,text:'set list item [E] text [TEXT]',arguments:{E:str('elements'),TEXT:str(null,'Item')}},

    {blockType:B.LABEL,text:'─── v6: tables / stats / keys ───'},
    {opcode:'sg606Table',blockType:B.COMMAND,text:'set table [E] columns [COLUMNS] rows [ROWS]',arguments:{E:str('elements'),COLUMNS:str(null,'[]'),ROWS:str(null,'[]')}},
    {opcode:'sg606DataGrid',blockType:B.COMMAND,text:'set data grid [E] columns [COLUMNS] rows [ROWS]',arguments:{E:str('elements'),COLUMNS:str(null,'[]'),ROWS:str(null,'[]')}},
    {opcode:'sg606SortGrid',blockType:B.COMMAND,text:'sort data grid [E] column [COLUMN] [DIRECTION]',arguments:{E:str('elements'),COLUMN:str(null,'score'),DIRECTION:str('sg606Sort','ascending')}},
    {opcode:'sg606StatCard',blockType:B.COMMAND,text:'set stat card [E] label [LABEL] value [VALUE]',arguments:{E:str('elements'),LABEL:str(null,'Score'),VALUE:str(null,'100')}},
    {opcode:'sg606KeyCap',blockType:B.COMMAND,text:'set key cap [E] key [KEY]',arguments:{E:str('elements'),KEY:str(null,'A')}},
    {opcode:'sg606Hotkey',blockType:B.COMMAND,text:'set hotkey [E] keys [KEYS]',arguments:{E:str('elements'),KEYS:str(null,'Ctrl+S')}},

    {blockType:B.LABEL,text:'─── v6: layout / embed / content ───'},
    {opcode:'sg606Spacer',blockType:B.COMMAND,text:'set spacer [E] size w [W] h [H]',arguments:{E:str('elements'),W:num(10),H:num(10)}},
    {opcode:'sg606ScrollArea',blockType:B.COMMAND,text:'scroll area [E] to x [X] y [Y]',arguments:{E:str('elements'),X:num(0),Y:num(0)}},
    {opcode:'sg606ScrollX',blockType:B.REPORTER,text:'scroll area [E] x',arguments:{E:str('elements')}},
    {opcode:'sg606ScrollY',blockType:B.REPORTER,text:'scroll area [E] y',arguments:{E:str('elements')}},
    {opcode:'sg606WebEmbed',blockType:B.COMMAND,text:'set web embed [E] URL [URL]',arguments:{E:str('elements'),URL:str(null,'https://example.com')}},
    {opcode:'sg606ReloadEmbed',blockType:B.COMMAND,text:'reload web embed [E]',arguments:{E:str('elements')}},
    {opcode:'sg606Markdown',blockType:B.COMMAND,text:'set markdown [E] source [TEXT]',arguments:{E:str('elements'),TEXT:str(null,'# Hello')}},
    {opcode:'sg606RichText',blockType:B.COMMAND,text:'set rich text [E] HTML [HTML]',arguments:{E:str('elements'),HTML:str(null,'<b>Hello</b>')}},

    {blockType:B.LABEL,text:'─── v6: terminal / chat ───'},
    {opcode:'sg606Terminal',blockType:B.COMMAND,text:'set terminal [E] max lines [COUNT]',arguments:{E:str('elements'),COUNT:num(200)}},
    {opcode:'sg606TerminalError',blockType:B.COMMAND,text:'append terminal [E] error [TEXT]',arguments:{E:str('elements'),TEXT:str(null,'Error')}},
    {opcode:'sg606ChatBubble',blockType:B.COMMAND,text:'set chat bubble [E] text [TEXT] side [SIDE]',arguments:{E:str('elements'),TEXT:str(null,'Hello'),SIDE:str('sg606Side','left')}}
  ];
  info.blocks=blocks.concat(info.blocks||[]);return info;
};

function sg606f(ext,id,type){const f=ext._findElement(String(id||''));return f&&f.el.type===type?f:null;}
function sg606r(ext,f){if(f)ext._renderPanel(f.panelKey);}
function sg606j(v,d=[]){try{return JSON.parse(String(v||''));}catch(e){return d;}}
function sg606m(ext,a,type,fn){const f=sg606f(ext,a.E,type);if(!f)return;fn(f.el,f);sg606r(ext,f);}
function sg606range(ext,a,type){sg606m(ext,a,type,e=>{e.value=Number(a.V)||0;e.min=Number(a.MIN)||0;e.max=Number(a.MAX)||100;});}
function sg606chart(ext,a,type){sg606m(ext,a,type,e=>{e.labels=sg606j(a.LABELS,[]);e.values=sg606j(a.VALUES,[]);});}

SuperGUI.prototype.sg606Icon=function(a){sg606m(this,a,'icon',e=>{e.icon=String(a.V||'★');e.text=e.icon;});};
SuperGUI.prototype.sg606Avatar=function(a){sg606m(this,a,'avatar',e=>{e.image=String(a.URL||'');e.text=String(a.TEXT||'?');});};
SuperGUI.prototype.sg606Card=function(a){sg606m(this,a,'card',e=>{e.title=String(a.TITLE||'');e.subtitle=String(a.SUB||'');});};
SuperGUI.prototype.sg606PanelHeader=function(a){sg606m(this,a,'panelheader',e=>e.text=String(a.TEXT||''));};
SuperGUI.prototype.sg606Breadcrumb=function(a){sg606m(this,a,'breadcrumb',e=>e.items=sg606j(a.JSON,[]));};
SuperGUI.prototype.sg606Pagination=function(a){sg606m(this,a,'pagination',e=>{e.pageCount=Math.max(1,Number(a.COUNT)||1);e.selectedIndex=Math.max(0,Math.min(e.pageCount-1,(Number(a.PAGE)||1)-1));e.items=Array.from({length:e.pageCount},(_,i)=>String(i+1));});};
SuperGUI.prototype.sg606Notification=function(a){sg606m(this,a,'notification',e=>{e.icon=String(a.ICON||'');e.text=String(a.TEXT||'');});};
SuperGUI.prototype.sg606Toast=function(a){const f=sg606f(this,a.E,'toast');if(!f)return;f.el.text=String(a.TEXT||'');f.el.duration=Math.max(0,Number(a.SECONDS)||0);f.el.hidden=false;sg606r(this,f);setTimeout(()=>{f.el.hidden=true;sg606r(this,f);},f.el.duration*1000);};
SuperGUI.prototype.sg606Alert=function(a){sg606m(this,a,'alert',e=>{e.level=String(a.LEVEL||'info');e.text=String(a.TEXT||'');});};
for(const [n,t] of [['sg606Chip','chip'],['sg606Tag','tag'],['sg606Pill','pill'],['sg606ListItem','listitem']])SuperGUI.prototype[n]=function(a){sg606m(this,a,t,e=>e.text=String(a.TEXT||''));};
SuperGUI.prototype.sg606Meter=function(a){sg606range(this,a,'meter');};SuperGUI.prototype.sg606Gauge=function(a){sg606range(this,a,'gauge');};SuperGUI.prototype.sg606Thermometer=function(a){sg606range(this,a,'thermometer');};
SuperGUI.prototype.sg606Sparkline=function(a){sg606m(this,a,'sparkline',e=>e.values=sg606j(a.JSON,[]));};
SuperGUI.prototype.sg606BarChart=function(a){sg606chart(this,a,'barchart');};SuperGUI.prototype.sg606LineChart=function(a){sg606chart(this,a,'linechart');};SuperGUI.prototype.sg606PieChart=function(a){sg606chart(this,a,'piechart');};
SuperGUI.prototype.sg606MiniMap=function(a){sg606m(this,a,'minimap',e=>e.markers=sg606j(a.JSON,[]));};
SuperGUI.prototype.sg606MapMarker=function(a){sg606m(this,a,'mapmarker',e=>{e.text=String(a.TEXT||'');e.icon=String(a.ICON||'●');});};
SuperGUI.prototype.sg606Clock=function(a){sg606m(this,a,'clock',e=>{e.clockFormat=String(a.FORMAT||'24h');e.utcOffsetHours=Number(a.OFFSET)||0;});};
SuperGUI.prototype.sg606Timer=function(a){sg606m(this,a,'timer',e=>{e.seconds=Math.max(0,Number(a.SECONDS)||0);e.running=!!a.RUNNING;});};
SuperGUI.prototype.sg606Calendar=function(a){sg606m(this,a,'calendar',e=>e.date=String(a.DATE||''));};
SuperGUI.prototype.sg606DatePicker=function(a){sg606m(this,a,'datepicker',e=>e.value=String(a.DATE||''));};
SuperGUI.prototype.sg606FilePicker=function(a){sg606m(this,a,'filepicker',e=>{e.accept=String(a.TYPES||'');e.multiple=!!a.MULTIPLE;});};
SuperGUI.prototype.sg606TextArea=function(a){sg606m(this,a,'textarea',e=>{e.value=String(a.TEXT||'');e.placeholder=String(a.PLACEHOLDER||'');});};
SuperGUI.prototype.sg606Password=function(a){sg606m(this,a,'passwordinput',e=>e.value=String(a.VALUE||''));};SuperGUI.prototype.sg606Email=function(a){sg606m(this,a,'emailinput',e=>e.value=String(a.VALUE||''));};SuperGUI.prototype.sg606URLInput=function(a){sg606m(this,a,'urlinput',e=>e.value=String(a.VALUE||''));};
SuperGUI.prototype.sg606Stepper=function(a){sg606m(this,a,'stepper',e=>{e.value=Number(a.VALUE)||0;e.step=Number(a.STEP)||1;});};
for(const [n,t] of [['sg606Segmented','segmentedcontrol'],['sg606Toolbar','toolbar'],['sg606MenuBar','menubar'],['sg606Tree','treeview'],['sg606List','list']])SuperGUI.prototype[n]=function(a){sg606m(this,a,t,e=>e.items=sg606j(a.JSON,[]));};
SuperGUI.prototype.sg606ContextMenu=function(a){sg606m(this,a,'contextmenu',e=>{e.x=Number(a.X)||0;e.y=Number(a.Y)||0;e.items=sg606j(a.JSON,[]);e.hidden=false;});};SuperGUI.prototype.sg606HideContextMenu=function(a){sg606m(this,a,'contextmenu',e=>e.hidden=true);};
function sg606table(ext,a,t){sg606m(ext,a,t,e=>{e.columns=sg606j(a.COLUMNS,[]);e.rows=sg606j(a.ROWS,[]);});}
SuperGUI.prototype.sg606Table=function(a){sg606table(this,a,'table');};SuperGUI.prototype.sg606DataGrid=function(a){sg606table(this,a,'datagrid');};
SuperGUI.prototype.sg606SortGrid=function(a){sg606m(this,a,'datagrid',e=>{const k=String(a.COLUMN||''),d=String(a.DIRECTION)==='descending'?-1:1;e.rows=(Array.isArray(e.rows)?e.rows:[]).sort((x,y)=>String((x||{})[k]??'').localeCompare(String((y||{})[k]??''),undefined,{numeric:true})*d);});};
SuperGUI.prototype.sg606StatCard=function(a){sg606m(this,a,'statcard',e=>{e.title=String(a.LABEL||'');e.value=String(a.VALUE??'');});};SuperGUI.prototype.sg606KeyCap=function(a){sg606m(this,a,'keycap',e=>e.text=String(a.KEY||''));};SuperGUI.prototype.sg606Hotkey=function(a){sg606m(this,a,'hotkey',e=>e.text=String(a.KEYS||''));};
SuperGUI.prototype.sg606Spacer=function(a){sg606m(this,a,'spacer',e=>{e.width=Number(a.W)||0;e.height=Number(a.H)||0;});};
SuperGUI.prototype.sg606ScrollArea=function(a){const f=sg606f(this,a.E,'scrollarea');if(!f)return;f.el.scrollX=Number(a.X)||0;f.el.scrollY=Number(a.Y)||0;const n=this.elementDoms&&this.elementDoms[a.E],s=n&&(n.querySelector('.supergui-scrollarea')||n.firstElementChild);if(s){s.scrollLeft=f.el.scrollX;s.scrollTop=f.el.scrollY;}};
SuperGUI.prototype.sg606ScrollX=function(a){const f=sg606f(this,a.E,'scrollarea');return f?Number(f.el.scrollX)||0:0;};SuperGUI.prototype.sg606ScrollY=function(a){const f=sg606f(this,a.E,'scrollarea');return f?Number(f.el.scrollY)||0:0;};
SuperGUI.prototype.sg606WebEmbed=function(a){sg606m(this,a,'iframe',e=>e.url=String(a.URL||''));};SuperGUI.prototype.sg606ReloadEmbed=function(a){const f=sg606f(this,a.E,'iframe'),n=this.elementDoms&&this.elementDoms[a.E],i=n&&n.querySelector('iframe');if(i)i.src=i.src;else sg606r(this,f);};
SuperGUI.prototype.sg606Markdown=function(a){sg606m(this,a,'markdown',e=>e.text=String(a.TEXT||''));};SuperGUI.prototype.sg606RichText=function(a){sg606m(this,a,'richtext',e=>e.html=String(a.HTML||''));};
SuperGUI.prototype.sg606Terminal=function(a){sg606m(this,a,'terminal',e=>{e.maxLines=Math.max(1,Number(a.COUNT)||200);if(Array.isArray(e.lines)&&e.lines.length>e.maxLines)e.lines=e.lines.slice(-e.maxLines);});};
SuperGUI.prototype.sg606TerminalError=function(a){sg606m(this,a,'terminal',e=>{e.lines=Array.isArray(e.lines)?e.lines:[];e.lines.push('ERROR: '+String(a.TEXT||''));e.text=e.lines.join('\n');});};
SuperGUI.prototype.sg606ChatBubble=function(a){sg606m(this,a,'chatbubble',e=>{e.text=String(a.TEXT||'');e.side=String(a.SIDE||'left');});};
