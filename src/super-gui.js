import {
  EASINGS, ELEMENT_TYPES, EXT_ID, LEGACY_SLOT_PREFIX, SLOT_PREFIX, THEMES, defaultConfig, defaultElement,
  defaultElementStyle, defaultPanelStyle, lerpColor, loadConfigFromStorage,
  normalizeConfig, saveConfigToStorage
} from './constants-and-model.js';
import { SUPERGUI_EDITOR_HTML } from './editor/editor-template.js';
import { GameServices } from './game-services.js';

export class SuperGUI {
    constructor(runtime) {
      this.runtime = runtime;
      this.config = loadConfigFromStorage();
      this.overlay = null;
      this.panelDoms = {};
      this.elementDoms = {};
      this._draggingElements = new Set();
      this._justDragged = new Set();
      this._editorWindow = null;
      this._tweens = [];
      this._tweenPaused = false;
      this._tweenPanelSet = new Set();
      this._pinnedElements = {};
      this._followMap = {};
      this._currentTheme = 'dark';
      this._globalVolume = 1;
      this._muted = false;
      this._gridSize = 0;
      this._parallaxX = 0; this._parallaxY = 0;
      this._particleAnims = {};
      this._carouselTimers = {};
      this._lastMouseX = 0; this._lastMouseY = 0;
      this.gameServices = new GameServices(this);
      this._buildOverlay();
      this._renderAll();
      this._syncOverlayPosition();
      setInterval(() => this._syncOverlayPosition(), 250);
      window.addEventListener('resize', () => this._syncOverlayPosition());
      document.addEventListener('mousemove', (e) => { this._lastMouseX = e.clientX; this._lastMouseY = e.clientY; });
      window.__superGUIInstance = this;
      this._startRAF();
    }

