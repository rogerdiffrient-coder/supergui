import { SuperGUI } from './super-gui.js';

(function registerSuperGUI(Scratch) {
  'use strict';
  if (!Scratch || !Scratch.extensions || !Scratch.extensions.unsandboxed) {
    throw new Error('SuperGUI must be run unsandboxed.');
  }
  const runtime = Scratch.vm ? Scratch.vm.runtime : window.vm && window.vm.runtime;
  if (!runtime) throw new Error('SuperGUI could not find the Scratch runtime.');
  Scratch.extensions.register(new SuperGUI(runtime));
})(globalThis.Scratch);
