from pathlib import Path

# Patch SuperGUI runtime
p = Path('src/super-gui.js')
s = p.read_text()
s = s.replace("      window.__superGUIInstance = this;\n      this._startRAF();", "      window.__superGUIInstance = this;\n      this._ensureEmbeddedEditor();\n      this._restoreEmbeddedEditor();\n      this._startRAF();")
s = s.replace("          { opcode: 'openEditor', blockType: B.COMMAND, text: 'open SuperGUI editor' },\n\n", "")
p.write_text(s)

# Patch editor chrome text and stale helper copy
p = Path('src/editor/editor-template.js')
s = p.read_text()
s = s.replace('<button id="btnMin" class="chrome" title="Minimize">_</button>', '<button id="btnMin" class="chrome" title="Minimize">-</button>')
s = s.replace('Open the editor from the "open SuperGUI editor" block.', 'SuperGUI editor could not connect to the extension.')
p.write_text(s)