    getInfo() {
      const S = Scratch.ArgumentType;
      const B = Scratch.BlockType;
      const str = (m) => ({ type: S.STRING, menu: m });
      const num = (d=0) => ({ type: S.NUMBER, defaultValue: d });
      return {
        id: EXT_ID, name: 'SuperGUI', color1: '#5B6EE1', color2: '#4756B8', color3: '#38408C',
        blocks: [
          { opcode: 'openEditor', blockType: B.COMMAND, text: 'open SuperGUI editor' },

          { blockType: B.LABEL, text: '─── Panel ───' },
          { opcode: 'showPanel', blockType: B.COMMAND, text: 'show panel [P]', arguments: { P: str('panels') } },
          { opcode: 'hidePanel', blockType: B.COMMAND, text: 'hide panel [P]', arguments: { P: str('panels') } },
          { opcode: 'togglePanel', blockType: B.COMMAND, text: 'toggle panel [P]', arguments: { P: str('panels') } },
          { opcode: 'isPanelVisible', blockType: B.BOOLEAN, text: 'panel [P] is visible?', arguments: { P: str('panels') } },
          { opcode: 'closePanel', blockType: B.COMMAND, text: 'close panel [P]', arguments: { P: str('panels') } },
          { opcode: 'whenPanelClosed', blockType: B.HAT, text: 'when panel [P] closed', arguments: { P: str('panels') } },
          { opcode: 'minimizePanel', blockType: B.COMMAND, text: 'minimize panel [P]', arguments: { P: str('panels') } },
          { opcode: 'restorePanel', blockType: B.COMMAND, text: 'restore panel [P]', arguments: { P: str('panels') } },
          { opcode: 'isPanelMinimized', blockType: B.BOOLEAN, text: 'panel [P] is minimized?', arguments: { P: str('panels') } },
          { opcode: 'bringPanelToFront', blockType: B.COMMAND, text: 'bring panel [P] to front', arguments: { P: str('panels') } },
          { opcode: 'sendPanelToBack', blockType: B.COMMAND, text: 'send panel [P] to back', arguments: { P: str('panels') } },
          { opcode: 'setPanelPosition', blockType: B.COMMAND, text: 'set panel [P] position x:[X] y:[Y]', arguments: { P: str('panels'), X: num(20), Y: num(20) } },
          { opcode: 'setPanelSize', blockType: B.COMMAND, text: 'set panel [P] size w:[W] h:[H]', arguments: { P: str('panels'), W: num(50), H: num(50) } },
          { opcode: 'getPanelX', blockType: B.REPORTER, text: 'panel [P] x', arguments: { P: str('panels') } },
          { opcode: 'getPanelY', blockType: B.REPORTER, text: 'panel [P] y', arguments: { P: str('panels') } },
          { opcode: 'getPanelWidth', blockType: B.REPORTER, text: 'panel [P] width', arguments: { P: str('panels') } },
          { opcode: 'getPanelHeight', blockType: B.REPORTER, text: 'panel [P] height', arguments: { P: str('panels') } },
          { opcode: 'setPanelOpacity', blockType: B.COMMAND, text: 'set panel [P] opacity [O]', arguments: { P: str('panels'), O: num(1) } },
          { opcode: 'setPanelBackground', blockType: B.COMMAND, text: 'set panel [P] background [C]', arguments: { P: str('panels'), C: { type: S.COLOR } } },
          { opcode: 'setPanelBackgroundImage', blockType: B.COMMAND, text: 'set panel [P] background image [URL]', arguments: { P: str('panels'), URL: { type: S.STRING, defaultValue: '' } } },
          { opcode: 'setPanelDraggable', blockType: B.COMMAND, text: 'set panel [P] draggable [D]', arguments: { P: str('panels'), D: { type: S.BOOLEAN } } },
          { opcode: 'setPanelTitleBar', blockType: B.COMMAND, text: 'set panel [P] title bar [V]', arguments: { P: str('panels'), V: { type: S.BOOLEAN } } },
          { opcode: 'setPanelModal', blockType: B.COMMAND, text: 'set panel [P] modal [M]', arguments: { P: str('panels'), M: { type: S.BOOLEAN } } },
          { opcode: 'closeAllModals', blockType: B.COMMAND, text: 'close all modal panels' },
          { opcode: 'getAllPanelNames', blockType: B.REPORTER, text: 'all panel names' },
          { opcode: 'clearAllPanels', blockType: B.COMMAND, text: 'delete all panels' },

          { blockType: B.LABEL, text: '─── Element: create / manage ───' },
          { opcode: 'createElement', blockType: B.COMMAND, text: 'create [T] element [ID] in [P]', arguments: { T: { type: S.STRING, menu: 'elementTypes' }, ID: { type: S.STRING, defaultValue: 'NewElement' }, P: str('panels') } },
          { opcode: 'deleteElement', blockType: B.COMMAND, text: 'delete element [E]', arguments: { E: str('elements') } },
          { opcode: 'duplicateElement', blockType: B.COMMAND, text: 'duplicate [E] as [NEW]', arguments: { E: str('elements'), NEW: { type: S.STRING, defaultValue: 'Copy' } } },
          { opcode: 'moveElementToPanel', blockType: B.COMMAND, text: 'move [E] to panel [P]', arguments: { E: str('elements'), P: str('panels') } },
          { opcode: 'elementExists', blockType: B.BOOLEAN, text: 'element [E] exists?', arguments: { E: str('elements') } },
          { opcode: 'getElementType', blockType: B.REPORTER, text: 'type of [E]', arguments: { E: str('elements') } },
          { opcode: 'getParentPanelOfElement', blockType: B.REPORTER, text: 'parent panel of [E]', arguments: { E: str('elements') } },
          { opcode: 'getElementCountInPanel', blockType: B.REPORTER, text: 'count in [P]', arguments: { P: str('panels') } },
          { opcode: 'getElementAtIndex', blockType: B.REPORTER, text: 'element #[I] in [P]', arguments: { I: num(1), P: str('panels') } },
          { opcode: 'getAllElementIdsInPanel', blockType: B.REPORTER, text: 'all elements in [P]', arguments: { P: str('panels') } },

          { blockType: B.LABEL, text: '─── Element: transform ───' },
          { opcode: 'setElementPosition', blockType: B.COMMAND, text: 'set [E] position x:[X] y:[Y]', arguments: { E: str('elements'), X: num(10), Y: num(10) } },
          { opcode: 'setElementSize', blockType: B.COMMAND, text: 'set [E] size w:[W] h:[H]', arguments: { E: str('elements'), W: num(20), H: num(20) } },
          { opcode: 'setElementRotation', blockType: B.COMMAND, text: 'set [E] rotation [D]°', arguments: { E: str('elements'), D: num(0) } },
          { opcode: 'getElementX', blockType: B.REPORTER, text: '[E] x', arguments: { E: str('elements') } },
          { opcode: 'getElementY', blockType: B.REPORTER, text: '[E] y', arguments: { E: str('elements') } },
          { opcode: 'getElementWidth', blockType: B.REPORTER, text: '[E] width', arguments: { E: str('elements') } },
          { opcode: 'getElementHeight', blockType: B.REPORTER, text: '[E] height', arguments: { E: str('elements') } },
          { opcode: 'getElementRotation', blockType: B.REPORTER, text: '[E] rotation', arguments: { E: str('elements') } },
          { opcode: 'bringElementToFront', blockType: B.COMMAND, text: 'bring [E] to front', arguments: { E: str('elements') } },
          { opcode: 'sendElementToBack', blockType: B.COMMAND, text: 'send [E] to back', arguments: { E: str('elements') } },
          { opcode: 'setElementLocked', blockType: B.COMMAND, text: 'set [E] locked [L]', arguments: { E: str('elements'), L: { type: S.BOOLEAN } } },
          { opcode: 'setElementRuntimeDraggable', blockType: B.COMMAND, text: 'set [E] player-draggable [D]', arguments: { E: str('elements'), D: { type: S.BOOLEAN } } },
          { opcode: 'isElementBeingDragged', blockType: B.BOOLEAN, text: '[E] is being dragged?', arguments: { E: str('elements') } },
          { opcode: 'pinElementToEdge', blockType: B.COMMAND, text: 'pin [E] to [EDGE]', arguments: { E: str('elements'), EDGE: str('edges') } },
          { opcode: 'unpinElement', blockType: B.COMMAND, text: 'unpin [E]', arguments: { E: str('elements') } },
          { opcode: 'setElementFollow', blockType: B.COMMAND, text: '[E] follow [OTHER] dx:[DX] dy:[DY]', arguments: { E: str('elements'), OTHER: str('elements'), DX: num(0), DY: num(0) } },
          { opcode: 'stopElementFollow', blockType: B.COMMAND, text: 'stop [E] follow', arguments: { E: str('elements') } },

          { blockType: B.LABEL, text: '─── Element: appearance ───' },
          { opcode: 'setElementOpacity', blockType: B.COMMAND, text: 'set [E] opacity [O]', arguments: { E: str('elements'), O: num(1) } },
          { opcode: 'getElementOpacity', blockType: B.REPORTER, text: '[E] opacity', arguments: { E: str('elements') } },
          { opcode: 'setElementVisible', blockType: B.COMMAND, text: 'set [E] visible [V]', arguments: { E: str('elements'), V: { type: S.BOOLEAN } } },
          { opcode: 'isElementVisible', blockType: B.BOOLEAN, text: '[E] is visible?', arguments: { E: str('elements') } },
          { opcode: 'setElementColor', blockType: B.COMMAND, text: 'set [E] text color [C]', arguments: { E: str('elements'), C: { type: S.COLOR } } },
          { opcode: 'setElementBackgroundColor', blockType: B.COMMAND, text: 'set [E] background [C]', arguments: { E: str('elements'), C: { type: S.COLOR } } },
          { opcode: 'setElementBorderColor', blockType: B.COMMAND, text: 'set [E] border color [C]', arguments: { E: str('elements'), C: { type: S.COLOR } } },
          { opcode: 'setElementFontSize', blockType: B.COMMAND, text: 'set [E] font size [S]', arguments: { E: str('elements'), S: num(14) } },
          { opcode: 'setElementCursor', blockType: B.COMMAND, text: 'set [E] cursor [C]', arguments: { E: str('elements'), C: str('cursors') } },
          { opcode: 'setElementDisabled', blockType: B.COMMAND, text: 'set [E] disabled [D]', arguments: { E: str('elements'), D: { type: S.BOOLEAN } } },
          { opcode: 'isElementDisabled', blockType: B.BOOLEAN, text: '[E] is disabled?', arguments: { E: str('elements') } },
          { opcode: 'setElementDisabledBackground', blockType: B.COMMAND, text: 'set [E] disabled background [C]', arguments: { E: str('elements'), C: { type: S.COLOR } } },
          { opcode: 'setElementSkin', blockType: B.COMMAND, text: 'set [E] 9-slice skin [URL] slice [S] width [W] repeat [R]', arguments: { E: str('elements'), URL: { type: S.STRING, defaultValue: '' }, S: num(16), W: num(8), R: str('skinRepeats') } },
          { opcode: 'clearElementSkin', blockType: B.COMMAND, text: 'clear custom skin on [E]', arguments: { E: str('elements') } },
          { opcode: 'focusElement', blockType: B.COMMAND, text: 'focus [E]', arguments: { E: str('elements') } },
          { opcode: 'blurElement', blockType: B.COMMAND, text: 'blur [E]', arguments: { E: str('elements') } },

          { blockType: B.LABEL, text: '─── Element: value / content ───' },
          { opcode: 'setElementValue', blockType: B.COMMAND, text: 'set [E] value [V]', arguments: { E: str('elements'), V: { type: S.STRING, defaultValue: '50' } } },
          { opcode: 'getElementValue', blockType: B.REPORTER, text: '[E] value', arguments: { E: str('elements') } },
          { opcode: 'setElementText', blockType: B.COMMAND, text: 'set [E] text [T]', arguments: { E: str('elements'), T: { type: S.STRING, defaultValue: 'Text' } } },
          { opcode: 'getElementText', blockType: B.REPORTER, text: '[E] text', arguments: { E: str('elements') } },
          { opcode: 'getSelectedOption', blockType: B.REPORTER, text: '[E] selected option', arguments: { E: str('elements') } },
          { opcode: 'isChecked', blockType: B.BOOLEAN, text: '[E] checked?', arguments: { E: str('elements') } },
          { opcode: 'setDropdownOptions', blockType: B.COMMAND, text: 'set [E] options [LIST]', arguments: { E: str('elements'), LIST: { type: S.STRING, defaultValue: 'A, B, C' } } },
          { opcode: 'addDropdownOption', blockType: B.COMMAND, text: 'add option [O] to [E]', arguments: { E: str('elements'), O: { type: S.STRING, defaultValue: 'New' } } },
          { opcode: 'clearDropdownOptions', blockType: B.COMMAND, text: 'clear [E] options', arguments: { E: str('elements') } },
          { opcode: 'setSliderRange', blockType: B.COMMAND, text: 'set [E] range [MIN] to [MAX]', arguments: { E: str('elements'), MIN: num(0), MAX: num(100) } },
          { opcode: 'setSliderStep', blockType: B.COMMAND, text: 'set [E] step [S]', arguments: { E: str('elements'), S: num(1) } },
          { opcode: 'setImageSource', blockType: B.COMMAND, text: 'set image [E] source [URL]', arguments: { E: str('elements'), URL: { type: S.STRING, defaultValue: '' } } },
          { opcode: 'setImageFlipH', blockType: B.COMMAND, text: 'flip [E] horizontally [F]', arguments: { E: str('elements'), F: { type: S.BOOLEAN } } },
          { opcode: 'setImageFlipV', blockType: B.COMMAND, text: 'flip [E] vertically [F]', arguments: { E: str('elements'), F: { type: S.BOOLEAN } } },
          { opcode: 'setImageTint', blockType: B.COMMAND, text: 'set [E] tint [C]', arguments: { E: str('elements'), C: { type: S.COLOR } } },

          { blockType: B.LABEL, text: '─── Element: specialized ───' },
          { opcode: 'setProgressValue', blockType: B.COMMAND, text: 'set progress [E] value [V]', arguments: { E: str('elements'), V: num(50) } },
          { opcode: 'getProgressValue', blockType: B.REPORTER, text: 'progress [E] value', arguments: { E: str('elements') } },
          { opcode: 'setSwitchOn', blockType: B.COMMAND, text: 'set switch [E] [ON]', arguments: { E: str('elements'), ON: { type: S.BOOLEAN } } },
          { opcode: 'toggleSwitch', blockType: B.COMMAND, text: 'toggle switch [E]', arguments: { E: str('elements') } },
          { opcode: 'isSwitchOn', blockType: B.BOOLEAN, text: 'switch [E] on?', arguments: { E: str('elements') } },
          { opcode: 'whenSwitchToggled', blockType: B.HAT, text: 'when switch [E] toggled', arguments: { E: str('elements') } },
          { opcode: 'setRadioSelected', blockType: B.COMMAND, text: 'set radio [E] to [OPT]', arguments: { E: str('elements'), OPT: { type: S.STRING, defaultValue: 'A' } } },
          { opcode: 'getRadioSelected', blockType: B.REPORTER, text: 'radio [E] selected', arguments: { E: str('elements') } },
          { opcode: 'setColorPickerValue', blockType: B.COMMAND, text: 'set color picker [E] to [C]', arguments: { E: str('elements'), C: { type: S.COLOR } } },
          { opcode: 'getColorPickerValue', blockType: B.REPORTER, text: 'color picker [E] color', arguments: { E: str('elements') } },
          { opcode: 'setSelectorSelected', blockType: B.COMMAND, text: 'set selector [E] to cell [I]', arguments: { E: str('elements'), I: num(0) } },
          { opcode: 'getSelectorSelected', blockType: B.REPORTER, text: 'selector [E] selected', arguments: { E: str('elements') } },
          { opcode: 'setSelectorCellImage', blockType: B.COMMAND, text: 'set selector [E] cell [I] image [URL]', arguments: { E: str('elements'), I: num(0), URL: { type: S.STRING, defaultValue: '' } } },
          { opcode: 'setSelectorCellColor', blockType: B.COMMAND, text: 'set selector [E] cell [I] color [C]', arguments: { E: str('elements'), I: num(0), C: { type: S.COLOR } } },
          { opcode: 'populateSelector', blockType: B.COMMAND, text: 'populate selector [E] with [N] empty cells', arguments: { E: str('elements'), N: num(15) } },
          { opcode: 'clearSelector', blockType: B.COMMAND, text: 'clear selector [E]', arguments: { E: str('elements') } },
          { opcode: 'whenSelectorCellClicked', blockType: B.HAT, text: 'when selector [E] cell clicked', arguments: { E: str('elements') } },
          { opcode: 'setCounterValue', blockType: B.COMMAND, text: 'set counter [E] to [V]', arguments: { E: str('elements'), V: num(0) } },
          { opcode: 'getCounterValue', blockType: B.REPORTER, text: 'counter [E] value', arguments: { E: str('elements') } },
          { opcode: 'incrementCounter', blockType: B.COMMAND, text: 'increment counter [E] by [N]', arguments: { E: str('elements'), N: num(1) } },
          { opcode: 'decrementCounter', blockType: B.COMMAND, text: 'decrement counter [E] by [N]', arguments: { E: str('elements'), N: num(1) } },
          { opcode: 'setBadgeCount', blockType: B.COMMAND, text: 'set badge [E] count [N]', arguments: { E: str('elements'), N: num(0) } },
          { opcode: 'getBadgeCount', blockType: B.REPORTER, text: 'badge [E] count', arguments: { E: str('elements') } },
          { opcode: 'incrementBadge', blockType: B.COMMAND, text: 'increment badge [E]', arguments: { E: str('elements') } },
          { opcode: 'clearBadge', blockType: B.COMMAND, text: 'clear badge [E]', arguments: { E: str('elements') } },
          { opcode: 'showSpinner', blockType: B.COMMAND, text: 'show spinner [E]', arguments: { E: str('elements') } },
          { opcode: 'hideSpinner', blockType: B.COMMAND, text: 'hide spinner [E]', arguments: { E: str('elements') } },
          { opcode: 'playVideo', blockType: B.COMMAND, text: 'play video [E]', arguments: { E: str('elements') } },
          { opcode: 'pauseVideo', blockType: B.COMMAND, text: 'pause video [E]', arguments: { E: str('elements') } },
          { opcode: 'setRatingValue', blockType: B.COMMAND, text: 'set rating [E] to [V]', arguments: { E: str('elements'), V: num(0) } },
          { opcode: 'getRatingValue', blockType: B.REPORTER, text: 'rating [E] value', arguments: { E: str('elements') } },
          { opcode: 'setHealthFilled', blockType: B.COMMAND, text: 'set health bar [E] filled to [N]', arguments: { E: str('elements'), N: num(10) } },
          { opcode: 'getHealthFilled', blockType: B.REPORTER, text: 'health bar [E] filled', arguments: { E: str('elements') } },
          { opcode: 'damageHealth', blockType: B.COMMAND, text: 'damage health bar [E] by [N]', arguments: { E: str('elements'), N: num(1) } },
          { opcode: 'healHealth', blockType: B.COMMAND, text: 'heal health bar [E] by [N]', arguments: { E: str('elements'), N: num(1) } },
          { opcode: 'isHealthDead', blockType: B.BOOLEAN, text: 'health bar [E] is dead?', arguments: { E: str('elements') } },
          { opcode: 'setHealthSegments', blockType: B.COMMAND, text: 'set health bar [E] segments [N]', arguments: { E: str('elements'), N: num(10) } },
          { opcode: 'setHealthColors', blockType: B.COMMAND, text: 'set health bar [E] filled [F] empty [X] track [T]', arguments: { E: str('elements'), F: { type: S.COLOR }, X: { type: S.COLOR }, T: { type: S.COLOR } } },
          { opcode: 'setHealthArtMode', blockType: B.COMMAND, text: 'set health bar [E] art mode [M]', arguments: { E: str('elements'), M: str('healthArtModes') } },
          { opcode: 'setHealthArtPiece', blockType: B.COMMAND, text: 'set health bar [E] [P] art [URL]', arguments: { E: str('elements'), P: str('healthPieces'), URL: { type: S.STRING, defaultValue: '' } } },
          { opcode: 'getJoystickX', blockType: B.REPORTER, text: 'joystick [E] x', arguments: { E: str('elements') } },
          { opcode: 'getJoystickY', blockType: B.REPORTER, text: 'joystick [E] y', arguments: { E: str('elements') } },
          { opcode: 'getJoystickAngle', blockType: B.REPORTER, text: 'joystick [E] angle', arguments: { E: str('elements') } },
          { opcode: 'resetJoystick', blockType: B.COMMAND, text: 'reset joystick [E]', arguments: { E: str('elements') } },
          { opcode: 'getDPadDirection', blockType: B.REPORTER, text: 'dpad [E] direction', arguments: { E: str('elements') } },
          { opcode: 'resetDPad', blockType: B.COMMAND, text: 'reset dpad [E]', arguments: { E: str('elements') } },
          { opcode: 'setTabsActive', blockType: B.COMMAND, text: 'set tabs [E] active to [I]', arguments: { E: str('elements'), I: num(0) } },
          { opcode: 'getTabsActive', blockType: B.REPORTER, text: 'tabs [E] active', arguments: { E: str('elements') } },
          { opcode: 'setKnobValue', blockType: B.COMMAND, text: 'set knob [E] to [V]', arguments: { E: str('elements'), V: num(0) } },
          { opcode: 'getKnobValue', blockType: B.REPORTER, text: 'knob [E] value', arguments: { E: str('elements') } },
          { opcode: 'nextCarouselSlide', blockType: B.COMMAND, text: 'next carousel [E] slide', arguments: { E: str('elements') } },
          { opcode: 'previousCarouselSlide', blockType: B.COMMAND, text: 'previous carousel [E] slide', arguments: { E: str('elements') } },
          { opcode: 'getCarouselCurrent', blockType: B.REPORTER, text: 'carousel [E] current', arguments: { E: str('elements') } },
          { opcode: 'setCarouselAutoplay', blockType: B.COMMAND, text: 'set carousel [E] autoplay [B] [MS]ms', arguments: { E: str('elements'), B: { type: S.BOOLEAN }, MS: num(3000) } },
          { opcode: 'emitParticles', blockType: B.COMMAND, text: 'emit particles from [E]', arguments: { E: str('elements') } },
          { opcode: 'clearParticles', blockType: B.COMMAND, text: 'clear particles [E]', arguments: { E: str('elements') } },
          { opcode: 'canvasClear', blockType: B.COMMAND, text: 'clear canvas [E]', arguments: { E: str('elements') } },
          { opcode: 'canvasDrawRect', blockType: B.COMMAND, text: 'rect on [E] x:[X] y:[Y] w:[W] h:[H] [C]', arguments: { E: str('elements'), X: num(0), Y: num(0), W: num(20), H: num(20), C: { type: S.COLOR } } },
          { opcode: 'canvasDrawCircle', blockType: B.COMMAND, text: 'circle on [E] x:[X] y:[Y] r:[R] [C]', arguments: { E: str('elements'), X: num(50), Y: num(50), R: num(10), C: { type: S.COLOR } } },
          { opcode: 'canvasDrawLine', blockType: B.COMMAND, text: 'line on [E] x1:[X1] y1:[Y1] x2:[X2] y2:[Y2] [C]', arguments: { E: str('elements'), X1: num(0), Y1: num(0), X2: num(100), Y2: num(100), C: { type: S.COLOR } } },
          { opcode: 'canvasDrawText', blockType: B.COMMAND, text: 'text on [E] x:[X] y:[Y] [T] [C] size [S]', arguments: { E: str('elements'), X: num(10), Y: num(20), T: { type: S.STRING, defaultValue: 'Hi' }, C: { type: S.COLOR }, S: num(16) } },
          { opcode: 'showTooltip', blockType: B.COMMAND, text: 'show tooltip [E]', arguments: { E: str('elements') } },
          { opcode: 'hideTooltip', blockType: B.COMMAND, text: 'hide tooltip [E]', arguments: { E: str('elements') } },

          { blockType: B.LABEL, text: '─── Layout ───' },
          { opcode: 'setGridSize', blockType: B.COMMAND, text: 'set grid size [N]% (0=off)', arguments: { N: num(5) } },
          { opcode: 'snapElementToGrid', blockType: B.COMMAND, text: 'snap [E] to grid', arguments: { E: str('elements') } },
          { opcode: 'snapAllInPanel', blockType: B.COMMAND, text: 'snap all in [P] to grid', arguments: { P: str('panels') } },
          { opcode: 'alignElementInPanel', blockType: B.COMMAND, text: 'align [E] to [SIDE] in [P]', arguments: { E: str('elements'), SIDE: str('sides'), P: str('panels') } },
          { opcode: 'centerElementInPanel', blockType: B.COMMAND, text: 'center [E] [DIR] in [P]', arguments: { E: str('elements'), DIR: str('dirs'), P: str('panels') } },

          { blockType: B.LABEL, text: '─── Tweens ───' },
          { opcode: 'tweenElementX', blockType: B.COMMAND, text: 'tween [E] x to [X] [T]s [EASE]', arguments: { E: str('elements'), X: num(50), T: num(0.5), EASE: str('easings') } },
          { opcode: 'tweenElementY', blockType: B.COMMAND, text: 'tween [E] y to [Y] [T]s [EASE]', arguments: { E: str('elements'), Y: num(50), T: num(0.5), EASE: str('easings') } },
          { opcode: 'tweenElementPosition', blockType: B.COMMAND, text: 'tween [E] to x:[X] y:[Y] [T]s [EASE]', arguments: { E: str('elements'), X: num(50), Y: num(50), T: num(0.5), EASE: str('easings') } },
          { opcode: 'tweenElementOpacity', blockType: B.COMMAND, text: 'tween [E] opacity to [O] [T]s [EASE]', arguments: { E: str('elements'), O: num(1), T: num(0.5), EASE: str('easings') } },
          { opcode: 'tweenElementRotation', blockType: B.COMMAND, text: 'tween [E] rotation to [D]° [T]s [EASE]', arguments: { E: str('elements'), D: num(0), T: num(0.5), EASE: str('easings') } },
          { opcode: 'tweenElementSize', blockType: B.COMMAND, text: 'tween [E] size to w:[W] h:[H] [T]s [EASE]', arguments: { E: str('elements'), W: num(50), H: num(20), T: num(0.5), EASE: str('easings') } },
          { opcode: 'tweenElementValue', blockType: B.COMMAND, text: 'tween [E] value to [V] [T]s [EASE]', arguments: { E: str('elements'), V: { type: S.NUMBER, defaultValue: 50 }, T: num(0.5), EASE: str('easings') } },
          { opcode: 'shakeElement', blockType: B.COMMAND, text: 'shake [E] intensity [I] [T]s', arguments: { E: str('elements'), I: num(10), T: num(0.5) } },
          { opcode: 'pulseElement', blockType: B.COMMAND, text: 'pulse [E] scale [S] [T]s', arguments: { E: str('elements'), S: num(1.2), T: num(0.4) } },
          { opcode: 'bounceElement', blockType: B.COMMAND, text: 'bounce [E] [T]s', arguments: { E: str('elements'), T: num(0.5) } },
          { opcode: 'fadeInElement', blockType: B.COMMAND, text: 'fade in [E] [T]s', arguments: { E: str('elements'), T: num(0.5) } },
          { opcode: 'fadeOutElement', blockType: B.COMMAND, text: 'fade out [E] [T]s', arguments: { E: str('elements'), T: num(0.5) } },
          { opcode: 'isElementTweening', blockType: B.BOOLEAN, text: '[E] tweening?', arguments: { E: str('elements') } },
          { opcode: 'stopTweensOnElement', blockType: B.COMMAND, text: 'stop tweens on [E]', arguments: { E: str('elements') } },
          { opcode: 'stopAllTweens', blockType: B.COMMAND, text: 'stop all tweens' },
          { opcode: 'pauseAllTweens', blockType: B.COMMAND, text: 'pause all tweens' },
          { opcode: 'resumeAllTweens', blockType: B.COMMAND, text: 'resume all tweens' },

          { blockType: B.LABEL, text: '─── Sound ───' },
          { opcode: 'setElementClickSound', blockType: B.COMMAND, text: 'set [E] click sound [URL]', arguments: { E: str('elements'), URL: { type: S.STRING, defaultValue: '' } } },
          { opcode: 'setElementHoverSound', blockType: B.COMMAND, text: 'set [E] hover sound [URL]', arguments: { E: str('elements'), URL: { type: S.STRING, defaultValue: '' } } },
          { opcode: 'playSound', blockType: B.COMMAND, text: 'play sound [URL]', arguments: { URL: { type: S.STRING, defaultValue: '' } } },
          { opcode: 'setGlobalVolume', blockType: B.COMMAND, text: 'set global volume [V]', arguments: { V: num(1) } },
          { opcode: 'muteAllSounds', blockType: B.COMMAND, text: 'mute all sounds' },
          { opcode: 'unmuteAllSounds', blockType: B.COMMAND, text: 'unmute all sounds' },

          { blockType: B.LABEL, text: '─── Theme ───' },
          { opcode: 'setTheme', blockType: B.COMMAND, text: 'set theme [T]', arguments: { T: str('themes') } },
          { opcode: 'getCurrentTheme', blockType: B.REPORTER, text: 'current theme' },
          { opcode: 'setThemeColor', blockType: B.COMMAND, text: 'set theme [ROLE] to [C]', arguments: { ROLE: str('themeRoles'), C: { type: S.COLOR } } },

          { blockType: B.LABEL, text: '─── Game services: setup ───' },
          { opcode: 'setGameNamespace', blockType: B.COMMAND, text: 'set game namespace [N]', arguments: { N: { type: S.STRING, defaultValue: 'my-game' } } },
          { opcode: 'getGameNamespace', blockType: B.REPORTER, text: 'game namespace' },
          { opcode: 'setPlayerId', blockType: B.COMMAND, text: 'set player ID [ID]', arguments: { ID: { type: S.STRING, defaultValue: 'player' } } },
          { opcode: 'getPlayerId', blockType: B.REPORTER, text: 'player ID' },
          { opcode: 'setStorageAdapter', blockType: B.COMMAND, text: 'use [A] for game data', arguments: { A: str('storageAdapters') } },
          { opcode: 'getStorageAdapter', blockType: B.REPORTER, text: 'active game data adapter' },
          { opcode: 'isCompanionLoaded', blockType: B.BOOLEAN, text: 'is [X] available?', arguments: { X: str('companions') } },
          { opcode: 'getGameServiceStatus', blockType: B.REPORTER, text: 'game services status' },
          { opcode: 'isCloudServerUp', blockType: B.BOOLEAN, text: 'Free Servers: is [URL] up?', arguments: { URL: { type: S.STRING, defaultValue: 'wss://clouddata.turbowarp.org' } } },

          { blockType: B.LABEL, text: '─── Achievements ───' },
          { opcode: 'defineAchievement', blockType: B.COMMAND, text: 'define achievement [A] title [T] description [D] points [P] target [G]', arguments: { A: { type: S.STRING, defaultValue: 'first-win' }, T: { type: S.STRING, defaultValue: 'First Win' }, D: { type: S.STRING, defaultValue: 'Win your first match' }, P: num(10), G: num(1) } },
          { opcode: 'setAchievementIcon', blockType: B.COMMAND, text: 'set achievement [A] icon [I]', arguments: { A: { type: S.STRING, defaultValue: 'first-win' }, I: { type: S.STRING, defaultValue: '🏆' } } },
          { opcode: 'setAchievementSecret', blockType: B.COMMAND, text: 'set achievement [A] secret [S]', arguments: { A: { type: S.STRING, defaultValue: 'first-win' }, S: { type: S.BOOLEAN } } },
          { opcode: 'unlockAchievement', blockType: B.COMMAND, text: 'unlock achievement [A]', arguments: { A: { type: S.STRING, defaultValue: 'first-win' } } },
          { opcode: 'setAchievementProgress', blockType: B.COMMAND, text: 'set achievement [A] progress [P]', arguments: { A: { type: S.STRING, defaultValue: 'first-win' }, P: num(1) } },
          { opcode: 'isAchievementUnlocked', blockType: B.BOOLEAN, text: 'achievement [A] unlocked?', arguments: { A: { type: S.STRING, defaultValue: 'first-win' } } },
          { opcode: 'getAchievementProgress', blockType: B.REPORTER, text: 'achievement [A] progress', arguments: { A: { type: S.STRING, defaultValue: 'first-win' } } },
          { opcode: 'getAchievementPoints', blockType: B.REPORTER, text: 'player achievement points' },
          { opcode: 'getAchievementDefinitions', blockType: B.REPORTER, text: 'achievement definitions' },
          { opcode: 'showAchievementInElement', blockType: B.COMMAND, text: 'show achievement [A] in UI element [E]', arguments: { A: { type: S.STRING, defaultValue: 'first-win' }, E: str('elements') } },
          { opcode: 'whenAchievementUnlocked', blockType: B.HAT, text: 'when achievement [A] unlocked', arguments: { A: { type: S.STRING, defaultValue: 'first-win' } } },

          { blockType: B.LABEL, text: '─── Leaderboards ───' },
          { opcode: 'submitLeaderboardScore', blockType: B.COMMAND, text: 'submit score [S] to [B] using [M]', arguments: { S: num(100), B: { type: S.STRING, defaultValue: 'main' }, M: str('scoreModes') } },
          { opcode: 'getLeaderboard', blockType: B.REPORTER, text: 'leaderboard [B] as JSON', arguments: { B: { type: S.STRING, defaultValue: 'main' } } },
          { opcode: 'getLeaderboardRank', blockType: B.REPORTER, text: 'player rank on [B]', arguments: { B: { type: S.STRING, defaultValue: 'main' } } },
          { opcode: 'getLeaderboardPlayer', blockType: B.REPORTER, text: 'player at rank [R] on [B]', arguments: { R: num(1), B: { type: S.STRING, defaultValue: 'main' } } },
          { opcode: 'getLeaderboardScore', blockType: B.REPORTER, text: 'score at rank [R] on [B]', arguments: { R: num(1), B: { type: S.STRING, defaultValue: 'main' } } },
          { opcode: 'refreshLeaderboardElement', blockType: B.COMMAND, text: 'show leaderboard [B] in UI element [E]', arguments: { B: { type: S.STRING, defaultValue: 'main' }, E: str('elements') } },
          { opcode: 'whenLeaderboardUpdated', blockType: B.HAT, text: 'when leaderboard [B] updated', arguments: { B: { type: S.STRING, defaultValue: 'main' } } },

          { blockType: B.LABEL, text: '─── Events ───' },
          { opcode: 'whenButtonClicked', blockType: B.HAT, text: 'when [E] clicked', arguments: { E: str('elements') } },
          { opcode: 'whenElementChanged', blockType: B.HAT, text: 'when [E] changed', arguments: { E: str('elements') } },
          { opcode: 'whenElementHovered', blockType: B.HAT, text: 'when [E] hovered', arguments: { E: str('elements') } },
          { opcode: 'whenElementDragged', blockType: B.HAT, text: 'when [E] dragged', arguments: { E: str('elements') } },
          { opcode: 'whenElementDragEnd', blockType: B.HAT, text: 'when [E] drag ends', arguments: { E: str('elements') } },
          { opcode: 'whenElementRightClicked', blockType: B.HAT, text: 'when [E] right clicked', arguments: { E: str('elements') } },
          { opcode: 'whenElementDoubleClicked', blockType: B.HAT, text: 'when [E] double clicked', arguments: { E: str('elements') } },
          { opcode: 'isMouseOverElement', blockType: B.BOOLEAN, text: 'mouse over [E]?', arguments: { E: str('elements') } },
          { opcode: 'isMouseOverPanel', blockType: B.BOOLEAN, text: 'mouse over [P]?', arguments: { P: str('panels') } },
          { opcode: 'getMouseX', blockType: B.REPORTER, text: 'mouse x in [P]', arguments: { P: str('panels') } },
          { opcode: 'getMouseY', blockType: B.REPORTER, text: 'mouse y in [P]', arguments: { P: str('panels') } },

          { blockType: B.LABEL, text: '─── Save / Load ───' },
          { opcode: 'saveGUI', blockType: B.COMMAND, text: 'save GUI' },
          { opcode: 'loadGUI', blockType: B.COMMAND, text: 'load GUI' },
          { opcode: 'exportGUI', blockType: B.REPORTER, text: 'export GUI config' },
          { opcode: 'importGUI', blockType: B.COMMAND, text: 'import GUI config [D]', arguments: { D: { type: S.STRING, defaultValue: '{}' } } },
          { opcode: 'saveGUIAs', blockType: B.COMMAND, text: 'save as slot [S]', arguments: { S: { type: S.STRING, defaultValue: 'level1' } } },
          { opcode: 'loadGUIFrom', blockType: B.COMMAND, text: 'load slot [S]', arguments: { S: { type: S.STRING, defaultValue: 'level1' } } },
          { opcode: 'listSavedSlots', blockType: B.REPORTER, text: 'saved slots' },
          { opcode: 'deleteSavedSlot', blockType: B.COMMAND, text: 'delete slot [S]', arguments: { S: { type: S.STRING, defaultValue: 'level1' } } }
        ],
        menus: {
          panels: { acceptReporters: true, items: 'getPanelMenu' },
          elements: { acceptReporters: true, items: 'getElementMenu' },
          elementTypes: { acceptReporters: false, items: ELEMENT_TYPES },
          easings: { acceptReporters: false, items: ['linear','easeIn','easeOut','easeInOut','easeInCubic','easeOutCubic','easeInOutCubic','easeInBack','easeOutBack','easeOutBounce','easeOutElastic'] },
          cursors: { acceptReporters: false, items: ['default','pointer','grab','grabbing','text','crosshair','move','not-allowed','help','none'] },
          edges: { acceptReporters: false, items: ['left','right','top','bottom'] },
          sides: { acceptReporters: false, items: ['left','right','top','bottom'] },
          dirs: { acceptReporters: false, items: ['horizontal','vertical','both'] },
          themes: { acceptReporters: false, items: ['dark','light','neon','gd'] },
          themeRoles: { acceptReporters: false, items: ['background','panel','accent','text','border'] },
          storageAdapters: { acceptReporters: false, items: ['local','auto','storage+','server storage'] },
          companions: { acceptReporters: false, items: ['storage+','server storage','free servers','local'] },
          scoreModes: { acceptReporters: false, items: ['best','latest'] },
          skinRepeats: { acceptReporters: false, items: ['stretch','round','repeat','space'] },
          healthArtModes: { acceptReporters: false, items: ['image','builtIn','none'] },
          healthPieces: { acceptReporters: false, items: ['left','middle','right'] }
        }
      };
    }

