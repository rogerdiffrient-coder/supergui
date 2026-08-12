// Shared constants, defaults, persistence, and small utilities.
export const EXT_ID = 'supergui';
export const STORAGE_KEY = 'supergui_config_v1';
export const SLOT_PREFIX = 'supergui_slot_';
export const LEGACY_STORAGE_KEY = 'panelgui_config_v1';
export const LEGACY_SLOT_PREFIX = 'panelgui_slot_';

export const ELEMENT_TYPES = [
  'label', 'button', 'slider', 'checkbox', 'dropdown', 'textinput',
  'numberinput', 'image', 'background', 'progressbar', 'switch', 'radio',
  'colorpicker', 'selector', 'search', 'imagebutton', 'counter', 'badge',
  'spinner', 'divider', 'video', 'rating', 'healthbar', 'joystick', 'dpad',
  'tabs', 'accordion', 'knob', 'carousel', 'code', 'particles', 'canvas',
  'tooltip', 'achievement', 'leaderboard', 'container',
  'icon', 'avatar', 'card', 'panelheader', 'breadcrumb', 'pagination', 'notification', 'toast', 'alert', 'chip', 'tag', 'pill', 'meter', 'gauge', 'thermometer', 'sparkline', 'barchart', 'linechart', 'piechart', 'minimap', 'mapmarker', 'clock', 'timer', 'calendar', 'datepicker', 'filepicker', 'textarea', 'passwordinput', 'emailinput', 'urlinput', 'stepper', 'segmentedcontrol', 'toolbar', 'menubar', 'contextmenu', 'treeview', 'list', 'listitem', 'table', 'datagrid', 'statcard', 'keycap', 'hotkey', 'spacer', 'scrollarea', 'iframe', 'markdown', 'richtext', 'terminal', 'chatbubble'
];

export const EASINGS = {
    linear:        t => t,
    easeIn:        t => t * t,
    easeOut:       t => t * (2 - t),
    easeInOut:     t => t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t,
    easeInCubic:   t => t*t*t,
    easeOutCubic:  t => { t--; return t*t*t + 1; },
    easeInOutCubic:t => t < 0.5 ? 4*t*t*t : (t=t*2-2, t*t*t + 1) / 2 + 0.5,
    easeInBack:    t => { const c1=1.70158, c3=c1+1; return c3*t*t*t - c1*t*t; },
    easeOutBack:   t => { const c1=1.70158, c3=c1+1; t--; return 1 + c3*t*t*t + c1*t*t; },
    easeOutBounce: t => { const n=7.5625, d=2.75; if(t<1/d) return n*t*t; if(t<2/d) return n*(t-=1.5/d)*t+.75; if(t<2.5/d) return n*(t-=2.25/d)*t+.9375; return n*(t-=2.625/d)*t+.984375; },
    easeOutElastic:t => { const c=(2*Math.PI)/3; return t===0||t===1?t : Math.pow(2,-10*t)*Math.sin((t*10-.75)*c)+1; }
  };

export const uid = () => 'p_' + Math.random().toString(36).slice(2, 10);

export function defaultConfig() { return { panelOrder: [], panels: {}, nextZ: 1 }; }
export function defaultPanelStyle() { return { background:'#232735', borderColor:'#4a4f5e', borderWidth:2, borderRadius:10, padding:10, opacity:1 }; }
export function defaultElementStyle() { return { color:'#ffffff', background:'#3a3f52', borderColor:'#5B6EE1', borderWidth:1, borderRadius:6, padding:4, fontSize:14, fontWeight:'normal', textAlign:'left', opacity:1 }; }
export function defaultPanel() {
    return { name:'Panel', x:20, y:20, width:50, height:50, visible:true, minimized:false, draggable:false, titleBar:false, backgroundImage:'', zIndex:1, modal:false, style:defaultPanelStyle(), elementOrder:[], elements:{} };
  }

