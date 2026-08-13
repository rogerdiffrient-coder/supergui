// SuperGUI 6.1.2: grouped toolbox categories.
// One engine, one JS file, at most five visible extension categories total.

const SG612_GROUPS = [
  {
    id: 'ui',
    name: 'UI',
    categories: [
      'panels','layout','appearance','icon','avatar','card','panel header','breadcrumbs','pagination',
      'notifications','badges','meter','gauge','thermometer','clock','timer','calendar','date picker',
      'stepper','segmented control','toolbar','menu bar','context menu','tree view','list','stat card','keys / hotkeys'
    ]
  },
  {
    id: 'inputschat',
    name: 'Inputs & Chat',
    categories: [
      'file picker','text area','password input','email input','url input','chat bubble','terminal'
    ]
  },
  {
    id: 'datamedia',
    name: 'Data & Media',
    categories: [
      'leaderboard','sparkline','bar chart','line chart','pie chart','mini map','map marker','table / data grid',
      'scroll area','web embed','markdown / rich text','data / services'
    ]
  },
  {
    id: 'advanced',
    name: 'Advanced',
    categories: ['advanced v6']
  }
];

function sg612GroupCategoryForBlock(block, section) {
  if (!block) return section || 'basic';
  if (block.opcode && typeof sg607ExplicitCategory === 'function') {
    const explicit = sg607ExplicitCategory(block.opcode);
    if (explicit) return explicit;
  }
  return section || 'basic';
}

function sg612PrettyCategory(category) {
  return String(category || '').replace(/\b\w/g, c => c.toUpperCase());
}

function sg612GetGroupInfo(core, group) {
  const old = core._paletteCategory;
  core._paletteCategory = 'all';
  let info;
  try {
    info = core.getInfo();
  } finally {
    core._paletteCategory = old;
  }

  const B = Scratch.BlockType;
  const allowed = new Set(group.categories);
  const blocks = [];
  let section = 'basic';
  let lastEmittedCategory = '';

  for (const block of info.blocks || []) {
    if (!block || block.opcode === 'setBlockPaletteMode') continue;
    if (block.blockType === B.LABEL) {
      section = typeof sg607SectionCategory === 'function' ? sg607SectionCategory(block.text) : 'basic';
      continue;
    }
    const category = sg612GroupCategoryForBlock(block, section);
    if (!allowed.has(category)) continue;
    if (category !== lastEmittedCategory) {
      blocks.push({blockType:B.LABEL,text:'─── '+sg612PrettyCategory(category)+' ───'});
      lastEmittedCategory = category;
    }
    blocks.push(block);
  }

  return {...info, id:'supergui'+group.id, name:'SuperGUI • '+group.name, blocks};
}

class SuperGUIGroupedProxy {
  constructor(core, group) { this.core = core; this.group = group; }
  getInfo() { return sg612GetGroupInfo(this.core, this.group); }
}

function sg612ProxyFor(core, group) {
  const target = new SuperGUIGroupedProxy(core, group);
  return new Proxy(target, {
    get(obj, prop, receiver) {
      if (Reflect.has(obj, prop)) return Reflect.get(obj, prop, receiver);
      const value = core[prop];
      return typeof value === 'function' ? value.bind(core) : value;
    },
    has(obj, prop) { return Reflect.has(obj, prop) || prop in core; }
  });
}
