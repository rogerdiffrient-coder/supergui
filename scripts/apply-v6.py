from pathlib import Path
import json

TYPES = ['icon','avatar','card','panelheader','breadcrumb','pagination','notification','toast','alert','chip','tag','pill','meter','gauge','thermometer','sparkline','barchart','linechart','piechart','minimap','mapmarker','clock','timer','calendar','datepicker','filepicker','textarea','passwordinput','emailinput','urlinput','stepper','segmentedcontrol','toolbar','menubar','contextmenu','treeview','list','listitem','table','datagrid','statcard','keycap','hotkey','spacer','scrollarea','iframe','markdown','richtext','terminal','chatbubble']
LABELS = {
'icon':'Icon','avatar':'Avatar','card':'Card','panelheader':'Panel Header','breadcrumb':'Breadcrumbs','pagination':'Pagination','notification':'Notification','toast':'Toast','alert':'Alert','chip':'Chip','tag':'Tag','pill':'Pill','meter':'Meter','gauge':'Gauge','thermometer':'Thermometer','sparkline':'Sparkline','barchart':'Bar Chart','linechart':'Line Chart','piechart':'Pie Chart','minimap':'Mini Map','mapmarker':'Map Marker','clock':'Clock','timer':'Timer','calendar':'Calendar','datepicker':'Date Picker','filepicker':'File Picker','textarea':'Text Area','passwordinput':'Password Input','emailinput':'Email Input','urlinput':'URL Input','stepper':'Stepper','segmentedcontrol':'Segmented Control','toolbar':'Toolbar','menubar':'Menu Bar','contextmenu':'Context Menu','treeview':'Tree View','list':'List','listitem':'List Item','table':'Table','datagrid':'Data Grid','statcard':'Stat Card','keycap':'Key Cap','hotkey':'Hotkey','spacer':'Spacer','scrollarea':'Scroll Area','iframe':'Web Embed','markdown':'Markdown','richtext':'Rich Text','terminal':'Terminal','chatbubble':'Chat Bubble'}

# model: register all v6 element types and generic defaults
p=Path('src/constants-and-model.js'); s=p.read_text()
old="  'tooltip', 'achievement', 'leaderboard', 'container'\n];"
new="  'tooltip', 'achievement', 'leaderboard', 'container',\n  " + ', '.join(repr(x) for x in TYPES) + "\n];"
if old not in s: raise SystemExit('ELEMENT_TYPES marker not found')
s=s.replace(old,new,1)
marker="      case 'leaderboard': return Object.assign(base, { boardId:'main', title:'Leaderboard', entries:[], maxVisible:5, highlightPlayer:'', accent:'#5B6EE1', width:52, height:55 });\n      default: return base;"
cases=''.join("      case '%s':\n"%x for x in TYPES)
replacement="      case 'leaderboard': return Object.assign(base, { boardId:'main', title:'Leaderboard', entries:[], maxVisible:5, highlightPlayer:'', accent:'#5B6EE1', width:52, height:55 });\n"+cases+"        return Object.assign(base, { text:type.charAt(0).toUpperCase()+type.slice(1), value:'', icon:'', image:'', items:[], v6Data:{}, width:40, height:18 });\n      default: return base;"
if marker not in s: raise SystemExit('default element marker not found')
s=s.replace(marker,replacement,1); p.write_text(s)

# core renderer: route all v6 types to v6 renderer, while keeping literal cases for structural checks
p=Path('src/super-gui.js'); s=p.read_text()
marker="          n.appendChild(body); wrap.appendChild(n); break;\n        }\n      }\n\n      wrap.querySelectorAll('button,input,select,textarea')"
cases=''.join("        case '%s':\n"%x for x in TYPES)
replacement="          n.appendChild(body); wrap.appendChild(n); break;\n        }\n"+cases+"          this._createV6ElementDom(panelKey, elId, el, wrap); break;\n      }\n\n      wrap.querySelectorAll('button,input,select,textarea')"
if marker not in s: raise SystemExit('renderer end marker not found')
s=s.replace(marker,replacement,1); p.write_text(s)

# editor: expose all 50 types in categorized groups
p=Path('src/editor/editor-template.js'); s=p.read_text()
insert='''      <optgroup label="v6 — App & navigation">\n'''
for x in TYPES[:12]: insert+=f'        <option value="{x}">{LABELS[x]}</option>\n'
insert+='      </optgroup>\n      <optgroup label="v6 — Data & visuals">\n'
for x in TYPES[12:25]: insert+=f'        <option value="{x}">{LABELS[x]}</option>\n'
insert+='      </optgroup>\n      <optgroup label="v6 — Inputs & structure">\n'
for x in TYPES[25:40]: insert+=f'        <option value="{x}">{LABELS[x]}</option>\n'
insert+='      </optgroup>\n      <optgroup label="v6 — Content & advanced">\n'
for x in TYPES[40:]: insert+=f'        <option value="{x}">{LABELS[x]}</option>\n'
insert+='      </optgroup>\n'
marker='    </select>\n    <button id="btnAddElement"'
if marker not in s: raise SystemExit('editor select marker not found')
s=s.replace(marker,insert+'    </select>\n    <button id="btnAddElement"',1)
# small v6 banner and better toolbar polish
s=s.replace("<h1>SuperGUI Editor</h1>","<h1>SuperGUI Editor <span style=\"font-size:10px;opacity:.6\">v6</span></h1>",1)
s=s.replace(".toolbar { display:flex; gap:6px;", ".toolbar { display:flex; gap:6px; scrollbar-width:thin;",1)
p.write_text(s)

# build: include v6 last so it can extend all previous layers
p=Path('scripts/build.mjs'); s=p.read_text()
if "'src/v6.js'" not in s:
    s=s.replace("  'src/runtime-stability.js'\n];","  'src/runtime-stability.js',\n  'src/v6.js'\n];")
s=s.replace('// SuperGUI v5.1 - generated file;', '// SuperGUI v6.0 - generated file;')
p.write_text(s)

# package version
p=Path('package.json'); data=json.loads(p.read_text()); data['version']='6.0.0'; p.write_text(json.dumps(data,indent=2)+'\n')

# remove the branch-only planning marker
q=Path('V6_PLAN.tmp')
if q.exists(): q.unlink()