export function defaultElement(type) {
    const base = { type, x:10, y:10, width:40, height:10, rotation:0, zIndex:1, locked:false, runtimeDraggable:false, hidden:false, disabled:false, style:defaultElementStyle() };
    switch (type) {
      case 'label': return Object.assign(base, { text:'Label' });
      case 'button': return Object.assign(base, { text:'Button' });
      case 'slider': return Object.assign(base, { min:0, max:100, step:1, value:50 });
      case 'checkbox': return Object.assign(base, { text:'Checkbox', checked:false, height:8 });
      case 'dropdown': return Object.assign(base, { options:['A','B'], selected:'A' });
      case 'textinput': return Object.assign(base, { placeholder:'', value:'' });
      case 'numberinput': return Object.assign(base, { min:0, max:100, step:1, value:0 });
      case 'image': return Object.assign(base, { src:'', flipH:false, flipV:false, tint:'#ffffff' });
      case 'background': return Object.assign(base, { src:'', parallax:0, blur:0, sizeMode:'cover', color:'#10131c', x:0, y:0, width:100, height:100 });
      case 'progressbar': return Object.assign(base, { value:50, min:0, max:100, indeterminate:false, barColor:'#5B6EE1', trackColor:'#3a3f52' });
      case 'switch': return Object.assign(base, { on:false, onColor:'#5B6EE1', offColor:'#5a5f72' });
      case 'radio': return Object.assign(base, { options:['A','B','C'], selected:'A', orientation:'vertical' });
      case 'colorpicker': return Object.assign(base, { value:'#5B6EE1' });
      case 'selector': return Object.assign(base, { rows:3, cols:5, cellGap:4, cells:[], selectedIndex:0, width:50, height:50 });
      case 'search': return Object.assign(base, { placeholder:'Search...', value:'', results:[], width:50, height:10 });
      case 'imagebutton': return Object.assign(base, { image:'', hoverImage:'', pressedImage:'', scaleOnPress:0.95, width:30, height:30 });
      case 'counter': return Object.assign(base, { value:0, prefix:'', suffix:'', decimals:0, format:'normal' });
      case 'badge': return Object.assign(base, { count:0, max:99, color:'#e15b6e', visible:true, width:8, height:8 });
      case 'spinner': return Object.assign(base, { size:24, color:'#5B6EE1', speed:1, visible:true, width:12, height:12 });
      case 'divider': return Object.assign(base, { orientation:'horizontal', thickness:1, color:'#5a5f72', width:50, height:1 });
      case 'video': return Object.assign(base, { src:'', autoplay:false, loop:false, muted:true, controls:false, volume:1, width:50, height:35 });
      case 'rating': return Object.assign(base, { value:0, max:5, icon:'★', color:'#ffd166', width:25, height:8 });
      case 'healthbar': return Object.assign(base, { segments:10, filled:10, orientation:'horizontal', fgColor:'#5B6EE1', bgColor:'#3a3f52', emptyColor:'#1f2230', leftArt:'', midArt:'', rightArt:'', artMode:'image', width:50, height:10 });
      case 'joystick': return Object.assign(base, { knobX:0, knobY:0, radius:35, knobColor:'#5B6EE1', baseColor:'#3a3f52', deadzone:0.1, width:30, height:30 });
      case 'dpad': return Object.assign(base, { direction:'none', size:30, color:'#5B6EE1', width:30, height:30 });
      case 'tabs': return Object.assign(base, { tabs:['Tab 1','Tab 2','Tab 3'], activeTab:0, width:60, height:25 });
      case 'accordion': return Object.assign(base, { items:[{title:'Section 1',content:'Content 1',open:false}], multiOpen:false, width:50, height:35 });
      case 'knob': return Object.assign(base, { value:0, min:0, max:100, step:1, color:'#5B6EE1', width:18, height:18 });
      case 'carousel': return Object.assign(base, { slides:[{image:'',text:'Slide 1'}], current:0, autoPlay:false, interval:3000, width:60, height:40 });
      case 'code': return Object.assign(base, { code:'// code', theme:'dark', width:50, height:30 });
      case 'particles': return Object.assign(base, { color:'#ffffff', count:20, speed:2, lifetime:1, gravity:0, size:3, width:40, height:40 });
      case 'canvas': return Object.assign(base, { width:50, height:30 });
      case 'container': return Object.assign(base, { layoutMode:'vertical', layoutGap:8, layoutPadding:8, layoutOverflow:'auto', layoutAlign:'stretch', layoutJustify:'start', layoutWrap:false, layoutColumns:2, children:[], width:60, height:55 });
      case 'tooltip': return Object.assign(base, { text:'Tooltip', position:'top', delay:500, background:'#232735', textColor:'#ffffff', width:18, height:6 });
      case 'achievement': return Object.assign(base, { achievementId:'', title:'Achievement unlocked!', description:'A new milestone reached', icon:'🏆', points:10, progress:1, target:1, unlocked:true, accent:'#ffd166', width:58, height:18 });
      case 'leaderboard': return Object.assign(base, { boardId:'main', title:'Leaderboard', entries:[], maxVisible:5, highlightPlayer:'', accent:'#5B6EE1', width:52, height:55 });
      case 'icon':
      case 'avatar':
      case 'card':
      case 'panelheader':
      case 'breadcrumb':
      case 'pagination':
      case 'notification':
      case 'toast':
      case 'alert':
      case 'chip':
      case 'tag':
      case 'pill':
      case 'meter':
      case 'gauge':
      case 'thermometer':
      case 'sparkline':
      case 'barchart':
      case 'linechart':
      case 'piechart':
      case 'minimap':
      case 'mapmarker':
      case 'clock':
      case 'timer':
      case 'calendar':
      case 'datepicker':
      case 'filepicker':
      case 'textarea':
      case 'passwordinput':
      case 'emailinput':
      case 'urlinput':
      case 'stepper':
      case 'segmentedcontrol':
      case 'toolbar':
      case 'menubar':
      case 'contextmenu':
      case 'treeview':
      case 'list':
      case 'listitem':
      case 'table':
      case 'datagrid':
      case 'statcard':
      case 'keycap':
      case 'hotkey':
      case 'spacer':
      case 'scrollarea':
      case 'iframe':
      case 'markdown':
      case 'richtext':
      case 'terminal':
      case 'chatbubble':
        return Object.assign(base, { text:type.charAt(0).toUpperCase()+type.slice(1), value:'', icon:'', image:'', items:[], v6Data:{}, width:40, height:18 });
      default: return base;
    }
  }

