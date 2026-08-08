# SuperGUI

SuperGUI is an unsandboxed custom extension for building complete, interactive, stage-aligned interfaces in PenguinMod and TurboWarp. Panels are only one part of it: SuperGUI also includes form controls, game inputs, status widgets, media, animation, themes, persistence, and a visual editor.

It also includes optional achievements and leaderboards backed by local storage, Storage+, or Server Storage, plus integration with Free Servers for WebSocket availability checks. See [Game services](docs/GAME_SERVICES.md) for setup and limitations.

## Use the extension

1. Download [`dist/supergui.js`](dist/supergui.js).
2. In PenguinMod or TurboWarp, open **Add Extension** and choose **Custom Extension**.
3. Select or host `supergui.js`, and enable **Run extension without sandbox**.
4. Use **open SuperGUI editor** to create your interface, then click **Save** in the editor.

Only `dist/supergui.js` needs to be uploaded to the extension loader. The files under `src/` are organized for development.

> SuperGUI is unsandboxed because it draws HTML over the renderer canvas, opens its visual editor, plays media, and uses browser storage. Only load code from sources you trust.

## Element categories

- Basic controls: labels, buttons, inputs, checkbox, switch, slider, knob
- Choices and navigation: dropdown, radio, selector, tabs, accordion, search, carousel
- Status and feedback: progress, counter, badge, spinner, rating, health bar, tooltip
- Media and visuals: images, video, background, color picker, code, particles, canvas
- Game input: joystick and D-pad
- Game UI: achievement cards and live leaderboard views
- Custom art: reusable 9-slice skins on any element and three-piece health-bar artwork

## Development

Node.js 18 or newer is the only development requirement; there are no downloaded packages or runtime dependencies.

```sh
npm run build
npm test
npm run check
```

The build combines the ES-module source into the single classic script required by Scratch-family extension loaders. Commit changes to both `src/` and the regenerated `dist/supergui.js`.

## Project structure

```text
src/constants-and-model.js       Defaults, themes, validation, persistence
src/game-services.js             Achievements, leaderboards, storage adapters
src/super-gui.js                 Scratch blocks and runtime DOM rendering
src/editor/editor-template.js    Visual editor UI
src/index.js                     ES-module development entry point
scripts/build.mjs                Dependency-free JavaScript bundle builder
tests/project.test.mjs           Structural regression checks
dist/supergui.js                 Ready-to-upload extension
```

## Compatibility

SuperGUI targets modern browsers used by PenguinMod and TurboWarp. It must run unsandboxed. Standard Scratch does not support loading arbitrary custom JavaScript extensions.

## License

MIT — see [LICENSE](LICENSE).