    getPanelMenu() { const n = this.config.panelOrder.map(k => this.config.panels[k] && this.config.panels[k].name).filter(Boolean); return n.length ? n : ['(no panels)']; }
    getElementMenu() { const n = []; for (const k of this.config.panelOrder) { const p = this.config.panels[k]; if (p) for (const id of p.elementOrder) n.push(id); } return n.length ? n : ['(no elements)']; }
    _findPanelKeyByName(name) { for (const k of this.config.panelOrder) { const p = this.config.panels[k]; if (p && p.name === name) return k; } return null; }
    _findElement(id) { for (const k of this.config.panelOrder) { const p = this.config.panels[k]; if (p && p.elements[id]) return { panelKey: k, panel: p, el: p.elements[id] }; } return null; }
    _nextZ() { this.config.nextZ = (this.config.nextZ || 1) + 1; return this.config.nextZ; }
    _uniqueId(base) { const all = []; for (const k of this.config.panelOrder) { const p = this.config.panels[k]; if (p) all.push(...p.elementOrder); } let id = base, i = 1; while (all.indexOf(id) !== -1) id = base + (++i); return id; }

    // =================== PANELS ===================
    showPanel(a) { const k = this._findPanelKeyByName(a.P); if (!k) return; this.config.panels[k].visible = true; this._renderPanel(k); }
    hidePanel(a) { const k = this._findPanelKeyByName(a.P); if (!k) return; this.config.panels[k].visible = false; this._renderPanel(k); }
    togglePanel(a) { const k = this._findPanelKeyByName(a.P); if (!k) return; const p = this.config.panels[k]; p.visible = !p.visible; this._renderPanel(k); }
    isPanelVisible(a) { const k = this._findPanelKeyByName(a.P); return k ? !!this.config.panels[k].visible : false; }
    closePanel(a) { const k = this._findPanelKeyByName(a.P); if (!k) return; this.config.panels[k].visible = false; this._renderPanel(k); this.runtime.startHats(EXT_ID + '_whenPanelClosed', { P: a.P }); }
    whenPanelClosed() { return false; }
    minimizePanel(a) { const k = this._findPanelKeyByName(a.P); if (!k) return; this.config.panels[k].minimized = true; this._renderPanel(k); }
    restorePanel(a) { const k = this._findPanelKeyByName(a.P); if (!k) return; this.config.panels[k].minimized = false; this._renderPanel(k); }
    isPanelMinimized(a) { const k = this._findPanelKeyByName(a.P); return k ? !!this.config.panels[k].minimized : false; }
    bringPanelToFront(a) { const k = this._findPanelKeyByName(a.P); if (!k) return; this.config.panels[k].zIndex = this._nextZ(); this._renderPanel(k); }
    sendPanelToBack(a) { const k = this._findPanelKeyByName(a.P); if (!k) return; this.config.panels[k].zIndex = 0; this._renderPanel(k); }
    setPanelPosition(a) { const k = this._findPanelKeyByName(a.P); if (!k) return; const p = this.config.panels[k]; p.x = Number(a.X); p.y = Number(a.Y); this._renderPanel(k); }
    setPanelSize(a) { const k = this._findPanelKeyByName(a.P); if (!k) return; const p = this.config.panels[k]; p.width = Number(a.W); p.height = Number(a.H); this._renderPanel(k); }
    getPanelX(a) { const k = this._findPanelKeyByName(a.P); return k ? this.config.panels[k].x : 0; }
    getPanelY(a) { const k = this._findPanelKeyByName(a.P); return k ? this.config.panels[k].y : 0; }
    getPanelWidth(a) { const k = this._findPanelKeyByName(a.P); return k ? this.config.panels[k].width : 0; }
    getPanelHeight(a) { const k = this._findPanelKeyByName(a.P); return k ? this.config.panels[k].height : 0; }
    setPanelOpacity(a) { const k = this._findPanelKeyByName(a.P); if (!k) return; this.config.panels[k].style.opacity = Number(a.O); this._renderPanel(k); }
    setPanelBackground(a) { const k = this._findPanelKeyByName(a.P); if (!k) return; this.config.panels[k].style.background = a.C; this._renderPanel(k); }
    setPanelBackgroundImage(a) { const k = this._findPanelKeyByName(a.P); if (!k) return; this.config.panels[k].backgroundImage = a.URL; this._renderPanel(k); }
    setPanelDraggable(a) { const k = this._findPanelKeyByName(a.P); if (!k) return; this.config.panels[k].draggable = !!a.D; this._renderPanel(k); }
    setPanelTitleBar(a) { const k = this._findPanelKeyByName(a.P); if (!k) return; this.config.panels[k].titleBar = !!a.V; this._renderPanel(k); }
    setPanelModal(a) { const k = this._findPanelKeyByName(a.P); if (!k) return; this.config.panels[k].modal = !!a.M; this._renderPanel(k); }
    closeAllModals() { for (const k of this.config.panelOrder) { if (this.config.panels[k].modal) { this.config.panels[k].visible = false; this._renderPanel(k); } } }
    getAllPanelNames() { return this.config.panelOrder.map(k => this.config.panels[k].name).join(', '); }
    clearAllPanels() { this._replaceConfig(defaultConfig()); }