const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function normalizeConfig(value) {
  if (!isRecord(value) || !isRecord(value.panels) || !Array.isArray(value.panelOrder)) {
    return defaultConfig();
  }

  const normalized = defaultConfig();
  normalized.nextZ = Number.isFinite(Number(value.nextZ)) ? Math.max(1, Number(value.nextZ)) : 1;
  const usedNames = new Set();
  const usedElementIds = new Set();

  for (const keyValue of value.panelOrder) {
    const key = String(keyValue);
    const source = value.panels[key];
    if (!isRecord(source) || normalized.panels[key]) continue;

    const panel = Object.assign(defaultPanel(), source);
    panel.style = Object.assign(defaultPanelStyle(), isRecord(source.style) ? source.style : {});
    panel.elements = {};
    panel.elementOrder = [];

    const baseName = String(source.name || 'Panel');
    let name = baseName;
    let suffix = 2;
    while (usedNames.has(name)) name = `${baseName} ${suffix++}`;
    panel.name = name;
    usedNames.add(name);

    const sourceElements = isRecord(source.elements) ? source.elements : {};
    const sourceOrder = Array.isArray(source.elementOrder) ? source.elementOrder : [];
    const orderedIds = [...sourceOrder.map(String), ...Object.keys(sourceElements)];
    const seenInPanel = new Set();
    for (const sourceId of orderedIds) {
      if (seenInPanel.has(sourceId) || !isRecord(sourceElements[sourceId])) continue;
      seenInPanel.add(sourceId);
      const sourceElement = sourceElements[sourceId];
      const type = ELEMENT_TYPES.includes(sourceElement.type) ? sourceElement.type : 'label';
      const element = Object.assign(defaultElement(type), sourceElement, { type });
      element.style = Object.assign(defaultElementStyle(), isRecord(sourceElement.style) ? sourceElement.style : {});

      let id = sourceId || 'Element';
      let idSuffix = 2;
      while (usedElementIds.has(id)) id = `${sourceId || 'Element'}${idSuffix++}`;
      usedElementIds.add(id);
      panel.elements[id] = element;
      panel.elementOrder.push(id);
    }

    normalized.panels[key] = panel;
    normalized.panelOrder.push(key);
  }
  return normalized;
}

export function loadConfigFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!raw) return defaultConfig();
      return normalizeConfig(JSON.parse(raw));
    } catch (e) { return defaultConfig(); }
  }
export function saveConfigToStorage(config, key) {
    try { localStorage.setItem(key || STORAGE_KEY, JSON.stringify(config)); } catch (e) {}
  }
export function lerpColor(c1, c2, t) {
    if (!c1 || !c2) return c2 || c1 || '#000000';
    const p = s => /^#[0-9a-f]{6}$/i.test(s) ? [parseInt(s.slice(1,3),16), parseInt(s.slice(3,5),16), parseInt(s.slice(5,7),16)] : null;
    const a = p(c1);
    const b = p(c2);
    if (!a) return c2;
    if (!b) return c1;
    t = Math.max(0, Math.min(1, Number(t) || 0));
    const r = Math.round(a[0] + (b[0]-a[0]) * t);
    const g = Math.round(a[1] + (b[1]-a[1]) * t);
    const bl = Math.round(a[2] + (b[2]-a[2]) * t);
    return '#' + [r,g,bl].map(x => x.toString(16).padStart(2,'0')).join('');
  }
export const THEMES = {
    dark:  { background:'#1b1e29', panel:'#232735', accent:'#5B6EE1', text:'#e7e9f2', border:'#3a3f52' },
    light: { background:'#f4f5fa', panel:'#ffffff', accent:'#5B6EE1', text:'#1b1e29', border:'#d0d3e0' },
    neon:  { background:'#0a0014', panel:'#1a0033', accent:'#ff00d4', text:'#ffffff', border:'#ff00d4' },
    gd:    { background:'#0d1018', panel:'#1a1f2e', accent:'#5dd6ff', text:'#ffffff', border:'#3a4a6b' }
  };
