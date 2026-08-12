from pathlib import Path

p = Path(__file__).resolve().parents[1] / 'src/super-gui.js'
s = p.read_text()

needle = """        case 'canvas': {
          const n = document.createElement('canvas');
          n.style.cssText = 'width:100%;height:100%;background:#fff;';
          wrap.appendChild(n);
          n.width = 300; n.height = 200;
          break;
        }
        case 'tooltip': {"""
replacement = """        case 'canvas': {
          const n = document.createElement('canvas');
          n.style.cssText = 'width:100%;height:100%;background:#fff;';
          wrap.appendChild(n);
          n.width = 300; n.height = 200;
          break;
        }
        case 'container': {
          const n = document.createElement('div');
          n.style.cssText = 'width:100%;height:100%;box-sizing:border-box;position:relative;overflow:' + (el.layoutOverflow || 'auto') + ';background:' + s.background + ';border:' + s.borderWidth + 'px solid ' + s.borderColor + ';border-radius:' + s.borderRadius + 'px;';
          n.dataset.superguiContainer = elId;
          wrap.appendChild(n);
          break;
        }
        case 'tooltip': {"""

if needle not in s:
    raise SystemExit('renderer insertion point not found')
s = s.replace(needle, replacement, 1)
p.write_text(s)
print('Added core container renderer case')
