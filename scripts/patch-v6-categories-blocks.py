from pathlib import Path

# Repair palette categories.
p=Path('src/v5x-overhaul.js')
s=p.read_text()
s=s.replace("info.menus.paletteModes = { acceptReporters:false, items:['compact','all'] };","info.menus.paletteModes = { acceptReporters:false, items:['core','panels','elements','appearance','layout','data','game services','v6','all'] };")
s=s.replace("text:'show [MODE] SuperGUI blocks'","text:'show SuperGUI category [MODE]'")
start=s.index("  if (this._compactPalette === undefined) this._compactPalette = true;")
end=s.index("  return info;", start)
newfilter='''  if (this._paletteCategory === undefined) this._paletteCategory = 'core';
  const category = String(this._paletteCategory || 'core').toLowerCase();
  if (category !== 'all') {
    const categoryTests = {
      core: /palette|events|save \\/ load/i,
      panels: /panels/i,
      elements: /element create|element transform|element value|elements/i,
      appearance: /appearance|custom art|theme/i,
      layout: /layout|container|animation|drag/i,
      data: /leaderboard|achievement|data/i,
      'game services': /game services|storage|cloud/i,
      v6: /v6:/i
    };
    const test = categoryTests[category] || categoryTests.core;
    let active = false;
    info.blocks = info.blocks.filter(block => {
      if (block.blockType === B.LABEL) {
        active = test.test(String(block.text || '')) || /SuperGUI palette/i.test(String(block.text || ''));
        return active;
      }
      if (block.opcode === 'setBlockPaletteMode') return true;
      return active;
    });
  }
'''
s=s[:start]+newfilter+s[end:]
s=s.replace("this._compactPalette = String(a.MODE || 'compact').toLowerCase() !== 'all';","this._paletteCategory = String(a.MODE || 'core').toLowerCase();")
p.write_text(s)

