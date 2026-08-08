import { SuperGUI } from './super-gui.js';

(function registerSuperGUI(Scratch) {
  'use strict';
  if (!Scratch || !Scratch.extensions || !Scratch.extensions.unsandboxed) {
    throw new Error('SuperGUI must be run unsandboxed.');
  }
  // Hosts expose the VM in slightly different places. Prefer the public Scratch
  // object, then use the globals provided by older editor builds.
  const runtime = (Scratch.vm && Scratch.vm.runtime) || Scratch.runtime ||
    (globalThis.vm && globalThis.vm.runtime);
  if (!runtime) throw new Error('SuperGUI could not find the Scratch runtime.');
  Scratch.extensions.register(new SuperGUI(runtime));
})(globalThis.Scratch);
