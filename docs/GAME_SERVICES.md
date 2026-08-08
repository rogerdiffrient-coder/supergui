# Achievements and leaderboards

SuperGUI's game services are optional. The UI system works without any companion extension, and game data defaults to the browser's local storage.

## Storage adapters

Set a game namespace and player ID before reading or writing data. Namespaces prevent unrelated games from deliberately sharing keys.

| Adapter | Companion | Notes |
| --- | --- | --- |
| `local` | None | Per-browser data; best for development and offline games. |
| `storage+` | [Storage+](https://extensions.penguinmod.com/extensions/Gen1x/storage_plus.js) | Uses the mode configured in Storage+. Its server mode is global key/value storage. |
| `server storage` | [Server Storage](https://extensions.penguinmod.com/extensions/Ikelene/serverStorageExtension.js) | Configure its server and API key with that extension's blocks first. |
| `auto` | Any | Prefers Storage+, then Server Storage, then local storage. Explicit selection is recommended for releases. |

[Free Servers](https://extensions.penguinmod.com/extensions/WAYLIVES/FreeServers.js) is a WebSocket availability checker, not a key/value database. SuperGUI exposes it through the `Free Servers: is URL up?` block, but it is not a leaderboard storage adapter.

## Achievement flow

1. Set the game namespace and stable player ID.
2. Select a storage adapter.
3. Define achievements when the project starts.
4. Set progress or unlock an achievement directly.
5. Use the unlock hat to play effects, then show it in an `achievement` UI element.

Achievement definitions stay in the project; each player's progress, unlock timestamps, and points are saved in the selected adapter.

## Leaderboard flow

1. Set the game namespace, player ID, and adapter.
2. Submit a score using `best` to keep the player's high score or `latest` to replace it.
3. Read ranks with reporter blocks or refresh a `leaderboard` UI element.

Boards retain the top 100 entries and UI elements choose how many rows to display.

## Security and concurrency

The companion extensions provide storage, not authoritative game-server validation. Client-side scores can be modified by players. Shared key/value backends also do not expose transactions, so simultaneous submissions are best-effort and can race. These leaderboards are suitable for casual projects; competitive games should validate scores and update rankings on a trusted server with atomic operations.

Do not place secret API keys in published project blocks. Follow the selected storage extension's own deployment and key-management guidance.