# Expand v6 blocks.
p=Path('src/v6.js')
s=p.read_text()
s=s.replace("info.menus.panelBorderStyles = {acceptReporters:false, items:['solid','dashed','dotted','double','none']};","info.menus.panelBorderStyles = {acceptReporters:false, items:['solid','dashed','dotted','double','none']};\n  info.menus.v6BubbleSides = {acceptReporters:false, items:['left','right']};")
needle="    {opcode:'setV6ItemItems',blockType:B.COMMAND,text:'set [E] v6 items JSON [JSON]',arguments:{E:str('elements'),JSON:str(null,'[]')}}\n  ];"
extra="""    {opcode:'setV6ItemItems',blockType:B.COMMAND,text:'set [E] v6 items JSON [JSON]',arguments:{E:str('elements'),JSON:str(null,'[]')}},
    {opcode:'getV6ItemItems',blockType:B.REPORTER,text:'[E] v6 items JSON',arguments:{E:str('elements')}},
    {opcode:'addV6Item',blockType:B.COMMAND,text:'add item [ITEM] to [E]',arguments:{ITEM:str(null,'Item'),E:str('elements')}},
    {opcode:'removeV6ItemAt',blockType:B.COMMAND,text:'remove item [INDEX] from [E]',arguments:{INDEX:num(1),E:str('elements')}},
    {opcode:'clearV6Items',blockType:B.COMMAND,text:'clear items in [E]',arguments:{E:str('elements')}},
    {opcode:'getV6ItemAt',blockType:B.REPORTER,text:'item [INDEX] of [E]',arguments:{INDEX:num(1),E:str('elements')}},
    {opcode:'getV6ItemCount',blockType:B.REPORTER,text:'item count of [E]',arguments:{E:str('elements')}},

    {blockType:B.LABEL,text:'─── v6: Values / selection ───'},
    {opcode:'setV6Value',blockType:B.COMMAND,text:'set [E] v6 value [VALUE]',arguments:{E:str('elements'),VALUE:str(null,'50')}},
    {opcode:'getV6Value',blockType:B.REPORTER,text:'[E] v6 value',arguments:{E:str('elements')}},
    {opcode:'setV6Range',blockType:B.COMMAND,text:'set [E] range min [MIN] max [MAX]',arguments:{E:str('elements'),MIN:num(0),MAX:num(100)}},
    {opcode:'setV6SelectedIndex',blockType:B.COMMAND,text:'set [E] selected index [INDEX]',arguments:{E:str('elements'),INDEX:num(1)}},
    {opcode:'getV6SelectedIndex',blockType:B.REPORTER,text:'selected index of [E]',arguments:{E:str('elements')}},
    {opcode:'getV6SelectedItem',blockType:B.REPORTER,text:'selected item of [E]',arguments:{E:str('elements')}},
    {opcode:'setV6Progress',blockType:B.COMMAND,text:'set [E] progress [VALUE]%',arguments:{E:str('elements'),VALUE:num(50)}},

    {blockType:B.LABEL,text:'─── v6: Content / inputs ───'},
    {opcode:'setV6Placeholder',blockType:B.COMMAND,text:'set [E] placeholder [TEXT]',arguments:{E:str('elements'),TEXT:str(null,'Type here...')}},
    {opcode:'setV6URL',blockType:B.COMMAND,text:'set [E] URL [URL]',arguments:{E:str('elements'),URL:str(null,'https://example.com')}},
    {opcode:'getV6URL',blockType:B.REPORTER,text:'URL of [E]',arguments:{E:str('elements')}},
    {opcode:'setV6Image',blockType:B.COMMAND,text:'set [E] image [URL]',arguments:{E:str('elements'),URL:str(null,'')}},
    {opcode:'appendV6Text',blockType:B.COMMAND,text:'append [TEXT] to [E]',arguments:{TEXT:str(null,'Hello'),E:str('elements')}},
    {opcode:'clearV6Content',blockType:B.COMMAND,text:'clear content of [E]',arguments:{E:str('elements')}},
    {opcode:'setV6Rows',blockType:B.COMMAND,text:'set [E] rows JSON [JSON]',arguments:{E:str('elements'),JSON:str(null,'[]')}},
    {opcode:'getV6Rows',blockType:B.REPORTER,text:'rows JSON of [E]',arguments:{E:str('elements')}},
    {opcode:'setV6Columns',blockType:B.COMMAND,text:'set [E] columns JSON [JSON]',arguments:{E:str('elements'),JSON:str(null,'[]')}},
    {opcode:'setV6ChartValues',blockType:B.COMMAND,text:'set [E] chart values [JSON]',arguments:{E:str('elements'),JSON:str(null,'[10,20,30]')}},

    {blockType:B.LABEL,text:'─── v6: Terminal / chat / time ───'},
    {opcode:'appendTerminalLineV6',blockType:B.COMMAND,text:'append terminal line [TEXT] to [E]',arguments:{TEXT:str(null,'Ready.'),E:str('elements')}},
    {opcode:'clearTerminalV6',blockType:B.COMMAND,text:'clear terminal [E]',arguments:{E:str('elements')}},
    {opcode:'setChatBubbleSideV6',blockType:B.COMMAND,text:'set chat bubble [E] side [SIDE]',arguments:{E:str('elements'),SIDE:str('v6BubbleSides','left')}},
    {opcode:'setV6Date',blockType:B.COMMAND,text:'set [E] date [DATE]',arguments:{E:str('elements'),DATE:str(null,'2026-08-12')}},
    {opcode:'setV6TimerSeconds',blockType:B.COMMAND,text:'set [E] timer seconds [SECONDS]',arguments:{E:str('elements'),SECONDS:num(60)}},
    {opcode:'getV6TimerSeconds',blockType:B.REPORTER,text:'timer seconds of [E]',arguments:{E:str('elements')}},

    {blockType:B.LABEL,text:'─── v6: Generic property ───'},
    {opcode:'setV6Property',blockType:B.COMMAND,text:'set [E] property [KEY] to [VALUE]',arguments:{E:str('elements'),KEY:str(null,'title'),VALUE:str(null,'Hello')}},
    {opcode:'getV6Property',blockType:B.REPORTER,text:'property [KEY] of [E]',arguments:{KEY:str(null,'title'),E:str('elements')}}
  ];"""
