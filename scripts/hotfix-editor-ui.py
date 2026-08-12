from pathlib import Path

# 1) Make sure the removed editor block can never be resurrected by the v5.1 palette wrapper.
p = Path('src/v5x-overhaul.js')
s = p.read_text()
needle = "  info.blocks = v5xBlocks.concat(info.blocks || []);\n"
replacement = "  info.blocks = v5xBlocks.concat(info.blocks || []).filter(block => block.opcode !== 'openEditor');\n"
if needle not in s:
    raise SystemExit('v5x block concat marker missing')
s = s.replace(needle, replacement, 1)
p.write_text(s)

# 2) Belt-and-suspenders: remove the legacy block declaration from the core if it ever sneaks back in.
p = Path('src/super-gui.js')
s = p.read_text()
s = s.replace("          { opcode: 'openEditor', blockType: B.COMMAND, text: 'open SuperGUI editor' },\n\n", "")
p.write_text(s)

# 3) Theme ALL editor dropdowns, especially Align / Distribute / Snap toolbar controls.
p = Path('src/editor/editor-template.js')
s = p.read_text()
css_marker = "button.chrome { width:26px; height:26px; padding:0; font-size:14px; }\n"
css = """button.chrome { width:26px; height:26px; padding:0; font-size:14px; }\nselect { background:var(--panel2); color:var(--text); border:1px solid var(--border); padding:6px 10px; border-radius:7px; cursor:pointer; font-size:12px; color-scheme:dark; }\nselect:hover { border-color:var(--accent); background:#34394d; }\nselect option, select optgroup { background:var(--panel2); color:var(--text); }\n.toolbar select { min-height:30px; }\n"""
if css_marker not in s:
    raise SystemExit('editor chrome CSS marker missing')
s = s.replace(css_marker, css, 1)
p.write_text(s)

# 4) Patch version.
p = Path('package.json')
s = p.read_text().replace('"version": "5.1.0"', '"version": "5.1.1"')
p.write_text(s)

# 5) Clean up temporary files accidentally created during hotfix setup.
for name in ['.hotfix-trigger', 'HOTFIX_NOTES.tmp', 'HOTFIX_NOTES2.tmp', 'HOTFIX_NOTES3.tmp']:
    q = Path(name)
    if q.exists():
        q.unlink()
