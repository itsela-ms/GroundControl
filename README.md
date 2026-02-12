# Copilot Session GUI

An Electron desktop app for managing GitHub Copilot CLI sessions — list, search, resume, and switch between sessions with a rich GUI.

## Features

- **Session Management** — Browse all sessions with auto-generated titles, search by title/tags/resources
- **Active & History tabs** — Track which sessions are running vs. completed
- **Terminal embedding** — Full xterm.js terminal centered in the GUI, seamless switching between sessions
- **Concurrent sessions** — Keep N sessions alive in the background (configurable), oldest evicted when limit is reached
- **Smart search** — Search by session title, tags (repos, tools, topics), or linked resources (PR IDs, work items)
- **Resource panel** — View linked PRs, work items, repos, and wiki pages for each session with clickable links
- **Instructions viewer** — Read-only rendered view of `copilot-instructions.md` with TOC, collapsible sections, and import/export
- **Theme support** — Catppuccin Mocha (dark) and Latte (light) themes
- **Settings** — Configurable max concurrent sessions, theme, sidebar width (all persisted)
- **Keyboard shortcuts** — `Ctrl+N` new session, `Ctrl+Tab` switch, `Ctrl+W` close, `Escape` dismiss panels
- **Windowless launch** — VBS launcher to run without a visible `cmd.exe` window

## Prerequisites

- [GitHub Copilot CLI](https://github.com/github/copilot-cli) installed via WinGet
- Node.js 18+
- Windows (uses Windows-specific PTY and launch mechanisms)

## Setup

```bash
cd copilot-session-gui
npm install
```

## Usage

```bash
# Build and run
npm start

# Build only
npm run build

# Launch without cmd.exe window (Windows)
npm run launch
```

## Architecture

- **`src/main.js`** — Electron main process, IPC handlers, integrates all services
- **`src/renderer.js`** — All renderer logic: sidebar, terminals, instructions, resources, settings
- **`src/index.html`** — App layout
- **`src/styles.css`** — Catppuccin dual-theme CSS
- **`src/pty-manager.js`** — Manages concurrent copilot.exe PTY processes with eviction
- **`src/session-service.js`** — Reads `~/.copilot/session-state/` directory
- **`src/tag-indexer.js`** — Extracts tags from session events, caches to JSON
- **`src/resource-indexer.js`** — Extracts PRs, work items, repos, wikis from session events
- **`src/settings-service.js`** — Persists settings to `~/.copilot/session-gui-settings.json`
- **`src/preload.js`** — Context bridge API
- **`launch.vbs`** — Windowless VBS launcher

## License

MIT