    // =================== ELEMENT CREATE / MANAGE ===================
    createElement(a) {
      const k = this._findPanelKeyByName(a.P); if (!k) return;
      const panel = this.config.panels[k];
      const id = this._uniqueId(String(a.ID) || 'Element');
      const type = ELEMENT_TYPES.includes(a.T) ? a.T : 'label';
      panel.elements[id] = defaultElement(type);
      panel.elementOrder.push(id);
      this._renderPanel(k);
    }
    deleteElement(a) {
      const f = this._findElement(a.E); if (!f) return;
      delete f.panel.elements[a.E];
      f.panel.elementOrder = f.panel.elementOrder.filter(id => id !== a.E);
      this._stopTweensOn(a.E);
      delete this._pinnedElements[a.E];
      delete this._followMap[a.E];
      this._stopDynamicResources(a.E);
      this._renderPanel(f.panelKey);
    }
    duplicateElement(a) {
      const f = this._findElement(a.E); if (!f) return;
      const newId = this._uniqueId(String(a.NEW) || (a.E + 'Copy'));
      f.panel.elements[newId] = JSON.parse(JSON.stringify(f.el));
      f.panel.elementOrder.push(newId);
      this._renderPanel(f.panelKey);
    }
    moveElementToPanel(a) {
      const f = this._findElement(a.E); const destKey = this._findPanelKeyByName(a.P);
      if (!f || !destKey || destKey === f.panelKey) return;
      const dest = this.config.panels[destKey];
      delete f.panel.elements[a.E];
      f.panel.elementOrder = f.panel.elementOrder.filter(id => id !== a.E);
      dest.elements[a.E] = f.el;
      dest.elementOrder.push(a.E);
      this._renderPanel(f.panelKey);
      this._renderPanel(destKey);
    }
    elementExists(a) { return !!this._findElement(a.E); }
    getElementType(a) { const f = this._findElement(a.E); return f ? f.el.type : ''; }
    getParentPanelOfElement(a) { const f = this._findElement(a.E); return f ? f.panel.name : ''; }
    getElementCountInPanel(a) { const k = this._findPanelKeyByName(a.P); return k ? this.config.panels[k].elementOrder.length : 0; }
    getElementAtIndex(a) { const k = this._findPanelKeyByName(a.P); if (!k) return ''; return this.config.panels[k].elementOrder[Number(a.I) - 1] || ''; }
    getAllElementIdsInPanel(a) { const k = this._findPanelKeyByName(a.P); return k ? this.config.panels[k].elementOrder.join(', ') : ''; }

    // =================== ELEMENT TRANSFORM ===================
    setElementPosition(a) { const f = this._findElement(a.E); if (!f) return; f.el.x = Number(a.X); f.el.y = Number(a.Y); this._renderPanel(f.panelKey); }
    setElementSize(a) { const f = this._findElement(a.E); if (!f) return; f.el.width = Number(a.W); f.el.height = Number(a.H); this._renderPanel(f.panelKey); }
    setElementRotation(a) { const f = this._findElement(a.E); if (!f) return; f.el.rotation = Number(a.D); this._renderPanel(f.panelKey); }
    getElementX(a) { const f = this._findElement(a.E); return f ? f.el.x : 0; }
    getElementY(a) { const f = this._findElement(a.E); return f ? f.el.y : 0; }
    getElementWidth(a) { const f = this._findElement(a.E); return f ? f.el.width : 0; }
    getElementHeight(a) { const f = this._findElement(a.E); return f ? f.el.height : 0; }
    getElementRotation(a) { const f = this._findElement(a.E); return f ? f.el.rotation : 0; }
    bringElementToFront(a) { const f = this._findElement(a.E); if (!f) return; f.el.zIndex = this._nextZ(); this._renderPanel(f.panelKey); }
    sendElementToBack(a) { const f = this._findElement(a.E); if (!f) return; f.el.zIndex = 0; this._renderPanel(f.panelKey); }
    setElementLocked(a) { const f = this._findElement(a.E); if (!f) return; f.el.locked = !!a.L; }
    setElementRuntimeDraggable(a) { const f = this._findElement(a.E); if (!f) return; f.el.runtimeDraggable = !!a.D; this._renderPanel(f.panelKey); }
    isElementBeingDragged(a) { return this._draggingElements.has(a.E); }
    pinElementToEdge(a) { const f = this._findElement(a.E); if (!f) return; this._pinnedElements[a.E] = a.EDGE; this._updatePin(a.E); this._renderPanel(f.panelKey); }
    unpinElement(a) { delete this._pinnedElements[a.E]; const f = this._findElement(a.E); if (f) this._renderPanel(f.panelKey); }
    setElementFollow(a) { this._followMap[a.E] = { targetId: a.OTHER, dx: Number(a.DX), dy: Number(a.DY) }; this._updateFollows(); }
    stopElementFollow(a) { delete this._followMap[a.E]; }

    _updatePin(elId) {
      const f = this._findElement(elId); if (!f) return;
      const e = this._pinnedElements[elId]; if (!e) return;
      const el = f.el;
      if (e === 'left') el.x = 0;
      if (e === 'right') el.x = 100 - el.width;
      if (e === 'top') el.y = 0;
      if (e === 'bottom') el.y = 100 - el.height;
    }
    _updateFollows() {
      for (const elId in this._followMap) {
        const info = this._followMap[elId];
        const target = this._findElement(info.targetId);
        if (!target) continue;
        const f = this._findElement(elId);
        if (!f) continue;
        f.el.x = Math.max(0, Math.min(100 - f.el.width, target.el.x + info.dx));
        f.el.y = Math.max(0, Math.min(100 - f.el.height, target.el.y + info.dy));
      }
    }

    // =================== ELEMENT APPEARANCE ===================
    setElementOpacity(a) { const f = this._findElement(a.E); if (!f) return; f.el.style.opacity = Number(a.O); this._renderPanel(f.panelKey); }
    getElementOpacity(a) { const f = this._findElement(a.E); return f ? f.el.style.opacity : 1; }
    setElementVisible(a) { const f = this._findElement(a.E); if (!f) return; f.el.hidden = !a.V; this._renderPanel(f.panelKey); }
    isElementVisible(a) { const f = this._findElement(a.E); return f ? !f.el.hidden : false; }
    setElementColor(a) { const f = this._findElement(a.E); if (!f) return; f.el.style.color = a.C; this._renderPanel(f.panelKey); }
    setElementBackgroundColor(a) { const f = this._findElement(a.E); if (!f) return; f.el.style.background = a.C; this._renderPanel(f.panelKey); }
    setElementBorderColor(a) { const f = this._findElement(a.E); if (!f) return; f.el.style.borderColor = a.C; this._renderPanel(f.panelKey); }
    setElementFontSize(a) { const f = this._findElement(a.E); if (!f) return; f.el.style.fontSize = Number(a.S); this._renderPanel(f.panelKey); }
    setElementCursor(a) { const f = this._findElement(a.E); if (!f) return; f.el.cursor = a.C; this._renderPanel(f.panelKey); }
    setElementDisabled(a) { const f = this._findElement(a.E); if (!f) return; f.el.disabled = !!a.D; this._renderPanel(f.panelKey); }
    isElementDisabled(a) { const f = this._findElement(a.E); return f ? !!f.el.disabled : false; }
    setElementDisabledBackground(a) { const f = this._findElement(a.E); if (!f) return; f.el.disabledBg = a.C; this._renderPanel(f.panelKey); }
    setElementSkin(a) { const f = this._findElement(a.E); if (!f) return; f.el.skin = { url:String(a.URL || ''), slice:Math.max(0, Number(a.S) || 0), width:Math.max(0, Number(a.W) || 0), repeat:String(a.R || 'stretch') }; this._renderPanel(f.panelKey); }
    clearElementSkin(a) { const f = this._findElement(a.E); if (!f) return; delete f.el.skin; this._renderPanel(f.panelKey); }
    focusElement(a) { const n = this.elementDoms[a.E]; const inp = n && n.querySelector('input,textarea,select,button'); if (inp) inp.focus(); }
    blurElement(a) { const n = this.elementDoms[a.E]; const inp = n && n.querySelector('input,textarea,select,button'); if (inp) inp.blur(); }

