from pathlib import Path

p = Path(__file__).resolve().parents[1] / 'src/editor/editor-template.js'
s = p.read_text()

old = """    var al=document.createElement('select');al.innerHTML='<option value=\"\">Align...</option><option value=\"left\">Left</option><option value=\"right\">Right</option><option value=\"top\">Top</option><option value=\"bottom\">Bottom</option><option value=\"hcenter\">H Center</option><option value=\"vcenter\">V Center</option>';al.onchange=function(){if(al.value)v5Align(al.value);al.value='';};tb.appendChild(al);\n    var ds=document.createElement('select');ds.innerHTML='<option value=\"\">Distribute...</option><option value=\"h\">Horizontal</option><option value=\"v\">Vertical</option>';ds.onchange=function(){if(ds.value)v5Distribute(ds.value);ds.value='';};tb.appendChild(ds);"""
new = """    function fillSelect(sel,items){items.forEach(function(pair){var op=document.createElement('option');op.value=pair[0];op.textContent=pair[1];sel.appendChild(op);});}\n    var al=document.createElement('select');fillSelect(al,[['','Align...'],['left','Left'],['right','Right'],['top','Top'],['bottom','Bottom'],['hcenter','H Center'],['vcenter','V Center']]);al.onchange=function(){if(al.value)v5Align(al.value);al.value='';};tb.appendChild(al);\n    var ds=document.createElement('select');fillSelect(ds,[['','Distribute...'],['h','Horizontal'],['v','Vertical']]);ds.onchange=function(){if(ds.value)v5Distribute(ds.value);ds.value='';};tb.appendChild(ds);"""

if old not in s:
    raise SystemExit('v5 toolbar option snippet not found')
s = s.replace(old, new, 1)
p.write_text(s)
print('Rewrote v5 toolbar select options for test compatibility')