if needle not in s: raise SystemExit('v6 item block marker not found')
s=s.replace(needle,extra,1)
s += r'''

// v6.0.1 direct item controls
function v6Find(ext,a){return ext._findElement(a.E);}
SuperGUI.prototype.getV6ItemItems=function(a){const f=v6Find(this,a);return f?JSON.stringify(f.el.items||[]):'[]';};
SuperGUI.prototype.addV6Item=function(a){const f=v6Find(this,a);if(!f)return;f.el.items=Array.isArray(f.el.items)?f.el.items:[];f.el.items.push(String(a.ITEM??''));this._renderPanel(f.panelKey);};
SuperGUI.prototype.removeV6ItemAt=function(a){const f=v6Find(this,a);if(!f)return;f.el.items=Array.isArray(f.el.items)?f.el.items:[];f.el.items.splice(Math.max(0,Number(a.INDEX||1)-1),1);this._renderPanel(f.panelKey);};
SuperGUI.prototype.clearV6Items=function(a){const f=v6Find(this,a);if(!f)return;f.el.items=[];this._renderPanel(f.panelKey);};
SuperGUI.prototype.getV6ItemAt=function(a){const f=v6Find(this,a);return f&&Array.isArray(f.el.items)?(f.el.items[Math.max(0,Number(a.INDEX||1)-1)]??''):'';};
SuperGUI.prototype.getV6ItemCount=function(a){const f=v6Find(this,a);return f&&Array.isArray(f.el.items)?f.el.items.length:0;};
SuperGUI.prototype.setV6Value=function(a){const f=v6Find(this,a);if(!f)return;const n=Number(a.VALUE);f.el.value=Number.isFinite(n)&&String(a.VALUE).trim()!==''?n:String(a.VALUE??'');this._renderPanel(f.panelKey);};
SuperGUI.prototype.getV6Value=function(a){const f=v6Find(this,a);return f&&f.el.value!==undefined?f.el.value:'';};
SuperGUI.prototype.setV6Range=function(a){const f=v6Find(this,a);if(!f)return;f.el.min=Number(a.MIN)||0;f.el.max=Number(a.MAX)||0;this._renderPanel(f.panelKey);};
SuperGUI.prototype.setV6SelectedIndex=function(a){const f=v6Find(this,a);if(!f)return;f.el.selectedIndex=Math.max(0,Number(a.INDEX||1)-1);this._renderPanel(f.panelKey);};
SuperGUI.prototype.getV6SelectedIndex=function(a){const f=v6Find(this,a);return f?(Number(f.el.selectedIndex||0)+1):0;};
SuperGUI.prototype.getV6SelectedItem=function(a){const f=v6Find(this,a);if(!f)return '';const items=Array.isArray(f.el.items)?f.el.items:[];return items[Number(f.el.selectedIndex||0)]??'';};
SuperGUI.prototype.setV6Progress=function(a){const f=v6Find(this,a);if(!f)return;f.el.progress=Math.max(0,Math.min(100,Number(a.VALUE)||0));f.el.value=f.el.progress;this._renderPanel(f.panelKey);};
SuperGUI.prototype.setV6Placeholder=function(a){const f=v6Find(this,a);if(!f)return;f.el.placeholder=String(a.TEXT??'');this._renderPanel(f.panelKey);};
SuperGUI.prototype.setV6URL=function(a){const f=v6Find(this,a);if(!f)return;f.el.url=String(a.URL??'');f.el.src=f.el.url;this._renderPanel(f.panelKey);};
SuperGUI.prototype.getV6URL=function(a){const f=v6Find(this,a);return f?String(f.el.url||f.el.src||''):'';};
SuperGUI.prototype.setV6Image=function(a){const f=v6Find(this,a);if(!f)return;f.el.image=String(a.URL??'');f.el.icon=f.el.image;this._renderPanel(f.panelKey);};
SuperGUI.prototype.appendV6Text=function(a){const f=v6Find(this,a);if(!f)return;f.el.text=String(f.el.text||'')+String(a.TEXT??'');this._renderPanel(f.panelKey);};
SuperGUI.prototype.clearV6Content=function(a){const f=v6Find(this,a);if(!f)return;f.el.text='';f.el.value='';f.el.items=[];f.el.rows=[];this._renderPanel(f.panelKey);};
SuperGUI.prototype.setV6Rows=function(a){const f=v6Find(this,a);if(!f)return;try{const v=JSON.parse(String(a.JSON||'[]'));if(Array.isArray(v)){f.el.rows=v;f.el.items=v;this._renderPanel(f.panelKey);}}catch(e){}};
SuperGUI.prototype.getV6Rows=function(a){const f=v6Find(this,a);return f?JSON.stringify(f.el.rows||f.el.items||[]):'[]';};
SuperGUI.prototype.setV6Columns=function(a){const f=v6Find(this,a);if(!f)return;try{const v=JSON.parse(String(a.JSON||'[]'));if(Array.isArray(v)){f.el.columns=v;this._renderPanel(f.panelKey);}}catch(e){}};
SuperGUI.prototype.setV6ChartValues=function(a){const f=v6Find(this,a);if(!f)return;try{const v=JSON.parse(String(a.JSON||'[]'));if(Array.isArray(v)){f.el.values=v;f.el.items=v;this._renderPanel(f.panelKey);}}catch(e){}};
SuperGUI.prototype.appendTerminalLineV6=function(a){const f=v6Find(this,a);if(!f)return;f.el.lines=Array.isArray(f.el.lines)?f.el.lines:[];f.el.lines.push(String(a.TEXT??''));f.el.text=f.el.lines.join('\n');this._renderPanel(f.panelKey);};
SuperGUI.prototype.clearTerminalV6=function(a){const f=v6Find(this,a);if(!f)return;f.el.lines=[];f.el.text='';this._renderPanel(f.panelKey);};
SuperGUI.prototype.setChatBubbleSideV6=function(a){const f=v6Find(this,a);if(!f)return;f.el.side=String(a.SIDE)==='right'?'right':'left';this._renderPanel(f.panelKey);};
SuperGUI.prototype.setV6Date=function(a){const f=v6Find(this,a);if(!f)return;f.el.date=String(a.DATE??'');f.el.value=f.el.date;this._renderPanel(f.panelKey);};
SuperGUI.prototype.setV6TimerSeconds=function(a){const f=v6Find(this,a);if(!f)return;f.el.seconds=Math.max(0,Number(a.SECONDS)||0);f.el.value=f.el.seconds;this._renderPanel(f.panelKey);};
SuperGUI.prototype.getV6TimerSeconds=function(a){const f=v6Find(this,a);return f?Number(f.el.seconds??f.el.value??0):0;};
SuperGUI.prototype.setV6Property=function(a){const f=v6Find(this,a);if(!f)return;const key=String(a.KEY||'').trim();if(!key||['__proto__','prototype','constructor'].includes(key))return;let v=a.VALUE;try{v=JSON.parse(String(a.VALUE));}catch(e){}f.el[key]=v;this._renderPanel(f.panelKey);};
SuperGUI.prototype.getV6Property=function(a){const f=v6Find(this,a);if(!f)return '';const key=String(a.KEY||'').trim(),v=f.el[key];return typeof v==='object'?JSON.stringify(v):(v??'');};
'''
p.write_text(s)