    // =================== ELEMENT VALUE / CONTENT ===================
    setElementValue(a) {
      const f = this._findElement(a.E); if (!f) return;
      const el = f.el;
      switch (el.type) {
        case 'label': case 'button': el.text = String(a.V); break;
        case 'slider': case 'numberinput': el.value = Number(a.V); break;
        case 'checkbox': el.checked = a.V === 'true' || a.V === true; break;
        case 'dropdown': case 'radio': el.selected = String(a.V); break;
        case 'textinput': case 'search': el.value = String(a.V); break;
        default: if ('value' in el) el.value = a.V;
      }
      this._renderPanel(f.panelKey);
    }
    getElementValue(a) {
      const f = this._findElement(a.E); if (!f) return '';
      const el = f.el;
      switch (el.type) {
        case 'label': case 'button': return el.text;
        case 'slider': case 'numberinput': case 'counter': case 'knob': case 'rating': return el.value;
        case 'checkbox': return el.checked;
        case 'dropdown': case 'radio': return el.selected;
        case 'textinput': case 'search': return el.value;
        case 'switch': return el.on;
        case 'colorpicker': return el.value;
        case 'progressbar': return el.value;
        default: return el.value !== undefined ? el.value : '';
      }
    }
    setElementText(a) { const f = this._findElement(a.E); if (!f || !('text' in f.el)) return; f.el.text = String(a.T); this._renderPanel(f.panelKey); }
    getElementText(a) { const f = this._findElement(a.E); return f && 'text' in f.el ? f.el.text : ''; }
    getSelectedOption(a) { const f = this._findElement(a.E); return f && (f.el.type === 'dropdown' || f.el.type === 'radio') ? f.el.selected : ''; }
    isChecked(a) { const f = this._findElement(a.E); return !!(f && f.el.type === 'checkbox' && f.el.checked); }
    setDropdownOptions(a) {
      const f = this._findElement(a.E); if (!f || (f.el.type !== 'dropdown' && f.el.type !== 'radio')) return;
      f.el.options = String(a.LIST).split(',').map(s => s.trim()).filter(Boolean);
      if (f.el.options.indexOf(f.el.selected) === -1) f.el.selected = f.el.options[0] || '';
      this._renderPanel(f.panelKey);
    }
    addDropdownOption(a) { const f = this._findElement(a.E); if (!f || (f.el.type !== 'dropdown' && f.el.type !== 'radio')) return; f.el.options.push(String(a.O)); this._renderPanel(f.panelKey); }
    clearDropdownOptions(a) { const f = this._findElement(a.E); if (!f || (f.el.type !== 'dropdown' && f.el.type !== 'radio')) return; f.el.options = []; f.el.selected = ''; this._renderPanel(f.panelKey); }
    setSliderRange(a) { const f = this._findElement(a.E); if (!f) return; f.el.min = Number(a.MIN); f.el.max = Number(a.MAX); this._renderPanel(f.panelKey); }
    setSliderStep(a) { const f = this._findElement(a.E); if (!f) return; f.el.step = Number(a.S); this._renderPanel(f.panelKey); }
    setImageSource(a) { const f = this._findElement(a.E); if (!f) return; if (f.el.type === 'image' || f.el.type === 'background') f.el.src = a.URL; else if (f.el.type === 'imagebutton') f.el.image = a.URL; this._renderPanel(f.panelKey); }
    setImageFlipH(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'image') return; f.el.flipH = !!a.F; this._renderPanel(f.panelKey); }
    setImageFlipV(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'image') return; f.el.flipV = !!a.F; this._renderPanel(f.panelKey); }
    setImageTint(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'image') return; f.el.tint = a.C; this._renderPanel(f.panelKey); }

    // =================== ELEMENT SPECIALIZED ===================
    setProgressValue(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'progressbar') return; f.el.value = Number(a.V); this._renderPanel(f.panelKey); }
    getProgressValue(a) { const f = this._findElement(a.E); return f && f.el.type === 'progressbar' ? f.el.value : 0; }
    setSwitchOn(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'switch') return; f.el.on = !!a.ON; this._renderPanel(f.panelKey); this.runtime.startHats(EXT_ID + '_whenSwitchToggled', { E: a.E }); }
    toggleSwitch(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'switch') return; f.el.on = !f.el.on; this._renderPanel(f.panelKey); this.runtime.startHats(EXT_ID + '_whenSwitchToggled', { E: a.E }); }
    isSwitchOn(a) { const f = this._findElement(a.E); return !!(f && f.el.type === 'switch' && f.el.on); }
    whenSwitchToggled() { return false; }
    setRadioSelected(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'radio') return; f.el.selected = String(a.OPT); this._renderPanel(f.panelKey); }
    getRadioSelected(a) { const f = this._findElement(a.E); return f && f.el.type === 'radio' ? f.el.selected : ''; }
    setColorPickerValue(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'colorpicker') return; f.el.value = a.C; this._renderPanel(f.panelKey); }
    getColorPickerValue(a) { const f = this._findElement(a.E); return f && f.el.type === 'colorpicker' ? f.el.value : '#000000'; }
    setSelectorSelected(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'selector') return; f.el.selectedIndex = Number(a.I); this._renderPanel(f.panelKey); }
    getSelectorSelected(a) { const f = this._findElement(a.E); return f && f.el.type === 'selector' ? f.el.selectedIndex : -1; }
    setSelectorCellImage(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'selector') return; const i = Number(a.I); if (!f.el.cells[i]) f.el.cells[i] = { image:'', color:'#3a3f52', label:'' }; f.el.cells[i].image = a.URL; this._renderPanel(f.panelKey); }
    setSelectorCellColor(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'selector') return; const i = Number(a.I); if (!f.el.cells[i]) f.el.cells[i] = { image:'', color:'#3a3f52', label:'' }; f.el.cells[i].color = a.C; this._renderPanel(f.panelKey); }
    populateSelector(a) {
      const f = this._findElement(a.E); if (!f || f.el.type !== 'selector') return;
      const n = Number(a.N); f.el.cells = [];
      for (let i = 0; i < n; i++) f.el.cells.push({ image:'', color:'#3a3f52', label:'' });
      this._renderPanel(f.panelKey);
    }
    clearSelector(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'selector') return; f.el.cells = []; f.el.selectedIndex = -1; this._renderPanel(f.panelKey); }
    whenSelectorCellClicked() { return false; }
    setCounterValue(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'counter') return; f.el.value = Number(a.V); this._renderPanel(f.panelKey); }
    getCounterValue(a) { const f = this._findElement(a.E); return f && f.el.type === 'counter' ? f.el.value : 0; }
    incrementCounter(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'counter') return; f.el.value += Number(a.N); this._renderPanel(f.panelKey); }
    decrementCounter(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'counter') return; f.el.value -= Number(a.N); this._renderPanel(f.panelKey); }
    setBadgeCount(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'badge') return; f.el.count = Number(a.N); this._renderPanel(f.panelKey); }
    getBadgeCount(a) { const f = this._findElement(a.E); return f && f.el.type === 'badge' ? f.el.count : 0; }
    incrementBadge(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'badge') return; f.el.count += 1; this._renderPanel(f.panelKey); }
    clearBadge(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'badge') return; f.el.count = 0; this._renderPanel(f.panelKey); }
    showSpinner(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'spinner') return; f.el.visible = true; this._renderPanel(f.panelKey); }
    hideSpinner(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'spinner') return; f.el.visible = false; this._renderPanel(f.panelKey); }
    playVideo(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'video') return; const v = this.elementDoms[a.E] && this.elementDoms[a.E].querySelector('video'); if (v) v.play().catch(()=>{}); }
    pauseVideo(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'video') return; const v = this.elementDoms[a.E] && this.elementDoms[a.E].querySelector('video'); if (v) v.pause(); }
    setRatingValue(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'rating') return; f.el.value = Number(a.V); this._renderPanel(f.panelKey); }
    getRatingValue(a) { const f = this._findElement(a.E); return f && f.el.type === 'rating' ? f.el.value : 0; }
    setHealthFilled(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'healthbar') return; f.el.filled = Math.max(0, Math.min(f.el.segments, Number(a.N))); this._renderPanel(f.panelKey); }
    getHealthFilled(a) { const f = this._findElement(a.E); return f && f.el.type === 'healthbar' ? f.el.filled : 0; }
    damageHealth(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'healthbar') return; f.el.filled = Math.max(0, f.el.filled - Number(a.N)); this._renderPanel(f.panelKey); }
    healHealth(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'healthbar') return; f.el.filled = Math.min(f.el.segments, f.el.filled + Number(a.N)); this._renderPanel(f.panelKey); }
    isHealthDead(a) { const f = this._findElement(a.E); return !!(f && f.el.type === 'healthbar' && f.el.filled === 0); }
    setHealthSegments(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'healthbar') return; f.el.segments = Math.max(1, Math.min(100, Math.round(Number(a.N) || 1))); f.el.filled = Math.min(f.el.filled, f.el.segments); this._renderPanel(f.panelKey); }
    setHealthColors(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'healthbar') return; f.el.fgColor = a.F; f.el.emptyColor = a.X; f.el.bgColor = a.T; this._renderPanel(f.panelKey); }
    setHealthArtMode(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'healthbar') return; f.el.artMode = ['image','builtIn','none'].includes(a.M) ? a.M : 'none'; this._renderPanel(f.panelKey); }
    setHealthArtPiece(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'healthbar') return; const key = { left:'leftArt', middle:'midArt', right:'rightArt' }[a.P]; if (key) f.el[key] = String(a.URL || ''); this._renderPanel(f.panelKey); }
    getJoystickX(a) { const f = this._findElement(a.E); return f && f.el.type === 'joystick' ? f.el.knobX : 0; }
    getJoystickY(a) { const f = this._findElement(a.E); return f && f.el.type === 'joystick' ? f.el.knobY : 0; }
    getJoystickAngle(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'joystick') return 0; return Math.round(Math.atan2(f.el.knobY, f.el.knobX) * 180 / Math.PI); }
    resetJoystick(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'joystick') return; f.el.knobX = 0; f.el.knobY = 0; this._renderPanel(f.panelKey); }
    getDPadDirection(a) { const f = this._findElement(a.E); return f && f.el.type === 'dpad' ? f.el.direction : 'none'; }
    resetDPad(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'dpad') return; f.el.direction = 'none'; this._renderPanel(f.panelKey); }
    setTabsActive(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'tabs') return; f.el.activeTab = Number(a.I); this._renderPanel(f.panelKey); }
    getTabsActive(a) { const f = this._findElement(a.E); return f && f.el.type === 'tabs' ? f.el.activeTab : 0; }
    setKnobValue(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'knob') return; f.el.value = Number(a.V); this._renderPanel(f.panelKey); }
    getKnobValue(a) { const f = this._findElement(a.E); return f && f.el.type === 'knob' ? f.el.value : 0; }
    nextCarouselSlide(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'carousel') return; f.el.current = (f.el.current + 1) % Math.max(1, f.el.slides.length); this._renderPanel(f.panelKey); }
    previousCarouselSlide(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'carousel') return; const length = Math.max(1, f.el.slides.length); f.el.current = (f.el.current - 1 + length) % length; this._renderPanel(f.panelKey); }
    getCarouselCurrent(a) { const f = this._findElement(a.E); return f && f.el.type === 'carousel' ? f.el.current : 0; }
    setCarouselAutoplay(a) {
      const f = this._findElement(a.E); if (!f || f.el.type !== 'carousel') return;
      f.el.autoPlay = !!a.B; f.el.interval = Number(a.MS);
      if (this._carouselTimers[a.E]) clearInterval(this._carouselTimers[a.E]);
      delete this._carouselTimers[a.E];
      if (f.el.autoPlay) {
        f.el.interval = Math.max(50, Number.isFinite(f.el.interval) ? f.el.interval : 3000);
        this._carouselTimers[a.E] = setInterval(() => this.nextCarouselSlide({ E: a.E }), f.el.interval);
      }
    }
    emitParticles(a) {
      const f = this._findElement(a.E); if (!f || f.el.type !== 'particles') return;
      const sys = this._particleAnims[a.E]; if (!sys) return;
      for (let i = 0; i < f.el.count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = f.el.speed * (0.5 + Math.random() * 0.5);
        sys.particles.push({ x: sys.canvas.width/2, y: sys.canvas.height/2, vx: Math.cos(ang)*sp, vy: Math.sin(ang)*sp, life: f.el.lifetime, maxLife: f.el.lifetime });
      }
    }
    clearParticles(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'particles') return; const sys = this._particleAnims[a.E]; if (sys) sys.particles = []; }
    canvasClear(a) { const c = this._getCanvas(a.E); if (c) c.clearRect(0, 0, c.canvas.width, c.canvas.height); }
    canvasDrawRect(a) {
      const c = this._getCanvas(a.E); if (!c) return;
      const cw = c.canvas.width, ch = c.canvas.height;
      c.fillStyle = a.C;
      c.fillRect(Number(a.X)/100*cw, Number(a.Y)/100*ch, Number(a.W)/100*cw, Number(a.H)/100*ch);
    }
    canvasDrawCircle(a) {
      const c = this._getCanvas(a.E); if (!c) return;
      const cw = c.canvas.width, ch = c.canvas.height;
      c.fillStyle = a.C; c.beginPath();
      c.arc(Number(a.X)/100*cw, Number(a.Y)/100*ch, Number(a.R)/100*Math.min(cw,ch), 0, Math.PI*2);
      c.fill();
    }
    canvasDrawLine(a) {
      const c = this._getCanvas(a.E); if (!c) return;
      const cw = c.canvas.width, ch = c.canvas.height;
      c.strokeStyle = a.C; c.lineWidth = 2; c.beginPath();
      c.moveTo(Number(a.X1)/100*cw, Number(a.Y1)/100*ch);
      c.lineTo(Number(a.X2)/100*cw, Number(a.Y2)/100*ch);
      c.stroke();
    }
    canvasDrawText(a) {
      const c = this._getCanvas(a.E); if (!c) return;
      c.fillStyle = a.C; c.font = Number(a.S) + 'px sans-serif';
      c.fillText(a.T, Number(a.X)/100*c.canvas.width, Number(a.Y)/100*c.canvas.height);
    }
    _getCanvas(elId) { const node = this.elementDoms[elId]; if (!node) return null; const cv = node.querySelector('canvas'); return cv ? cv.getContext('2d') : null; }
    showTooltip(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'tooltip') return; f.el.visible = true; this._renderPanel(f.panelKey); }
    hideTooltip(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'tooltip') return; f.el.visible = false; this._renderPanel(f.panelKey); }

    // =================== LAYOUT ===================
    setGridSize(a) { this._gridSize = Math.max(0, Number(a.N)); }
    snapElementToGrid(a) {
      const f = this._findElement(a.E); if (!f || !this._gridSize) return;
      const g = this._gridSize;
      f.el.x = Math.round(f.el.x / g) * g;
      f.el.y = Math.round(f.el.y / g) * g;
      f.el.width = Math.round(f.el.width / g) * g;
      f.el.height = Math.round(f.el.height / g) * g;
      this._renderPanel(f.panelKey);
    }
    snapAllInPanel(a) {
      const k = this._findPanelKeyByName(a.P); if (!k || !this._gridSize) return;
      const p = this.config.panels[k]; const g = this._gridSize;
      for (const id of p.elementOrder) {
        const e = p.elements[id]; if (!e) continue;
        e.x = Math.round(e.x / g) * g;
        e.y = Math.round(e.y / g) * g;
        e.width = Math.round(e.width / g) * g;
        e.height = Math.round(e.height / g) * g;
      }
      this._renderPanel(k);
    }
    alignElementInPanel(a) {
      const f = this._findElement(a.E); if (!f) return;
      const e = f.el;
      if (a.SIDE === 'left') e.x = 0;
      if (a.SIDE === 'right') e.x = 100 - e.width;
      if (a.SIDE === 'top') e.y = 0;
      if (a.SIDE === 'bottom') e.y = 100 - e.height;
      this._renderPanel(f.panelKey);
    }
    centerElementInPanel(a) {
      const f = this._findElement(a.E); if (!f) return;
      const e = f.el;
      if (a.DIR === 'horizontal' || a.DIR === 'both') e.x = (100 - e.width) / 2;
      if (a.DIR === 'vertical' || a.DIR === 'both') e.y = (100 - e.height) / 2;
      this._renderPanel(f.panelKey);
    }

    // =================== TWEENS ===================
    tweenElementX(a) { this._tweenNumber(a.E, 'x', a.X, a.T, a.EASE); }
    tweenElementY(a) { this._tweenNumber(a.E, 'y', a.Y, a.T, a.EASE); }
    tweenElementPosition(a) { this._tweenNumber(a.E, 'x', a.X, a.T, a.EASE); this._tweenNumber(a.E, 'y', a.Y, a.T, a.EASE); }
    tweenElementOpacity(a) { this._tweenNumber(a.E, 'style.opacity', a.O, a.T, a.EASE); }
    tweenElementRotation(a) { this._tweenNumber(a.E, 'rotation', a.D, a.T, a.EASE); }
    tweenElementSize(a) { this._tweenNumber(a.E, 'width', a.W, a.T, a.EASE); this._tweenNumber(a.E, 'height', a.H, a.T, a.EASE); }
    tweenElementValue(a) { this._tweenNumber(a.E, 'value', a.V, a.T, a.EASE); }
    shakeElement(a) {
      const f = this._findElement(a.E); if (!f) return;
      const el = f.el; const ox = el.x, oy = el.y; const dur = Number(a.T) * 1000; const I = Number(a.I);
      const start = performance.now();
      const tick = () => {
        const t = (performance.now() - start) / dur;
        if (t >= 1) { el.x = ox; el.y = oy; this._renderPanel(f.panelKey); return; }
        el.x = ox + (Math.random() - 0.5) * 2 * I * (1 - t);
        el.y = oy + (Math.random() - 0.5) * I * (1 - t);
        this._renderPanel(f.panelKey);
        requestAnimationFrame(tick);
      };
      tick();
    }
    pulseElement(a) {
      const f = this._findElement(a.E); if (!f) return;
      const el = f.el; const s = Number(a.S); const dur = Number(a.T) * 1000;
      const start = performance.now();
      const tick = () => {
        const t = (performance.now() - start) / dur;
        if (t >= 1) { el.scale = 1; this._renderPanel(f.panelKey); return; }
        el.scale = 1 + (s - 1) * Math.sin(t * Math.PI);
        this._renderPanel(f.panelKey);
        requestAnimationFrame(tick);
      };
      tick();
    }
    bounceElement(a) {
      const f = this._findElement(a.E); if (!f) return;
      const el = f.el; const oy = el.y; const dur = Number(a.T) * 1000;
      const start = performance.now();
      const tick = () => {
        const t = (performance.now() - start) / dur;
        if (t >= 1) { el.y = oy; this._renderPanel(f.panelKey); return; }
        el.y = oy - (1 - EASINGS.easeOutBounce(t)) * 20;
        this._renderPanel(f.panelKey);
        requestAnimationFrame(tick);
      };
      tick();
    }
    fadeInElement(a) { const f = this._findElement(a.E); if (!f) return; f.el.style.opacity = 0; f.el.hidden = false; this._tweenNumber(a.E, 'style.opacity', 1, a.T, 'easeOut'); this._renderPanel(f.panelKey); }
    fadeOutElement(a) { const f = this._findElement(a.E); if (!f) return; this._tweenNumber(a.E, 'style.opacity', 0, a.T, 'easeIn', () => { f.el.hidden = true; }); this._renderPanel(f.panelKey); }
    isElementTweening(a) { return this._tweens.some(t => t.elId === a.E); }
    stopTweensOnElement(a) { this._stopTweensOn(a.E); }
    stopAllTweens() { this._tweens = []; this._tweenPaused = false; }
    pauseAllTweens() { this._tweenPaused = true; }
    resumeAllTweens() { this._tweenPaused = false; }

    _tweenNumber(elId, prop, to, duration, easing, onComplete) {
      const f = this._findElement(elId); if (!f) return;
      const el = f.el;
      let from;
      if (prop.startsWith('style.')) from = parseFloat(el.style[prop.slice(6)]) || 0;
      else from = parseFloat(el[prop]) || 0;
      this._tweens.push({
        elId, panelKey: f.panelKey, el, prop, from, to: Number(to), isColor: false,
        startTime: performance.now(), duration: Math.max(1, Number(duration) * 1000),
        easing: easing || 'linear', onComplete
      });
    }
    _stopTweensOn(elId) { this._tweens = this._tweens.filter(t => t.elId !== elId); }
    _startRAF() {
      const tick = () => {
        if (this._tweens.length > 0 && !this._tweenPaused) {
          const now = performance.now();
          this._tweenPanelSet.clear();
          for (let i = this._tweens.length - 1; i >= 0; i--) {
            const t = this._tweens[i];
            const t01 = Math.min(1, (now - t.startTime) / t.duration);
            const eased = (EASINGS[t.easing] || EASINGS.linear)(t01);
            if (t.prop.startsWith('style.')) t.el.style[t.prop.slice(6)] = t.from + (t.to - t.from) * eased;
            else t.el[t.prop] = t.from + (t.to - t.from) * eased;
            this._tweenPanelSet.add(t.panelKey);
            if (t01 >= 1) {
              this._tweens.splice(i, 1);
              if (t.onComplete) t.onComplete();
            }
          }
          this._tweenPanelSet.forEach(k => { if (this.config.panels[k]) this._renderPanel(k); });
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }

    // =================== SOUND ===================
    setElementClickSound(a) { const f = this._findElement(a.E); if (!f) return; f.el.clickSound = a.URL; }
    setElementHoverSound(a) { const f = this._findElement(a.E); if (!f) return; f.el.hoverSound = a.URL; }
    _playAudio(url) { if (this._muted || !url) return; try { const au = new Audio(url); au.volume = this._globalVolume; au.play().catch(()=>{}); } catch(e){} }
    playSound(a) { this._playAudio(a.URL); }
    setGlobalVolume(a) { this._globalVolume = Math.max(0, Math.min(1, Number(a.V))); }
    muteAllSounds() { this._muted = true; }
    unmuteAllSounds() { this._muted = false; }

    // =================== THEME ===================
    setTheme(a) {
      const t = THEMES[a.T]; if (!t) return;
      this._currentTheme = a.T;
      const r = document.documentElement.style;
      r.setProperty('--pg-bg', t.background);
      r.setProperty('--pg-panel', t.panel);
      r.setProperty('--pg-accent', t.accent);
      r.setProperty('--pg-text', t.text);
      r.setProperty('--pg-border', t.border);
      if (this.overlay) this.overlay.style.background = t.background;
      this._renderAll();
    }
    getCurrentTheme() { return this._currentTheme; }
    setThemeColor(a) {
      const m = { background:'--pg-bg', panel:'--pg-panel', accent:'--pg-accent', text:'--pg-text', border:'--pg-border' };
      const v = m[a.ROLE]; if (!v) return;
      document.documentElement.style.setProperty(v, a.C);
      if (a.ROLE === 'background' && this.overlay) this.overlay.style.background = a.C;
      this._renderAll();
    }

    // =================== GAME SERVICES ===================
    setGameNamespace(a) { this.gameServices.setNamespace(a.N); }
    getGameNamespace() { return this.gameServices.namespace; }
    setPlayerId(a) { this.gameServices.setPlayer(a.ID); }
    getPlayerId() { return this.gameServices.playerId; }
    setStorageAdapter(a) { this.gameServices.setAdapter(a.A); }
    getStorageAdapter() { return this.gameServices._activeAdapter(); }
    isCompanionLoaded(a) { return this.gameServices.isAvailable(String(a.X || '').toLowerCase()); }
    getGameServiceStatus() { return this.gameServices.lastStatus; }
    isCloudServerUp(a) { return this.gameServices.pingServer(a.URL); }
    defineAchievement(a) { this.gameServices.defineAchievement(a.A, a.T, a.D, a.P, a.G); }
    setAchievementIcon(a) { this.gameServices.setAchievementIcon(a.A, a.I); }
    setAchievementSecret(a) { this.gameServices.setAchievementSecret(a.A, a.S); }
    unlockAchievement(a) { return this.gameServices.unlock(a.A); }
    setAchievementProgress(a) { return this.gameServices.setProgress(a.A, a.P); }
    async isAchievementUnlocked(a) { return !!(await this.gameServices.achievementState(a.A)).unlockedAt; }
    async getAchievementProgress(a) { return (await this.gameServices.achievementState(a.A)).progress || 0; }
    getAchievementPoints() { return this.gameServices.totalPoints(); }
    getAchievementDefinitions() { return JSON.stringify(Object.values(this.gameServices.achievements)); }
    async showAchievementInElement(a) {
      const f = this._findElement(a.E); const achievement = this.gameServices.getAchievement(a.A);
      if (!f || f.el.type !== 'achievement' || !achievement) return;
      const state = await this.gameServices.achievementState(a.A);
      Object.assign(f.el, achievement, { achievementId:achievement.id, progress:state.progress || 0, unlocked:!!state.unlockedAt });
      this._renderPanel(f.panelKey);
    }
    whenAchievementUnlocked() { return false; }
    submitLeaderboardScore(a) { return this.gameServices.submitScore(a.B, a.S, a.M); }
    async getLeaderboard(a) { return JSON.stringify(await this.gameServices.leaderboard(a.B)); }
    async getLeaderboardRank(a) { const rows = await this.gameServices.leaderboard(a.B); const index = rows.findIndex(row => row.player === this.gameServices.playerId); return index < 0 ? 0 : index + 1; }
    async getLeaderboardPlayer(a) { const rows = await this.gameServices.leaderboard(a.B); const row = rows[Math.max(0, Number(a.R) - 1)]; return row ? row.player : ''; }
    async getLeaderboardScore(a) { const rows = await this.gameServices.leaderboard(a.B); const row = rows[Math.max(0, Number(a.R) - 1)]; return row ? Number(row.score) || 0 : 0; }
    async refreshLeaderboardElement(a) { const f = this._findElement(a.E); if (!f || f.el.type !== 'leaderboard') return; f.el.boardId = String(a.B || 'main'); f.el.entries = await this.gameServices.leaderboard(a.B); f.el.highlightPlayer = this.gameServices.playerId; this._renderPanel(f.panelKey); }
    whenLeaderboardUpdated() { return false; }

    // =================== EVENTS ===================
    whenButtonClicked() { return false; }
    whenElementChanged() { return false; }
    whenElementHovered() { return false; }
    whenElementDragged() { return false; }
    whenElementDragEnd() { return false; }
    whenElementRightClicked() { return false; }
    whenElementDoubleClicked() { return false; }
    isMouseOverElement(a) { const n = this.elementDoms[a.E]; return !!(n && n.matches(':hover')); }
    isMouseOverPanel(a) { const k = this._findPanelKeyByName(a.P); if (!k) return false; const n = this.panelDoms[k]; return !!(n && n.matches(':hover')); }
    getMouseX(a) { const k = this._findPanelKeyByName(a.P); const node = k && this.panelDoms[k]; if (!node) return 0; const r = node.getBoundingClientRect(); return r.width ? ((this._lastMouseX - r.left) / r.width) * 100 : 0; }
    getMouseY(a) { const k = this._findPanelKeyByName(a.P); const node = k && this.panelDoms[k]; if (!node) return 0; const r = node.getBoundingClientRect(); return r.height ? ((this._lastMouseY - r.top) / r.height) * 100 : 0; }

    // =================== SAVE / LOAD ===================
    saveGUI() { saveConfigToStorage(this.config); }
    loadGUI() { this._replaceConfig(loadConfigFromStorage()); }
    exportGUI() { return JSON.stringify(this.config); }
    importGUI(a) { try { this._replaceConfig(JSON.parse(a.D)); saveConfigToStorage(this.config); } catch(e){} }
    saveGUIAs(a) { saveConfigToStorage(this.config, SLOT_PREFIX + a.S); }
    loadGUIFrom(a) { try { const raw = localStorage.getItem(SLOT_PREFIX + a.S) || localStorage.getItem(LEGACY_SLOT_PREFIX + a.S); if (raw) this._replaceConfig(JSON.parse(raw)); } catch(e){} }
    listSavedSlots() { const s = new Set(); for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf(SLOT_PREFIX) === 0) s.add(k.slice(SLOT_PREFIX.length)); else if (k && k.indexOf(LEGACY_SLOT_PREFIX) === 0) s.add(k.slice(LEGACY_SLOT_PREFIX.length)); } return [...s].join(', '); }
    deleteSavedSlot(a) { localStorage.removeItem(SLOT_PREFIX + a.S); localStorage.removeItem(LEGACY_SLOT_PREFIX + a.S); }

    _stopDynamicResources(elId) {
      if (elId) {
        if (this._carouselTimers[elId]) clearInterval(this._carouselTimers[elId]);
        delete this._carouselTimers[elId];
        delete this._particleAnims[elId];
        return;
      }
      Object.values(this._carouselTimers).forEach(clearInterval);
      this._carouselTimers = {};
      this._particleAnims = {};
    }

    _replaceConfig(config) {
      this._stopDynamicResources();
      this.config = normalizeConfig(config);
      this._tweens = [];
      this._pinnedElements = {};
      this._followMap = {};
      this._renderAll();
    }

    _normalizeConfig(config) { return normalizeConfig(config); }

    openEditor() {
      if (this._editorWindow && !this._editorWindow.closed) { this._editorWindow.focus(); return; }
      const win = window.open('', 'SuperGUIEditor', 'width=1360,height=880,resizable=yes');
      if (!win) { alert('SuperGUI: popup blocked.'); return; }
      win.document.open();
      win.document.write(SUPERGUI_EDITOR_HTML);
      win.document.close();
      this._editorWindow = win;
    }

    // =================== OVERLAY / RENDERING ===================
    _buildOverlay() {
      const o = document.createElement('div');
      o.id = 'supergui-overlay';
      // Keep the GUI on the same 480x360 coordinate system as the Scratch stage.
      // Scaling the whole layer (instead of merely resizing it) also scales fonts,
      // borders and spacing, so fullscreen is an exact, sharper enlargement.
      o.style.cssText = 'position:absolute;top:0;left:0;width:480px;height:360px;transform-origin:top left;pointer-events:none;overflow:hidden;z-index:1000;';
      document.body.appendChild(o);
      this.overlay = o;
    }
    _syncOverlayPosition() {
      const c = this.runtime.renderer && this.runtime.renderer.canvas;
      if (!c || !this.overlay) return;
      const r = c.getBoundingClientRect();
      this.overlay.style.left = (r.left + window.scrollX) + 'px';
      this.overlay.style.top = (r.top + window.scrollY) + 'px';
      this.overlay.style.transform = 'scale(' + (r.width / 480) + ',' + (r.height / 360) + ')';
    }
    _renderAll() { this.overlay.innerHTML = ''; this.panelDoms = {}; this.elementDoms = {}; for (const k of this.config.panelOrder) this._renderPanel(k); }
    _stagePixelSize() { const r = this.overlay.getBoundingClientRect(); return { w: r.width, h: r.height }; }

    _renderPanel(key) {
      const panel = this.config.panels[key];
      if (!panel) return;
      let outer = this.panelDoms[key];
      if (!outer) {
        outer = document.createElement('div');
        outer.className = 'supergui-panel';
        outer.style.cssText = 'position:absolute;box-sizing:border-box;font-family:sans-serif;pointer-events:auto;display:flex;flex-direction:column;overflow:hidden;';
        this.overlay.appendChild(outer);
        this.panelDoms[key] = outer;
      }
      const s = panel.style || defaultPanelStyle();
      outer.style.left = panel.x + '%';
      outer.style.top = panel.y + '%';
      outer.style.width = panel.width + '%';
      outer.style.height = (panel.minimized ? Math.min(panel.height, 6) : panel.height) + '%';
      outer.style.background = panel.backgroundImage ? `url("${panel.backgroundImage}") center/cover no-repeat, ${s.background}` : s.background;
      outer.style.border = s.borderWidth + 'px solid ' + s.borderColor;
      outer.style.borderRadius = s.borderRadius + 'px';
      outer.style.opacity = s.opacity;
      outer.style.display = panel.visible ? 'flex' : 'none';
      outer.style.zIndex = String(panel.zIndex || 1);
      outer.innerHTML = '';

      if (panel.titleBar) {
        const bar = document.createElement('div');
        bar.style.cssText = 'display:flex;align-items:center;gap:6px;padding:3px 6px;background:rgba(0,0,0,0.25);cursor:' + (panel.draggable ? 'move' : 'default') + ';flex:0 0 auto;';
        const title = document.createElement('div');
        title.textContent = panel.name;
        title.style.cssText = 'flex:1;font-size:12px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
        bar.appendChild(title);
        const btnStyle = b => { b.style.cssText = 'width:18px;height:18px;font-size:11px;line-height:1;border:none;border-radius:3px;cursor:pointer;color:#fff;'; };
        const minBtn = document.createElement('button');
        minBtn.textContent = panel.minimized ? '▢' : '_';
        btnStyle(minBtn); minBtn.style.background = '#5B6EE1';
        minBtn.addEventListener('click', e => { e.stopPropagation(); panel.minimized = !panel.minimized; this._renderPanel(key); });
        bar.appendChild(minBtn);
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        btnStyle(closeBtn); closeBtn.style.background = '#e15b6e';
        closeBtn.addEventListener('click', e => { e.stopPropagation(); this.closePanel({ P: panel.name }); });
        bar.appendChild(closeBtn);
        if (panel.draggable) bar.addEventListener('mousedown', ev => this._startPanelDrag(ev, key));
        outer.appendChild(bar);
      }

      const body = document.createElement('div');
      body.style.cssText = 'position:relative;flex:1;padding:' + s.padding + 'px;box-sizing:border-box;display:' + (panel.minimized ? 'none' : 'block') + ';';
      if (panel.draggable && !panel.titleBar) {
        body.style.cursor = 'move';
        body.addEventListener('mousedown', ev => { if (ev.target === body) this._startPanelDrag(ev, key); });
      }
      outer.appendChild(body);

      const sorted = panel.elementOrder.filter(id => panel.elements[id]).slice().sort((a, b) => (panel.elements[a].zIndex || 1) - (panel.elements[b].zIndex || 1));
      for (const elId of sorted) {
        const el = panel.elements[elId];
        if (!el || el.hidden) continue;
        const node = this._createElementDom(key, elId, el);
        body.appendChild(node);
        this.elementDoms[elId] = node;
      }
    }

    _startPanelDrag(e, key) {
      e.preventDefault();
      const panel = this.config.panels[key];
      const size = this._stagePixelSize();
      const sx = e.clientX, sy = e.clientY, ox = panel.x, oy = panel.y;
      const onMove = ev => {
        const dx = (ev.clientX - sx) / size.w * 100;
        const dy = (ev.clientY - sy) / size.h * 100;
        panel.x = Math.max(0, Math.min(100 - panel.width, ox + dx));
        panel.y = Math.max(0, Math.min(100 - panel.height, oy + dy));
        this._renderPanel(key);
      };
      const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    }

    // Returns an SVG data URL for the default GD-style art.
    // color: hex like '#5B6EE1'. kind: 'left' | 'right' | 'mid'.
    _artSVG(kind, color) {
      const w = kind === 'mid' ? 16 : 16, h = 16;
      let path = '';
      if (kind === 'left') path = 'M16 0 L0 0 L4 8 L0 16 L16 16 Z';
      else if (kind === 'right') path = 'M0 0 L16 0 L12 8 L16 16 L0 16 Z';
      else path = 'M0 0 L16 0 L12 8 L16 16 L0 16 L4 8 Z';
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%">' +
        '<path d="' + path + '" fill="' + color + '" stroke="#000" stroke-width="1"/>' +
        '<path d="' + path + '" fill="none" stroke="#fff" stroke-width="0.5" opacity="0.4"/>' +
        '</svg>'
      );
    }

    _createElementDom(panelKey, elId, el) {
      const wrap = document.createElement('div');
      wrap.dataset.elId = elId;
      wrap.style.position = 'absolute';
      wrap.style.left = el.x + '%';
      wrap.style.top = el.y + '%';
      wrap.style.width = el.width + '%';
      wrap.style.height = el.height + '%';
      wrap.style.boxSizing = 'border-box';
      wrap.style.zIndex = String(el.zIndex || 1);
      wrap.style.overflow = 'hidden';
      let transform = '';
      if (el.rotation) transform += 'rotate(' + el.rotation + 'deg) ';
      if (el.scale && el.scale !== 1) transform += 'scale(' + el.scale + ') ';
      if (transform) wrap.style.transform = transform;
      if (el.cursor) wrap.style.cursor = el.cursor;
      if (el.disabled) wrap.style.opacity = 0.5;

      if (el.skin && el.skin.url) {
        const skinWidth = Math.max(0, Number(el.skin.width) || 0);
        const skinSlice = Math.max(0, Number(el.skin.slice) || 0);
        wrap.style.border = skinWidth + 'px solid transparent';
        wrap.style.borderImageSource = 'url("' + el.skin.url + '")';
        wrap.style.borderImageSlice = skinSlice + ' fill';
        wrap.style.borderImageWidth = String(skinWidth);
        wrap.style.borderImageRepeat = el.skin.repeat || 'stretch';
      }

      const s = el.style || defaultElementStyle();
      const applyCommon = node => {
        node.style.width = '100%';
        node.style.height = '100%';
        node.style.boxSizing = 'border-box';
        node.style.color = s.color;
        node.style.fontSize = s.fontSize + 'px';
        node.style.fontWeight = s.fontWeight;
        node.style.textAlign = s.textAlign;
        node.style.opacity = s.opacity;
        node.style.padding = s.padding + 'px';
      };

      const fire = name => this.runtime.startHats(EXT_ID + '_' + name, { E: elId });
      const fireChanged = () => fire('whenElementChanged');
      const fireHover = () => { this._playAudio(el.hoverSound); fire('whenElementHovered'); };
      const fireDown = () => fire('whenElementMouseDown');
      const fireUp = () => fire('whenElementMouseUp');
      const fireRight = () => fire('whenElementRightClicked');
      const fireDouble = () => fire('whenElementDoubleClicked');
      const fireClick = () => {
        if (el.disabled) return;
        if (this._justDragged.has(elId)) return;
        this._playAudio(el.clickSound);
        this.runtime.startHats(EXT_ID + '_whenButtonClicked', { E: elId });
      };

      wrap.addEventListener('mouseenter', fireHover);
      wrap.addEventListener('mousedown', fireDown);
      wrap.addEventListener('mouseup', fireUp);
      wrap.addEventListener('contextmenu', e => { e.preventDefault(); fireRight(); });
      wrap.addEventListener('dblclick', fireDouble);

      switch (el.type) {
        case 'label': {
          const n = document.createElement('div');
          applyCommon(n); n.style.display = 'flex'; n.style.alignItems = 'center';
          n.textContent = el.text;
          wrap.appendChild(n); break;
        }
        case 'button': {
          const n = document.createElement('button');
          applyCommon(n);
          n.style.background = el.disabled && el.disabledBg ? el.disabledBg : s.background;
          n.style.border = s.borderWidth + 'px solid ' + s.borderColor;
          n.style.borderRadius = s.borderRadius + 'px';
          n.style.cursor = 'pointer';
          n.textContent = el.text;
          n.addEventListener('click', fireClick);
          wrap.appendChild(n); break;
        }
        case 'slider': {
          const n = document.createElement('input');
          n.type = 'range'; n.min = el.min; n.max = el.max; n.step = el.step; n.value = el.value;
          n.style.cssText = 'width:100%;height:100%;';
          n.addEventListener('input', () => { el.value = Number(n.value); fireChanged(); });
          wrap.appendChild(n); break;
        }
        case 'checkbox': {
          const lbl = document.createElement('label');
          applyCommon(lbl); lbl.style.cssText += 'display:flex;align-items:center;gap:6px;cursor:pointer;width:100%;height:100%;';
          const n = document.createElement('input'); n.type = 'checkbox'; n.checked = !!el.checked;
          n.addEventListener('change', () => { el.checked = n.checked; fireChanged(); });
          lbl.appendChild(n);
          const sp = document.createElement('span'); sp.textContent = el.text; lbl.appendChild(sp);
          wrap.appendChild(lbl); break;
        }
        case 'dropdown': {
          const n = document.createElement('select');
          applyCommon(n);
          n.style.background = s.background;
          n.style.border = s.borderWidth + 'px solid ' + s.borderColor;
          n.style.borderRadius = s.borderRadius + 'px';
          (el.options || []).forEach(o => { const opt = document.createElement('option'); opt.value = o; opt.textContent = o; if (o === el.selected) opt.selected = true; n.appendChild(opt); });
          n.addEventListener('change', () => { el.selected = n.value; fireChanged(); });
          wrap.appendChild(n); break;
        }
        case 'textinput': {
          const n = document.createElement('input');
          n.type = 'text'; n.placeholder = el.placeholder || ''; n.value = el.value || '';
          applyCommon(n);
          n.style.background = s.background;
          n.style.border = s.borderWidth + 'px solid ' + s.borderColor;
          n.style.borderRadius = s.borderRadius + 'px';
          n.addEventListener('input', () => { el.value = n.value; fireChanged(); });
          wrap.appendChild(n); break;
        }
        case 'numberinput': {
          const n = document.createElement('input');
          n.type = 'number'; n.min = el.min; n.max = el.max; n.step = el.step; n.value = el.value;
          applyCommon(n);
          n.style.background = s.background;
          n.style.border = s.borderWidth + 'px solid ' + s.borderColor;
          n.style.borderRadius = s.borderRadius + 'px';
          n.addEventListener('input', () => { el.value = Number(n.value); fireChanged(); });
          wrap.appendChild(n); break;
        }
        case 'image': {
          const n = document.createElement('div');
          n.style.cssText = 'width:100%;height:100%;';
          n.style.backgroundImage = el.src ? 'url("' + el.src + '")' : 'none';
          n.style.backgroundSize = '100% 100%';
          n.style.backgroundRepeat = 'no-repeat';
          n.style.opacity = s.opacity;
          const fx = el.flipH ? -1 : 1, fy = el.flipV ? -1 : 1;
          if (fx !== 1 || fy !== 1) n.style.transform = 'scale(' + fx + ',' + fy + ')';
          if (el.tint && el.tint !== '#ffffff') { n.style.backgroundColor = el.tint; n.style.backgroundBlendMode = 'multiply'; }
          if (!el.src) { n.style.cssText += 'background:#3a3f52;border:1px dashed ' + s.borderColor + ';display:flex;align-items:center;justify-content:center;color:' + s.color + ';font-size:10px;'; n.textContent = 'image'; }
          wrap.appendChild(n); break;
        }
        case 'background': {
          const n = document.createElement('div');
          let bg = el.color;
          if (el.src) {
            const sizeMap = { cover:'cover', contain:'contain', stretch:'100% 100%', tile:'auto' };
            const bgSize = sizeMap[el.sizeMode] || 'cover';
            const repeat = el.sizeMode === 'tile' ? 'repeat' : 'no-repeat';
            bg = 'url("' + el.src + '") ' + (el.position || 'center') + '/' + bgSize + ' ' + repeat + ', ' + el.color;
          }
          n.style.cssText = 'width:100%;height:100%;background:' + bg + ';filter:blur(' + (el.blur || 0) + 'px);';
          wrap.appendChild(n); break;
        }
        case 'progressbar': {
          const n = document.createElement('div');
          n.style.cssText = 'width:100%;height:100%;background:' + el.trackColor + ';border-radius:3px;overflow:hidden;position:relative;';
          const bar = document.createElement('div');
          const pct = Math.max(0, Math.min(100, ((el.value - el.min) / Math.max(0.0001, el.max - el.min)) * 100));
          bar.style.cssText = 'height:100%;width:' + pct + '%;background:' + el.barColor + ';transition:width 0.2s;';
          n.appendChild(bar);
          wrap.appendChild(n); break;
        }
        case 'switch': {
          const track = document.createElement('div');
          track.style.cssText = 'width:100%;height:100%;background:' + (el.on ? el.onColor : el.offColor) + ';border-radius:999px;position:relative;cursor:pointer;transition:background 0.2s;';
          const knob = document.createElement('div');
          const ks = 30;
          knob.style.cssText = 'position:absolute;top:10%;width:' + ks + '%;height:80%;background:#fff;border-radius:50%;transition:left 0.2s;';
          knob.style.left = el.on ? 'calc(100% - ' + ks + '% - 5%)' : '5%';
          track.appendChild(knob);
          track.addEventListener('click', () => { if (el.disabled) return; el.on = !el.on; this._renderPanel(panelKey); this.runtime.startHats(EXT_ID + '_whenSwitchToggled', { E: elId }); });
          wrap.appendChild(track); break;
        }
        case 'radio': {
          const n = document.createElement('div');
          n.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:' + (el.orientation === 'horizontal' ? 'row' : 'column') + ';gap:4px;overflow:auto;color:' + s.color + ';font-size:' + s.fontSize + 'px;';
          (el.options || []).forEach(o => {
            const lbl = document.createElement('label');
            lbl.style.cssText = 'display:flex;align-items:center;gap:4px;cursor:pointer;';
            const r = document.createElement('input'); r.type = 'radio'; r.name = 'pg_r_' + elId; r.value = o;
            if (o === el.selected) r.checked = true;
            r.addEventListener('change', () => { el.selected = o; fireChanged(); });
            lbl.appendChild(r);
            const sp = document.createElement('span'); sp.textContent = o; lbl.appendChild(sp);
            n.appendChild(lbl);
          });
          wrap.appendChild(n); break;
        }
        case 'colorpicker': {
          const n = document.createElement('input');
          n.type = 'color'; n.value = el.value;
          n.style.cssText = 'width:100%;height:100%;border:none;background:transparent;padding:0;';
          n.addEventListener('input', () => { el.value = n.value; fireChanged(); });
          wrap.appendChild(n); break;
        }
        case 'selector': {
          const n = document.createElement('div');
          n.style.cssText = 'width:100%;height:100%;display:grid;grid-template-columns:repeat(' + el.cols + ',1fr);gap:' + (el.cellGap || 4) + 'px;overflow:auto;';
          for (let i = 0; i < (el.cells || []).length; i++) {
            const cell = el.cells[i];
            const c = document.createElement('div');
            c.style.cssText = 'background:' + (cell.color || '#3a3f52') + ';border:2px solid ' + (i === el.selectedIndex ? '#5B6EE1' : 'transparent') + ';display:flex;align-items:center;justify-content:center;cursor:pointer;border-radius:4px;color:#fff;font-size:9px;background-size:cover;background-position:center;';
            if (cell.image) c.style.backgroundImage = 'url("' + cell.image + '")';
            if (cell.label) c.textContent = cell.label;
            c.addEventListener('click', () => { if (el.disabled) return; el.selectedIndex = i; this._renderPanel(panelKey); this.runtime.startHats(EXT_ID + '_whenSelectorCellClicked', { E: elId }); });
            n.appendChild(c);
          }
          wrap.appendChild(n); break;
        }
        case 'search': {
          const n = document.createElement('div');
          n.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;gap:2px;';
          const inp = document.createElement('input');
          inp.type = 'text'; inp.placeholder = el.placeholder || ''; inp.value = el.value || '';
          inp.style.cssText = 'width:100%;padding:2px 4px;background:' + s.background + ';border:1px solid ' + s.borderColor + ';color:' + s.color + ';border-radius:3px;box-sizing:border-box;';
          inp.addEventListener('input', () => { el.value = inp.value; fireChanged(); });
          n.appendChild(inp);
          if ((el.results || []).length) {
            const list = document.createElement('div');
            list.style.cssText = 'flex:1;overflow:auto;background:rgba(0,0,0,0.2);border-radius:3px;';
            el.results.forEach(r => {
              const it = document.createElement('div');
              it.style.cssText = 'padding:2px 4px;font-size:11px;color:' + s.color + ';cursor:pointer;';
              it.textContent = r;
              it.addEventListener('click', () => { inp.value = r; el.value = r; fireChanged(); });
              list.appendChild(it);
            });
            n.appendChild(list);
          }
          wrap.appendChild(n); break;
        }
        case 'imagebutton': {
          const n = document.createElement('div');
          n.style.cssText = 'width:100%;height:100%;background-size:100% 100%;background-repeat:no-repeat;background-position:center;cursor:pointer;';
          const setImg = url => { n.style.backgroundImage = url ? 'url("' + url + '")' : 'none'; };
          setImg(el.image);
          if (!el.image) { n.style.cssText += 'background:#3a3f52;display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;border:1px dashed #5B6EE1;'; n.textContent = 'image'; }
          n.addEventListener('mouseenter', () => { if (el.hoverImage) setImg(el.hoverImage); });
          n.addEventListener('mouseleave', () => { setImg(el.image); n.style.transform = 'scale(1)'; });
          n.addEventListener('mousedown', () => { if (el.pressedImage) setImg(el.pressedImage); if (el.scaleOnPress) n.style.transform = 'scale(' + el.scaleOnPress + ')'; });
          n.addEventListener('mouseup', () => { if (el.hoverImage) setImg(el.hoverImage); else setImg(el.image); n.style.transform = 'scale(1)'; });
          n.addEventListener('click', fireClick);
          wrap.appendChild(n); break;
        }
        case 'counter': {
          const n = document.createElement('div');
          applyCommon(n); n.style.display = 'flex'; n.style.alignItems = 'center'; n.style.justifyContent = 'center';
          let v = el.value;
          if (el.format === 'percent') v = Math.round(v) + '%';
          else if (el.format === 'currency') v = '$' + v.toFixed(el.decimals);
          else v = v.toFixed(el.decimals);
          n.textContent = (el.prefix || '') + v + (el.suffix || '');
          wrap.appendChild(n); break;
        }
        case 'badge': {
          if (!el.visible) break;
          const n = document.createElement('div');
          n.style.cssText = 'width:100%;height:100%;background:' + el.color + ';color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;';
          n.textContent = el.count > el.max ? el.max + '+' : el.count;
          wrap.appendChild(n); break;
        }
        case 'spinner': {
          if (!el.visible) break;
          const n = document.createElement('div');
          n.style.cssText = 'width:' + el.size + 'px;height:' + el.size + 'px;border:3px solid ' + el.color + '33;border-top-color:' + el.color + ';border-radius:50%;animation:supergui-spin ' + (1 / Math.max(0.01, Number(el.speed) || 1)) + 's linear infinite;';
          wrap.appendChild(n); break;
        }
        case 'divider': {
          const n = document.createElement('div');
          n.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;';
          const line = document.createElement('div');
          if (el.orientation === 'horizontal') line.style.cssText = 'width:100%;height:' + el.thickness + 'px;background:' + el.color + ';';
          else line.style.cssText = 'height:100%;width:' + el.thickness + 'px;background:' + el.color + ';';
          n.appendChild(line); wrap.appendChild(n); break;
        }
        case 'video': {
          const n = document.createElement('video');
          n.style.cssText = 'width:100%;height:100%;object-fit:contain;background:#000;';
          if (el.src) n.src = el.src;
          n.autoplay = !!el.autoplay; n.loop = !!el.loop; n.muted = !!el.muted; n.controls = !!el.controls; n.volume = el.volume;
          wrap.appendChild(n); break;
        }
        case 'rating': {
          const n = document.createElement('div');
          n.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;gap:2px;cursor:pointer;color:' + el.color + ';font-size:' + s.fontSize + 'px;';
          for (let i = 1; i <= el.max; i++) {
            const star = document.createElement('span');
            star.textContent = el.icon;
            star.style.opacity = i <= el.value ? '1' : '0.25';
            star.addEventListener('click', () => { if (el.disabled) return; el.value = i; this._renderPanel(panelKey); });
            n.appendChild(star);
          }
          wrap.appendChild(n); break;
        }
        case 'healthbar': {
          // Custom art health bar: 3 pieces (left, mid, right).
          // artMode: 'image' (use leftArt/midArt/rightArt URLs) or 'builtIn' (auto SVG art).
          const n = document.createElement('div');
          n.style.cssText = 'width:100%;height:100%;position:relative;overflow:hidden;';
          const segW = 100 / el.segments;
          for (let i = 0; i < el.segments; i++) {
            const seg = document.createElement('div');
            seg.style.cssText = 'position:absolute;top:0;left:' + (i*segW) + '%;width:' + segW + '%;height:100%;';
            const isFilled = i < el.filled;
            const fillColor = isFilled ? el.fgColor : el.emptyColor;
            let leftSrc, midSrc, rightSrc;
            if (el.artMode === 'builtIn') {
              leftSrc = this._artSVG('left', isFilled ? fillColor : el.bgColor);
              midSrc  = this._artSVG('mid',  isFilled ? fillColor : el.bgColor);
              rightSrc= this._artSVG('right',isFilled ? fillColor : el.bgColor);
            } else {
              leftSrc = el.leftArt || '';
              midSrc  = el.midArt  || '';
              rightSrc= el.rightArt|| '';
            }
            if (leftSrc) {
              const l = document.createElement('div');
              l.style.cssText = 'position:absolute;left:0;top:0;width:30%;height:100%;background-image:url("' + leftSrc + '");background-size:100% 100%;';
              seg.appendChild(l);
            }
            if (midSrc) {
              const m = document.createElement('div');
              m.style.cssText = 'position:absolute;left:30%;top:0;width:40%;height:100%;background-image:url("' + midSrc + '");background-size:100% 100%;';
              seg.appendChild(m);
            }
            if (rightSrc) {
              const r = document.createElement('div');
              r.style.cssText = 'position:absolute;right:0;top:0;width:30%;height:100%;background-image:url("' + rightSrc + '");background-size:100% 100%;';
              seg.appendChild(r);
            }
            if (!leftSrc && !midSrc && !rightSrc) {
              seg.style.background = fillColor;
            }
            n.appendChild(seg);
          }
          wrap.appendChild(n); break;
        }
        case 'joystick': {
          const n = document.createElement('div');
          n.style.cssText = 'width:100%;height:100%;border-radius:50%;background:' + el.baseColor + ';position:relative;cursor:grab;';
          const knob = document.createElement('div');
          knob.style.cssText = 'position:absolute;width:40%;height:40%;left:30%;top:30%;background:' + el.knobColor + ';border-radius:50%;';
          n.appendChild(knob);
          const update = (cx, cy) => {
            const r = n.getBoundingClientRect();
            const ccx = r.left + r.width/2, ccy = r.top + r.height/2;
            let dx = (cx - ccx) / (r.width/2);
            let dy = (cy - ccy) / (r.height/2);
            const m = Math.hypot(dx, dy);
            if (m > 1) { dx /= m; dy /= m; }
            el.knobX = dx; el.knobY = dy;
            knob.style.left = (30 + dx*30) + '%'; knob.style.top = (30 + dy*30) + '%';
            fireChanged();
          };
          n.addEventListener('pointerdown', e => { if (el.disabled) return; n.setPointerCapture(e.pointerId); e.preventDefault(); update(e.clientX, e.clientY); });
          n.addEventListener('pointermove', e => { if (n.hasPointerCapture(e.pointerId)) update(e.clientX, e.clientY); });
          const release = e => {
            if (!n.hasPointerCapture(e.pointerId)) return;
            n.releasePointerCapture(e.pointerId);
            el.knobX = 0; el.knobY = 0;
            knob.style.left = '30%'; knob.style.top = '30%';
            fireChanged();
          };
          n.addEventListener('pointerup', release);
          n.addEventListener('pointercancel', release);
          wrap.appendChild(n); break;
        }
        case 'dpad': {
          const n = document.createElement('div');
          const sz = el.size;
          n.style.cssText = 'width:' + sz + 'px;height:' + sz + 'px;position:relative;display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:1fr 1fr 1fr;gap:2px;';
          const dirs = [['none','·',0,0],['up','▲',0,1],['none','·',0,2],['left','◀',1,0],['none','·',1,1],['right','▶',1,2],['none','·',2,0],['down','▼',2,1],['none','·',2,2]];
          dirs.forEach(([dir, glyph, r, c]) => {
            const btn = document.createElement('div');
            btn.textContent = glyph;
            btn.style.cssText = 'background:' + el.color + ';color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;border-radius:3px;font-size:14px;user-select:none;';
            if (dir !== 'none') {
              btn.addEventListener('mousedown', () => { if (el.disabled) return; el.direction = dir; fireChanged(); });
              btn.addEventListener('mouseup', () => { el.direction = 'none'; });
            }
            n.appendChild(btn);
          });
          wrap.appendChild(n); break;
        }
        case 'tabs': {
          const n = document.createElement('div');
          n.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;';
          const bar = document.createElement('div');
          bar.style.cssText = 'display:flex;gap:2px;border-bottom:1px solid ' + s.borderColor + ';flex:0 0 auto;';
          (el.tabs || []).forEach((name, i) => {
            const tab = document.createElement('div');
            tab.textContent = name;
            tab.style.cssText = 'padding:3px 8px;cursor:pointer;background:' + (i === el.activeTab ? s.background : 'transparent') + ';color:' + s.color + ';border-radius:3px 3px 0 0;font-size:' + s.fontSize + 'px;';
            tab.addEventListener('click', () => { if (el.disabled) return; el.activeTab = i; this._renderPanel(panelKey); fireChanged(); });
            bar.appendChild(tab);
          });
          n.appendChild(bar);
          const content = document.createElement('div');
          content.style.cssText = 'flex:1;padding:4px;color:' + s.color + ';font-size:' + s.fontSize + 'px;';
          content.textContent = 'Tab: ' + (el.tabs[el.activeTab] || '');
          n.appendChild(content);
          wrap.appendChild(n); break;
        }
        case 'accordion': {
          const n = document.createElement('div');
          n.style.cssText = 'width:100%;height:100%;overflow:auto;display:flex;flex-direction:column;gap:2px;';
          (el.items || []).forEach((item, idx) => {
            const w2 = document.createElement('div');
            w2.style.cssText = 'background:' + s.background + ';border-radius:3px;overflow:hidden;';
            const title = document.createElement('div');
            title.textContent = (item.open ? '▼ ' : '▶ ') + item.title;
            title.style.cssText = 'padding:4px 6px;cursor:pointer;font-weight:bold;color:' + s.color + ';background:' + s.borderColor + ';';
            title.addEventListener('click', () => {
              if (el.disabled) return;
              if (!el.multiOpen) (el.items || []).forEach(it => it.open = false);
              item.open = !item.open;
              this._renderPanel(panelKey);
            });
            w2.appendChild(title);
            if (item.open) {
              const c = document.createElement('div');
              c.style.cssText = 'padding:6px;color:' + s.color + ';font-size:' + s.fontSize + 'px;';
              c.textContent = item.content;
              w2.appendChild(c);
            }
            n.appendChild(w2);
          });
          wrap.appendChild(n); break;
        }
        case 'knob': {
          const n = document.createElement('div');
          n.style.cssText = 'width:100%;height:100%;border-radius:50%;background:radial-gradient(circle,' + el.color + ' 0%,' + el.color + '55 70%);position:relative;cursor:grab;';
          const ind = document.createElement('div');
          ind.style.cssText = 'position:absolute;left:50%;top:10%;width:2px;height:40%;background:#fff;transform-origin:50% 100%;border-radius:1px;';
          const pct = (el.value - el.min) / Math.max(0.0001, el.max - el.min);
          ind.style.transform = 'translateX(-50%) rotate(' + (-135 + pct*270) + 'deg)';
          n.appendChild(ind);
          const update = (cx, cy) => {
            const r = n.getBoundingClientRect();
            const ccx = r.left + r.width/2, ccy = r.top + r.height/2;
            let ang = Math.atan2(cy - ccy, cx - ccx) * 180/Math.PI + 90;
            if (ang < 0) ang += 360;
            const clamped = Math.max(-90, Math.min(270, ang));
            const t01 = (clamped + 90) / 270;
            el.value = el.min + t01 * (el.max - el.min);
            ind.style.transform = 'translateX(-50%) rotate(' + (clamped - 180) + 'deg)';
            fireChanged();
          };
          n.addEventListener('pointerdown', e => { if (el.disabled) return; n.setPointerCapture(e.pointerId); update(e.clientX, e.clientY); e.preventDefault(); });
          n.addEventListener('pointermove', e => { if (n.hasPointerCapture(e.pointerId)) update(e.clientX, e.clientY); });
          const release = e => { if (n.hasPointerCapture(e.pointerId)) n.releasePointerCapture(e.pointerId); };
          n.addEventListener('pointerup', release);
          n.addEventListener('pointercancel', release);
          wrap.appendChild(n); break;
        }
        case 'carousel': {
          const n = document.createElement('div');
          n.style.cssText = 'width:100%;height:100%;position:relative;background:#000;overflow:hidden;';
          const slide = (el.slides || [])[el.current] || { image:'', text:'' };
          const img = document.createElement('div');
          img.style.cssText = 'width:100%;height:100%;background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;color:#fff;';
          if (slide.image) img.style.backgroundImage = 'url("' + slide.image + '")';
          if (slide.text && !slide.image) img.textContent = slide.text;
          n.appendChild(img);
          const prev = document.createElement('div');
          prev.textContent = '‹'; prev.style.cssText = 'position:absolute;left:4px;top:50%;transform:translateY(-50%);color:#fff;background:rgba(0,0,0,0.4);padding:4px 8px;cursor:pointer;border-radius:3px;font-size:18px;';
          prev.addEventListener('click', () => this.previousCarouselSlide({ E: elId }));
          const next = document.createElement('div');
          next.textContent = '›'; next.style.cssText = 'position:absolute;right:4px;top:50%;transform:translateY(-50%);color:#fff;background:rgba(0,0,0,0.4);padding:4px 8px;cursor:pointer;border-radius:3px;font-size:18px;';
          next.addEventListener('click', () => this.nextCarouselSlide({ E: elId }));
          n.appendChild(prev); n.appendChild(next);
          wrap.appendChild(n); break;
        }
        case 'code': {
          const n = document.createElement('pre');
          const themes = { dark:{bg:'#1b1e29',color:'#e7e9f2'}, light:{bg:'#fff',color:'#1b1e29'}, monokai:{bg:'#272822',color:'#f8f8f2'} };
          const th = themes[el.theme] || themes.dark;
          n.style.cssText = 'width:100%;height:100%;margin:0;padding:6px;background:' + th.bg + ';color:' + th.color + ';font-family:monospace;font-size:11px;overflow:auto;white-space:pre-wrap;border-radius:3px;';
          n.textContent = el.code;
          wrap.appendChild(n); break;
        }
        case 'particles': {
          const n = document.createElement('canvas');
          n.style.cssText = 'width:100%;height:100%;';
          wrap.appendChild(n);
          const ctx = n.getContext('2d');
          const sys = { particles: [], canvas: n, ctx };
          this._particleAnims[elId] = sys;
          const tick = () => {
            if (!this._particleAnims[elId] || this._particleAnims[elId] !== sys) return;
            const cw = n.width = n.clientWidth, ch = n.height = n.clientHeight;
            ctx.clearRect(0, 0, cw, ch);
            for (let i = sys.particles.length - 1; i >= 0; i--) {
              const p = sys.particles[i];
              p.x += p.vx; p.y += p.vy; p.vy += el.gravity; p.life -= 1/60;
              if (p.life <= 0) { sys.particles.splice(i, 1); continue; }
              ctx.fillStyle = el.color; ctx.globalAlpha = p.life / p.maxLife;
              ctx.beginPath(); ctx.arc(p.x, p.y, el.size, 0, Math.PI*2); ctx.fill();
            }
            ctx.globalAlpha = 1;
            requestAnimationFrame(tick);
          };
          tick(); break;
        }
        case 'canvas': {
          const n = document.createElement('canvas');
          n.style.cssText = 'width:100%;height:100%;background:#fff;';
          wrap.appendChild(n);
          n.width = 300; n.height = 200;
          break;
        }
        case 'tooltip': {
          const n = document.createElement('div');
          n.style.cssText = 'position:absolute;background:' + el.background + ';color:' + el.textColor + ';padding:4px 8px;border-radius:4px;font-size:11px;pointer-events:none;display:' + (el.visible === false ? 'none' : 'block') + ';z-index:9999;';
          n.textContent = el.text;
          wrap.appendChild(n); break;
        }
        case 'achievement': {
          const n = document.createElement('div');
          n.style.cssText = 'width:100%;height:100%;display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;padding:8px 10px;border-left:4px solid ' + el.accent + ';border-radius:' + s.borderRadius + 'px;background:' + s.background + ';color:' + s.color + ';box-sizing:border-box;box-shadow:0 6px 18px rgba(0,0,0,.25);opacity:' + (el.unlocked ? '1' : '.72') + ';';
          const icon = document.createElement('div'); icon.textContent = el.icon || '🏆'; icon.style.cssText = 'font-size:24px;line-height:1;';
          const content = document.createElement('div'); content.style.cssText = 'min-width:0;';
          const title = document.createElement('div'); title.textContent = el.title || 'Achievement'; title.style.cssText = 'font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
          const description = document.createElement('div'); description.textContent = el.description || ''; description.style.cssText = 'font-size:11px;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px;';
          const track = document.createElement('div'); track.style.cssText = 'height:3px;background:rgba(255,255,255,.14);border-radius:9px;margin-top:5px;overflow:hidden;';
          const fill = document.createElement('div'); fill.style.cssText = 'height:100%;background:' + el.accent + ';width:' + Math.max(0, Math.min(100, (Number(el.progress) || 0) / Math.max(1, Number(el.target) || 1) * 100)) + '%;'; track.appendChild(fill);
          content.appendChild(title); content.appendChild(description); content.appendChild(track);
          const points = document.createElement('div'); points.textContent = '+' + (Number(el.points) || 0); points.style.cssText = 'font-weight:800;color:' + el.accent + ';font-size:12px;';
          n.appendChild(icon); n.appendChild(content); n.appendChild(points); wrap.appendChild(n); break;
        }
        case 'leaderboard': {
          const n = document.createElement('div');
          n.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;background:' + s.background + ';color:' + s.color + ';border:1px solid ' + s.borderColor + ';border-radius:' + s.borderRadius + 'px;overflow:hidden;box-sizing:border-box;';
          const header = document.createElement('div'); header.textContent = el.title || 'Leaderboard'; header.style.cssText = 'padding:7px 9px;background:' + el.accent + ';color:#fff;font-weight:800;font-size:12px;letter-spacing:.02em;'; n.appendChild(header);
          const body = document.createElement('div'); body.style.cssText = 'flex:1;overflow:auto;padding:4px;';
          (el.entries || []).slice(0, Math.max(1, Number(el.maxVisible) || 5)).forEach((entry, index) => {
            const row = document.createElement('div');
            const highlighted = entry.player === el.highlightPlayer;
            row.style.cssText = 'display:grid;grid-template-columns:24px 1fr auto;gap:5px;align-items:center;padding:4px 6px;margin-bottom:2px;border-radius:4px;background:' + (highlighted ? el.accent + '33' : 'rgba(255,255,255,.045)') + ';font-size:11px;';
            const rank = document.createElement('span'); rank.textContent = String(index + 1); rank.style.cssText = 'font-weight:800;color:' + (index < 3 ? el.accent : s.color) + ';';
            const player = document.createElement('span'); player.textContent = entry.player || 'player'; player.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
            const score = document.createElement('span'); score.textContent = String(Number(entry.score) || 0); score.style.fontWeight = '700';
            row.appendChild(rank); row.appendChild(player); row.appendChild(score); body.appendChild(row);
          });
          if (!(el.entries || []).length) { const empty = document.createElement('div'); empty.textContent = 'No scores yet'; empty.style.cssText = 'padding:12px;text-align:center;opacity:.55;font-size:11px;'; body.appendChild(empty); }
          n.appendChild(body); wrap.appendChild(n); break;
        }
      }

      wrap.querySelectorAll('button,input,select,textarea').forEach(control => {
        control.disabled = !!el.disabled;
      });

      if (el.runtimeDraggable && !el.locked && !el.disabled) {
        wrap.style.cursor = wrap.style.cursor || 'grab';
        wrap.addEventListener('mousedown', e => {
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'VIDEO') return;
          this._startElementDrag(e, panelKey, elId, el);
        });
      }

      if (!document.getElementById('supergui-spinner-style')) {
        const st = document.createElement('style');
        st.id = 'supergui-spinner-style';
        st.textContent = '@keyframes supergui-spin{to{transform:rotate(360deg)}}';
        document.head.appendChild(st);
      }

      return wrap;
    }

    _startElementDrag(e, panelKey, elId, el) {
      const panel = this.config.panels[panelKey];
      const size = this._stagePixelSize();
      const pW = size.w * panel.width / 100;
      const pH = size.h * panel.height / 100;
      const sx = e.clientX, sy = e.clientY, ox = el.x, oy = el.y;
      let moved = false;
      const onMove = ev => {
        const dx = (ev.clientX - sx) / pW * 100;
        const dy = (ev.clientY - sy) / pH * 100;
        if (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) moved = true;
        if (!moved) return;
        this._draggingElements.add(elId);
        el.x = Math.max(0, Math.min(100 - el.width, ox + dx));
        el.y = Math.max(0, Math.min(100 - el.height, oy + dy));
        this._renderPanel(panelKey);
        this.runtime.startHats(EXT_ID + '_whenElementDragged', { E: elId });
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        if (moved) {
          this._draggingElements.delete(elId);
          this._justDragged.add(elId);
          setTimeout(() => this._justDragged.delete(elId), 200);
          this.runtime.startHats(EXT_ID + '_whenElementDragEnd', { E: elId });
        }
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    }
  }
