// SuperGUI 6.1.0: final block-palette router.
// Rebuilds the palette from the complete block list so late-added blocks cannot bypass categories.

const SG607_CATEGORIES = [
  'basic','panels','layout','appearance','leaderboard',
  'icon','avatar','card','panel header','breadcrumbs','pagination',
  'notifications','badges','meter','gauge','thermometer','sparkline','bar chart','line chart','pie chart','mini map','map marker',
  'clock','timer','calendar','date picker','file picker','text area','password input','email input','url input','stepper',
  'segmented control','toolbar','menu bar','context menu','tree view','list','table / data grid','stat card','keys / hotkeys',
  'scroll area','web embed','markdown / rich text','terminal','chat','chat bubble','advanced v6','data / services','all'
];

const SG607_CATEGORY_OPCODES = {
  leaderboard: new Set(['setLeaderboardMode','clearCustomLeaderboard','addCustomLeaderboardRow','setCustomLeaderboardRows','getCustomLeaderboardRows','setLeaderboardTitle','setLeaderboardMaxRows','setLeaderboardRowHeight']),
  icon: new Set(['sg606Icon']),
  avatar: new Set(['sg606Avatar']),
  card: new Set(['sg606Card']),
  'panel header': new Set(['sg606PanelHeader']),
  breadcrumbs: new Set(['sg606Breadcrumb']),
  pagination: new Set(['sg606Pagination']),
  notifications: new Set(['sg606Notification','sg606Toast','sg606Alert']),
  badges: new Set(['sg606Chip','sg606Tag','sg606Pill']),
  meter: new Set(['sg606Meter']),
  gauge: new Set(['sg606Gauge']),
  thermometer: new Set(['sg606Thermometer']),
  sparkline: new Set(['sg606Sparkline']),
  'bar chart': new Set(['sg606BarChart']),
  'line chart': new Set(['sg606LineChart']),
  'pie chart': new Set(['sg606PieChart']),
  'mini map': new Set(['sg606MiniMap']),
  'map marker': new Set(['sg606MapMarker']),
  clock: new Set(['sg606Clock']),
  timer: new Set(['sg606Timer','setV6TimerSeconds','getV6TimerSeconds']),
  calendar: new Set(['sg606Calendar']),
  'date picker': new Set(['sg606DatePicker','setV6Date']),
  'file picker': new Set(['sg606FilePicker','whenV6FileSelected','getV6SelectedFileName']),
  'text area': new Set(['sg606TextArea']),
  'password input': new Set(['sg606Password']),
  'email input': new Set(['sg606Email']),
  'url input': new Set(['sg606URLInput']),
  stepper: new Set(['sg606Stepper']),
  'segmented control': new Set(['sg606Segmented']),
  toolbar: new Set(['sg606Toolbar']),
  'menu bar': new Set(['sg606MenuBar']),
  'context menu': new Set(['sg606ContextMenu','sg606HideContextMenu']),
  'tree view': new Set(['sg606Tree']),
  list: new Set(['sg606List','sg606ListItem']),
  'table / data grid': new Set(['sg606Table','sg606DataGrid','sg606SortGrid']),
  'stat card': new Set(['sg606StatCard']),
  'keys / hotkeys': new Set(['sg606KeyCap','sg606Hotkey']),
  'scroll area': new Set(['sg606ScrollArea','sg606ScrollX','sg606ScrollY','scrollContainerToBottom']),
  'web embed': new Set(['sg606WebEmbed','sg606ReloadEmbed']),
  'markdown / rich text': new Set(['sg606Markdown','sg606RichText']),
  terminal: new Set([
    'appendTerminalLineV6','clearTerminalV6','sg606Terminal','sg606TerminalError',
    'whenTerminalCommandV6','getLastTerminalCommandV6','setTerminalPromptV6','setTerminalInputEnabledV6','setTerminalEchoV6','focusTerminalV6','getTerminalHistoryV6',
    'clearTerminalHistoryV605','getTerminalPromptV605','terminalInputEnabledV605','terminalEchoEnabledV605'
  ]),
  chat: new Set([
    'whenChatMessageReceived','chatMessage','sendChatMessage','chatSenderName','chatSenderPFP','chatMessageSide','chatHistoryJSON','clearChatHistory'
  ]),
  'chat bubble': new Set(['sg606ChatBubble','setChatBubbleSideV6']),
  'advanced v6': new Set([
    'setV6ItemData','getV6ItemData','setV6ItemText','setV6ItemIcon','setV6ItemItems','getV6ItemItems','addV6Item','removeV6ItemAt','clearV6Items','getV6ItemAt','getV6ItemCount',
    'setV6Value','getV6Value','setV6Range','setV6SelectedIndex','getV6SelectedIndex','getV6SelectedItem','setV6Progress','setV6Placeholder','setV6URL','getV6URL','setV6Image','appendV6Text','clearV6Content','setV6Rows','getV6Rows','setV6Columns','setV6ChartValues','setV6Property','getV6Property',
    'whenV6ItemActivated','getV6ActivatedItem','getV6TypeV605','isV6ItemV605','getV6TemplateNamesV605','clearSuperGUIClipboardV605','createFromTemplate','templateAsJSON','copyElementV6','pasteElementV6','copyPanelV6','pastePanelV6','clipboardTypeV6'
  ])
};

