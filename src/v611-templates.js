// SuperGUI 6.1.1: expanded UI template pack.
// Templates are UI only. They never load or depend on AI/network extensions.

const SG611_TEMPLATE_NAMES = [
  'Chatbot','Icon Selector','Login Screen','Sign-Up Form','Profile Card','Notification Center',
  'File Manager','Music Player','Video Player','Calculator','Notes App','Paint App',
  'App Launcher','Taskbar','Start Menu','Friends List','Comment Section','Pause Menu',
  'Shop','Quest Log','Achievement Popup','Level Select','Coding Assistant','Help Desk'
];
for (const name of SG611_TEMPLATE_NAMES) if (!V6_TEMPLATE_NAMES.includes(name)) V6_TEMPLATE_NAMES.push(name);

function sg611Template(name) {
  const p = v6BasePanel(name);
  const add = (id, e) => { p.elements[id] = e; p.elementOrder.push(id); return id; };
  const header = title => { add('Header', v6El('panelheader',0,0,100,10,title)); p.dragZones=['Header']; };

  const factories = {
    'Chatbot': () => {
      p.width=68; p.height=76; header('Assistant');
      add('Avatar',v6El('avatar',3,13,10,10,'AI'));
      add('Name',v6El('label',15,13,45,8,'Assistant'));
      add('Status',v6El('label',15,21,45,5,'Online'));
      add('Messages',v6El('scrollarea',3,29,94,51,''));
      add('BotMessage',v6El('chatbubble',4,32,63,14,'Hello! How can I help?'));
      add('UserMessage',v6El('chatbubble',33,50,63,14,'Hi!'));
      p.elements.BotMessage.side='left'; p.elements.UserMessage.side='right';
      add('Typing',v6El('label',4,81,45,5,''));
      add('MessageInput',v6El('textarea',3,87,78,10,'')); p.elements.MessageInput.placeholder='Type a message...';
      add('Send',v6El('button',83,87,14,10,'Send'));
      return p;
    },
    'Icon Selector': () => {
      p.width=64; p.height=72; header('Choose an Icon');
      add('Search',v6El('textinput',3,13,94,9,'')); p.elements.Search.placeholder='Search icons...';
      add('IconGrid',v6El('datagrid',3,24,94,58,''));
      p.elements.IconGrid.columns=['Icon','Name'];
      p.elements.IconGrid.rows=[['★','Star'],['♥','Heart'],['●','Circle'],['■','Square'],['▲','Triangle'],['✓','Check']];
      add('SelectedPreview',v6El('icon',4,85,12,11,'★'));
      add('SelectedName',v6El('label',19,87,48,7,'Star'));
      add('Choose',v6El('button',73,85,24,11,'Choose'));
      return p;
    },
    'Login Screen': () => {
      p.width=48; p.height=58; p.x=26; p.y=20; header('Sign In');
      add('UserLabel',v6El('label',8,20,84,7,'Username'));
      add('Username',v6El('textinput',8,28,84,11,'')); p.elements.Username.placeholder='Username';
      add('PassLabel',v6El('label',8,43,84,7,'Password'));
      add('Password',v6El('passwordinput',8,51,84,11,''));
      add('Remember',v6El('checkbox',8,66,50,8,'Remember me'));
      add('Login',v6El('button',8,79,84,12,'Sign In'));
      return p;
    },
    'Sign-Up Form': () => {
      p.width=52; p.height=72; p.x=24; p.y=14; header('Create Account');
      add('Name',v6El('textinput',7,17,86,10,'')); p.elements.Name.placeholder='Display name';
      add('Email',v6El('emailinput',7,31,86,10,'')); p.elements.Email.placeholder='Email';
      add('Password',v6El('passwordinput',7,45,86,10,'')); p.elements.Password.placeholder='Password';
      add('Confirm',v6El('passwordinput',7,59,86,10,'')); p.elements.Confirm.placeholder='Confirm password';
      add('Terms',v6El('checkbox',7,73,86,8,'I agree to the terms'));
      add('Create',v6El('button',7,85,86,11,'Create Account'));
      return p;
    },
    'Profile Card': () => {
      p.width=46; p.height=56; header('Profile');
      add('Avatar',v6El('avatar',36,17,28,25,'U'));
      add('DisplayName',v6El('label',10,47,80,9,'Display Name'));
      add('Username',v6El('label',10,58,80,7,'@username'));
      add('Bio',v6El('label',8,68,84,14,'A short profile bio goes here.'));
      add('Edit',v6El('button',25,86,50,10,'Edit Profile'));
      return p;
    },
    'Notification Center': () => {
      p.width=52; p.height=76; header('Notifications');
      add('Notifications',v6El('list',3,13,94,74,''));
      p.elements.Notifications.items=['Welcome!','Your download is ready','Achievement unlocked','New message'];
      add('Clear',v6El('button',70,90,27,8,'Clear All'));
      return p;
    },
    'File Manager': () => {
      p.width=82; p.height=78; header('Files');
      add('Toolbar',v6El('toolbar',2,12,96,8,'')); p.elements.Toolbar.items=['Back','Forward','New Folder','Upload'];
      add('Sidebar',v6El('list',2,22,22,75,'')); p.elements.Sidebar.items=['Home','Desktop','Documents','Pictures','Downloads'];
      add('Files',v6El('datagrid',26,22,72,75,'')); p.elements.Files.columns=['Name','Type','Size']; p.elements.Files.rows=[['example.txt','Text','2 KB'],['photo.png','Image','1.3 MB']];
      return p;
    },
    'Music Player': () => {
      p.width=58; p.height=64; header('Music Player');
      add('Artwork',v6El('avatar',34,17,32,28,'♪'));
      add('Track',v6El('label',8,49,84,8,'Track Name'));
      add('Artist',v6El('label',8,58,84,6,'Artist'));
      add('Progress',v6El('progressbar',8,69,84,6,''));
      add('Previous',v6El('button',18,80,18,12,'⏮'));
      add('Play',v6El('button',41,80,18,12,'▶'));
      add('Next',v6El('button',64,80,18,12,'⏭'));
      return p;
    },
    'Video Player': () => {
      p.width=76; p.height=72; header('Video Player');
      add('VideoArea',v6El('panel',3,13,94,66,''));
      add('Timeline',v6El('slider',3,81,70,7,''));
      add('Play',v6El('button',76,80,9,9,'▶'));
      add('Volume',v6El('slider',87,81,10,7,''));
      return p;
    },
    'Calculator': () => {
      p.width=38; p.height=66; header('Calculator');
      add('Display',v6El('label',5,15,90,15,'0'));
      const keys=['7','8','9','÷','4','5','6','×','1','2','3','−','0','.','=','+'];
      keys.forEach((k,i)=>add('Key'+i,v6El('button',5+(i%4)*23,34+Math.floor(i/4)*15,20,12,k)));
      return p;
    },
    'Notes App': () => {
      p.width=68; p.height=76; header('Notes');
      add('Toolbar',v6El('toolbar',2,12,96,8,'')); p.elements.Toolbar.items=['New','Save','Delete'];
      add('Title',v6El('textinput',3,23,94,9,'')); p.elements.Title.placeholder='Note title';
      add('Note',v6El('textarea',3,34,94,63,'')); p.elements.Note.placeholder='Start typing...';
      return p;
    },
    'Paint App': () => {
      p.width=82; p.height=78; header('Paint');
      add('Tools',v6El('toolbar',2,12,96,8,'')); p.elements.Tools.items=['Brush','Eraser','Fill','Line','Rectangle','Undo'];
      add('Canvas',v6El('panel',2,22,96,70,'')); p.elements.Canvas.style.background='#ffffff';
      add('BrushSize',v6El('slider',2,94,28,5,''));
      add('Color',v6El('colorpicker',33,92,12,7,''));
      return p;
    },
    'App Launcher': () => {
      p.width=70; p.height=72; header('Apps');
      add('Search',v6El('textinput',4,14,92,9,'')); p.elements.Search.placeholder='Search apps...';
      add('Apps',v6El('datagrid',4,26,92,68,'')); p.elements.Apps.columns=['Icon','App']; p.elements.Apps.rows=[['🌐','Browser'],['📁','Files'],['📝','Notes'],['⚙','Settings'],['💬','Chat']];
      return p;
    },
    'Taskbar': () => {
      p.x=0;p.y=90;p.width=100;p.height=10;p.style.borderRadius=0;p.style.padding=2;
      add('Start',v6El('button',1,10,10,80,'☰'));
      add('Apps',v6El('toolbar',13,10,60,80,'')); p.elements.Apps.items=['Browser','Files','Chat'];
      add('Clock',v6El('clock',80,10,19,80,''));
      return p;
    },
    'Start Menu': () => {
      p.width=44;p.height=68;p.x=2;p.y=20;header('Start');
      add('Search',v6El('textinput',4,14,92,9,'')); p.elements.Search.placeholder='Search';
      add('Apps',v6El('list',4,26,92,58,'')); p.elements.Apps.items=['Browser','Files','Notes','Settings','Terminal'];
      add('Power',v6El('button',4,88,28,9,'Power'));
      add('Profile',v6El('button',68,88,28,9,'User'));
      return p;
    },
    'Friends List': () => {
      p.width=48;p.height=72;header('Friends');
      add('Search',v6El('textinput',4,14,92,9,'')); p.elements.Search.placeholder='Find friends...';
      add('Friends',v6El('list',4,26,92,69,'')); p.elements.Friends.items=['Alex — Online','Sam — Away','Taylor — Offline','Jordan — Online'];
      return p;
    },
    'Comment Section': () => {
      p.width=70;p.height=76;header('Comments');
      add('Comments',v6El('scrollarea',3,13,94,62,''));
      add('Comment1',v6El('chatbubble',4,17,75,14,'This is a comment.'));
      add('Comment2',v6El('chatbubble',4,34,75,14,'And another one!'));
      add('NewComment',v6El('textarea',3,79,78,12,'')); p.elements.NewComment.placeholder='Write a comment...';
      add('Post',v6El('button',83,79,14,12,'Post'));
      return p;
    },
    'Pause Menu': () => {
      p.width=42;p.height=58;p.x=29;p.y=21;p.modal=true;header('Paused');
      add('Resume',v6El('button',12,25,76,14,'Resume'));
      add('Settings',v6El('button',12,45,76,14,'Settings'));
      add('Restart',v6El('button',12,65,76,14,'Restart'));
      add('Quit',v6El('button',12,85,76,10,'Quit'));
      return p;
    },
    'Shop': () => {
      p.width=76;p.height=76;header('Shop');
      add('Balance',v6El('statcard',73,12,24,10,'Coins')); p.elements.Balance.v6Data={value:'100'};
      add('Categories',v6El('segmentedcontrol',3,14,65,8,'')); p.elements.Categories.items=['Featured','Items','Upgrades'];
      add('Items',v6El('datagrid',3,25,94,60,'')); p.elements.Items.columns=['Item','Price']; p.elements.Items.rows=[['Cool Hat','50'],['Glow','75'],['Icon','100']];
      add('Buy',v6El('button',73,89,24,8,'Buy'));
      return p;
    },
    'Quest Log': () => {
      p.width=66;p.height=74;header('Quest Log');
      add('Quests',v6El('list',3,14,35,80,'')); p.elements.Quests.items=['Main Quest','Find the Key','Explore the Cave'];
      add('QuestTitle',v6El('label',41,16,56,9,'Main Quest'));
      add('Description',v6El('richtext',41,28,56,45,'Complete the objective.'));
      add('Progress',v6El('progressbar',41,78,56,8,''));
      return p;
    },
    'Achievement Popup': () => {
      p.width=48;p.height=22;p.x=50;p.y=3;p.style.borderRadius=12;
      add('Icon',v6El('icon',4,18,18,64,'★'));
      add('Title',v6El('label',25,20,71,24,'Achievement Unlocked!'));
      add('Description',v6El('label',25,50,71,28,'You did the thing.'));
      return p;
    },
    'Level Select': () => {
      p.width=74;p.height=74;header('Select Level');
      add('Levels',v6El('datagrid',3,14,94,71,'')); p.elements.Levels.columns=['Level','Difficulty','Best']; p.elements.Levels.rows=[['Level 1','Easy','100%'],['Level 2','Normal','64%'],['Level 3','Hard','0%']];
      add('Play',v6El('button',72,89,25,8,'Play'));
      return p;
    },
    'Coding Assistant': () => {
      p.width=82;p.height=78;header('Coding Assistant');
      add('Conversation',v6El('scrollarea',2,13,43,73,''));
      add('AssistantMessage',v6El('chatbubble',4,17,39,16,'What would you like help with?'));
      add('Code',v6El('terminal',47,13,51,73,''));
      add('Prompt',v6El('textarea',2,88,78,9,'')); p.elements.Prompt.placeholder='Ask about your code...';
      add('Send',v6El('button',82,88,16,9,'Send'));
      return p;
    },
    'Help Desk': () => {
      p.width=66;p.height=72;header('Help Desk');
      add('Topics',v6El('list',3,14,30,79,'')); p.elements.Topics.items=['Getting Started','Controls','FAQ','Contact'];
      add('Article',v6El('markdown',36,14,61,60,'# Help\nChoose a topic on the left.'));
      add('Search',v6El('textinput',36,78,61,9,'')); p.elements.Search.placeholder='Search help...';
      add('Contact',v6El('button',72,90,25,7,'Contact'));
      return p;
    }
  };
  return factories[name] ? factories[name]() : null;
}

const _sg611CreateFromTemplate = SuperGUI.prototype.createFromTemplate;
SuperGUI.prototype.createFromTemplate = function(a) {
  const template = String(a.TEMPLATE || '');
  if (!SG611_TEMPLATE_NAMES.includes(template)) return _sg611CreateFromTemplate.call(this,a);
  const name = String(a.NAME || template || 'Panel');
  const p = sg611Template(template); if (!p) return;
  const key = v6UniquePanelKey(this); p.name=name; p.zIndex=this._nextZ();
  this.config.panels[key]=p; this.config.panelOrder.push(key); this._renderPanel(key); return name;
};

const _sg611TemplateAsJSON = SuperGUI.prototype.templateAsJSON;
SuperGUI.prototype.templateAsJSON = function(a) {
  const template = String(a.TEMPLATE || '');
  if (!SG611_TEMPLATE_NAMES.includes(template)) return _sg611TemplateAsJSON.call(this,a);
  const p = sg611Template(template); return p ? JSON.stringify(p) : '{}';
};
