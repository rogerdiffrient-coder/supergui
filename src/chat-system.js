// SuperGUI 6.1.0: built-in chat message bus with costume-aware PFPs.
// Designed to use native COSTUME fields when available and a dynamic menu fallback otherwise.

const _sg610ChatGetInfo = SuperGUI.prototype.getInfo;
SuperGUI.prototype.getInfo = function () {
  const info = _sg610ChatGetInfo.call(this);
  const B = Scratch.BlockType;
  const S = Scratch.ArgumentType;
  info.menus = info.menus || {};
  info.menus.sgChatSide = {acceptReporters:false,items:['left','right']};
  info.menus.sgChatCostumes = {acceptReporters:true,items:'getChatCostumeMenu'};

  const costumeType = S && S.COSTUME;
  const pfpArg = costumeType
    ? {type:costumeType}
    : {type:S.STRING,menu:'sgChatCostumes',defaultValue:''};

  const blocks = [
    {blockType:B.LABEL,text:'─── Chat ───'},
    {opcode:'whenChatMessageReceived',blockType:B.HAT,text:'when chat message received'},
    {opcode:'chatMessage',blockType:B.REPORTER,text:'chat message'},
    {opcode:'sendChatMessage',blockType:B.COMMAND,text:'send chat message [MESSAGE] name [NAME] PFP [PFP] side [SIDE]',arguments:{
      MESSAGE:{type:S.STRING,defaultValue:'Hello!'},
      NAME:{type:S.STRING,defaultValue:'Happity'},
      PFP:pfpArg,
      SIDE:{type:S.STRING,menu:'sgChatSide',defaultValue:'left'}
    }},
    {opcode:'chatSenderName',blockType:B.REPORTER,text:'chat sender name'},
    {opcode:'chatSenderPFP',blockType:B.REPORTER,text:'chat sender PFP'},
    {opcode:'chatMessageSide',blockType:B.REPORTER,text:'chat message side'},
    {opcode:'chatHistoryJSON',blockType:B.REPORTER,text:'chat history JSON'},
    {opcode:'clearChatHistory',blockType:B.COMMAND,text:'clear chat history'}
  ];
  info.blocks = blocks.concat(info.blocks || []);
  return info;
};

function sg610ChatTarget(ext, util) {
  if (util && util.target) return util.target;
  const vm = Scratch.vm || globalThis.vm;
  if (vm && vm.editingTarget) return vm.editingTarget;
  const runtime = ext && ext.runtime;
  return runtime && typeof runtime.getEditingTarget === 'function' ? runtime.getEditingTarget() : null;
}

function sg610ChatCostumes(target) {
  if (!target) return [];
  if (typeof target.getCostumes === 'function') {
    try { const c = target.getCostumes(); if (Array.isArray(c)) return c; } catch (e) {}
  }
  if (target.sprite && Array.isArray(target.sprite.costumes)) return target.sprite.costumes;
  return [];
}

function sg610CostumeDataURI(costume) {
  if (!costume) return '';
  try {
    if (costume.asset && typeof costume.asset.encodeDataURI === 'function') return costume.asset.encodeDataURI();
    if (typeof costume.dataURI === 'string') return costume.dataURI;
    if (typeof costume.url === 'string') return costume.url;
  } catch (e) {}
  return '';
}

SuperGUI.prototype.getChatCostumeMenu = function () {
  const target = sg610ChatTarget(this);
  const names = sg610ChatCostumes(target).map(c => String(c && c.name || '')).filter(Boolean);
  return names.length ? names : [''];
};

SuperGUI.prototype._resolveChatCostume = function (name, util) {
  const target = sg610ChatTarget(this, util);
  const costumeName = String(name || '');
  const costumes = sg610ChatCostumes(target);
  const costume = costumes.find(c => String(c && c.name || '') === costumeName) || null;
  return {name:costumeName,src:sg610CostumeDataURI(costume)};
};

SuperGUI.prototype.whenChatMessageReceived = function () { return false; };

SuperGUI.prototype.sendChatMessage = function (args, util) {
  this._chatHistory = Array.isArray(this._chatHistory) ? this._chatHistory : [];
  const pfp = this._resolveChatCostume(args.PFP, util);
  const message = {
    message:String(args.MESSAGE ?? ''),
    name:String(args.NAME ?? ''),
    pfp:pfp.name,
    pfpSrc:pfp.src,
    side:String(args.SIDE || 'left') === 'right' ? 'right' : 'left',
    timestamp:Date.now()
  };
  this._lastChatMessage = message;
  this._chatHistory.push(message);
  if (this._chatHistory.length > 500) this._chatHistory.splice(0, this._chatHistory.length - 500);
  try { this.runtime.startHats(EXT_ID + '_whenChatMessageReceived'); } catch (e) {}
};

SuperGUI.prototype.chatMessage = function () { return String(this._lastChatMessage && this._lastChatMessage.message || ''); };
SuperGUI.prototype.chatSenderName = function () { return String(this._lastChatMessage && this._lastChatMessage.name || ''); };
SuperGUI.prototype.chatSenderPFP = function () { return String(this._lastChatMessage && this._lastChatMessage.pfp || ''); };
SuperGUI.prototype.chatMessageSide = function () { return String(this._lastChatMessage && this._lastChatMessage.side || 'left'); };
SuperGUI.prototype.chatHistoryJSON = function () { return JSON.stringify(Array.isArray(this._chatHistory) ? this._chatHistory : []); };
SuperGUI.prototype.clearChatHistory = function () { this._chatHistory = []; this._lastChatMessage = null; };