function sg607ExplicitCategory(opcode) {
  for (const [category, opcodes] of Object.entries(SG607_CATEGORY_OPCODES)) {
    if (opcodes.has(opcode)) return category;
  }
  return '';
}

function sg607SectionCategory(label) {
  const s = String(label || '').toLowerCase();
  if (/panel/.test(s)) return 'panels';
  if (/appearance|custom art|theme|styling/.test(s)) return 'appearance';
  if (/layout|container|animation|drag zone|drag/.test(s)) return 'layout';
  if (/leaderboard/.test(s)) return 'leaderboard';
  if (/game services|storage|cloud|achievement|data/.test(s)) return 'data / services';
  if (/terminal/.test(s)) return 'terminal';
  if (/chat/.test(s)) return 'chat';
  if (/v6/.test(s)) return 'advanced v6';
  return 'basic';
}

const _sg607GetInfo = SuperGUI.prototype.getInfo;
SuperGUI.prototype.getInfo = function () {
  // Force earlier palette filters to hand us the complete list. This final router owns filtering now.
  const requested = String(this._paletteCategory || 'basic').toLowerCase();
  const previous = this._paletteCategory;
  this._paletteCategory = 'all';
  const info = _sg607GetInfo.call(this);
  this._paletteCategory = previous === undefined ? requested : previous;

  const B = Scratch.BlockType;
  info.menus = info.menus || {};
  info.menus.paletteModes = {acceptReporters:false,items:SG607_CATEGORIES};

  const selector = (info.blocks || []).find(b => b && b.opcode === 'setBlockPaletteMode');
  const buckets = Object.fromEntries(SG607_CATEGORIES.filter(c => c !== 'all').map(c => [c, []]));
  let section = 'basic';

  for (const block of info.blocks || []) {
    if (!block) continue;
    if (block.opcode === 'setBlockPaletteMode') continue;
    if (block.blockType === B.LABEL) {
      section = sg607SectionCategory(block.text);
      continue;
    }
    const category = sg607ExplicitCategory(block.opcode) || section || 'basic';
    (buckets[category] || buckets.basic).push(block);
  }

  const makeLabel = category => ({blockType:B.LABEL,text:'─── ' + category.replace(/\b\w/g,c=>c.toUpperCase()) + ' ───'});
  if (requested === 'all') {
    const rebuilt = [];
    if (selector) rebuilt.push(selector);
    for (const category of SG607_CATEGORIES) {
      if (category === 'all' || !buckets[category] || !buckets[category].length) continue;
      rebuilt.push(makeLabel(category), ...buckets[category]);
    }
    info.blocks = rebuilt;
  } else {
    const category = buckets[requested] ? requested : 'basic';
    info.blocks = [];
    if (selector) info.blocks.push(selector);
    if (buckets[category].length) info.blocks.push(makeLabel(category), ...buckets[category]);
  }
  return info;
};
