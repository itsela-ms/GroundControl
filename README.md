# DeepSky ✦

**Your command center for GitHub Copilot CLI.**

Stop juggling session IDs. DeepSky gives you a sleek desktop app to manage, search, and switch between all your Copilot CLI sessions — so you can focus on building, not bookkeeping.

![Windows](https://img.shields.io/badge/platform-Windows-blue)
![macOS](https://img.shields.io/badge/platform-macOS-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Why DeepSky?

Copilot CLI is powerful, but managing sessions is painful. You're copying UUIDs, grepping through directories, and losing track of what's running. DeepSky fixes all of that with a visual interface purpose-built for power users.

## ✨ Features

### Session Management
- **Visual sidebar** with all your sessions — active and historical — searchable by title, tags, or linked resources
- **Concurrent sessions** — keep multiple sessions alive in the background with smart eviction when you hit the limit
- **Session rename** — double-click any title to give it a meaningful name
- **Instant resume** — click to reopen any past session exactly where you left off

### Embedded Terminal
- Full-featured terminal with 10,000-line scrollback, link detection, and clipboard support
- Multi-tab interface — switch between sessions like browser tabs
- Seamless session switching without losing state

### Smart Search & Resources
- Find sessions by title, tags, PR numbers, work item IDs, or repo names
- **Resource panel** — every session shows its linked PRs, work items, repos, and wiki pages as clickable links

### Notifications
- Real-time alerts when tasks complete, sessions error out, or input is needed
- Badge counter, dropdown panel, toast popups, and native OS notifications
- Never miss a completed build or a session waiting for input again

### Custom Instructions
- Built-in viewer for your `copilot-instructions.md` with Markdown rendering, collapsible sections, and table of contents
- Import/export and merge instructions across projects

### Polish
- **Catppuccin themes** — Mocha (dark) and Latte (light), because aesthetics matter
- **Keyboard-first** — `Ctrl+N` new session, `Ctrl+Tab` switch, `Ctrl+W` close, `Esc` dismiss
- **Auto-updates** — new versions download and install in the background

---

## Installation

### Windows Installer (recommended)

1. Download the latest `DeepSky Setup x.x.x.exe` from [**Releases**](https://github.com/itsela-ms/DeepSky/releases)
2. Run the installer — installs to your user profile with a Start Menu entry
3. Launch DeepSky from the Start Menu

> **Prerequisite:** [GitHub Copilot CLI](https://github.com/github/copilot-cli) — `winget install github.copilot`

### macOS Installer

1. Download the latest `DeepSky-x.x.x.dmg` from [**Releases**](https://github.com/itsela-ms/DeepSky/releases)
2. Open the DMG and drag DeepSky to Applications
3. Launch DeepSky from Applications or Spotlight

> **Prerequisite:** [GitHub Copilot CLI](https://github.com/github/copilot-cli) — `brew install github/gh/copilot`

### From Source

```bash
git clone https://github.com/itsela-ms/DeepSky.git
cd DeepSky
npm install
npm start
```

---

## Updates

DeepSky checks for updates automatically on startup. You can also check manually via **Settings → About → Check for Updates**. Downloads happen in the background — click **Restart & Update** when ready.

---

## Keyboard Shortcuts

| Shortcut | macOS | Action |
|----------|-------|--------|
| `Ctrl+N` | `Cmd+N` | New session |
| `Ctrl+Tab` | `Ctrl+Tab` | Next tab |
| `Ctrl+Shift+Tab` | `Ctrl+Shift+Tab` | Previous tab |
| `Ctrl+W` | `Cmd+W` | Close tab |
| `Ctrl+V` / `Shift+Ins` | `Cmd+V` | Paste |
| `Esc` | `Esc` | Dismiss panels / clear search |

---

## License

MIT
