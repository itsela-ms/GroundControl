# Changelog

All notable changes to DeepSky are documented here.

## [0.6.1] - 2026-02-25

### Added
- **PR status tracking** — resource panel and sidebar pills now show active/completed/abandoned state for linked PRs
- **Ctrl+T** shortcut to create a new session (same as Ctrl+N)
- **Ctrl+C copy** — when text is selected in the terminal, Ctrl+C copies to clipboard instead of sending SIGINT
- **Double-click group header** to rename (in addition to the existing context menu option)

### Changed
- Clipboard operations routed through main process IPC (fixes sandboxed preload restrictions)
- "Pending" state only triggers for active PRs (completed/abandoned PRs no longer count)
- Removed `copy` from Electron Edit menu to prevent double-handling with xterm's selection model

### Fixed
- Removed `Shift+Enter` custom handling that interfered with terminal input

## [0.6.0] - 2026-02-23

### Added
- **Session grouping** — Edge-style group management in the Active sidebar
  - Create, rename, and recolor groups via context menu
  - Drag-and-drop to reorder sessions and move them between groups
  - Collapse/expand groups with session count badges
  - Right-click context menus for sessions and group headers (rename, color, ungroup, close all)
  - 8 Catppuccin-themed preset group colors
- **Manual session ordering** — drag to reorder sessions freely; order persisted across restarts
- **Drop indicators** — top/bottom highlight when reordering via drag-and-drop
- **Input validation** — group names capped at 50 chars; corrupted group state gracefully restored

### Changed
- **Silent auto-updates** — updates download in the background and install on quit; no restart prompts
- Background update check every 15 minutes
- Green badge on settings gear when an update is pending
- Removed keyboard shortcuts section from README

## [0.5.5] - 2026-02-23

### Added
- CI workflow for Windows builds (GitHub Actions)
- Tab scroll indicators — left/right arrows appear when tabs overflow the tab bar
- SQL/SQLite/database tag recognition for sessions
- Pending sessions now surface on the active tab (not just running ones)

### Changed
- Removed macOS support (Windows-only for now)
- Replaced session dashboard with minimal empty state
- Cross-platform path handling (`os.homedir`), platform-aware binary discovery
- Tabs shrink instead of always overflowing (`flex-shrink: 1`, `min-width: 80px`)
- App icon upscaled to 512×512 for electron-builder

### Fixed
- Copilot CLI `.cmd` shim not found on Windows npm installs — now searches both `.exe` and `.cmd`, spawns via `cmd.exe /c`
- Titlebar buttons unclickable on Electron 35 — Windows `titleBarOverlay` intercepted clicks; fixed with explicit `app-region: no-drag`
- Horizontal scrollbar overflow in terminal area — flex `min-width: auto` prevented shrinking
- "Working" badge on startup lasting ~30s — `lastDataAt` was initialized to `Date.now()`
- "Pending" state never showing for sessions with PRs
- Session state priority reworked — Pending now overrides all states; updated tips for Working/Waiting/Idle
- Memory leaks — IPC listeners not cleaned up, xterm terminals not disposed on pty exit, dead pty entries accumulating in Map
- Unbounded memory — notification `processedFiles` Set uncapped, `sessionLastUsed`/`sessionAliveState`/`sessionIdleCount` not cleaned on close
- Event handling — replaced per-item `addEventListener` with event delegation; fixed title click race condition

## [0.5.4] - 2026-02-22

### Added
- Session dashboard view when no tabs are open
- Live session status polling — badges update every 3s based on actual pty output
- Session state now uses `isBusy` (recent output) instead of focused-session heuristic
- Graceful shutdown — busy sessions stay alive in background when closing (10-min timeout)
- Close confirmation dialog when AI sessions are still processing
- Unit test infrastructure (Vitest) with 27 tests for session-state and pty-manager
- Extracted `session-state.js` — pure function for state derivation

### Changed
- "Working" state now means AI is actively outputting (green), "Waiting" means idle terminal (yellow)
- `pty-manager` tracks `lastDataAt` per session and exposes it via `getActiveSessions()`
- `pty-manager` accepts injectable pty module for testability

### Fixed
- Notification click not focusing the target session (rAF race condition)
- Session state badges going stale between discrete UI events

## [0.5.3] - 2026-02-19

### Added
- Session state badges — each session shows a colored state pill (Idle / Working / Waiting / Pending / ✓ Done)
- Graceful shutdown — busy sessions stay alive in the background when closing, with a 10-minute timeout
- Close confirmation dialog when AI sessions are still processing

### Changed
- Resource panel toggle button changed from ⊞ to 🔗
- Resource icons (Repo/Wiki/PR/WI) styled as auto-width pill badges to prevent text overlap
- Sidebar session items have improved right padding to prevent badge collision

### Fixed
- Resource panel icon text ("Repo", "Wiki") overlapping with resource label names
- Session resource badges colliding with running indicator dot and delete button

## [0.5.2] - 2026-02-17

### Changed
- Smoother UI — softer borders in dark mode, eased transitions, borderless ghost buttons
- Clean icon glyphs (⚐ ☰ ⚙ ⊞) replace emojis everywhere, labels shown on hover
- Simplified update flow — single "Check for Updates" button, auto-downloads, prompts to restart

### Added
- Session persistence — open tabs and active tab restored on startup
- Session delete — red ✕ on hover in history tab with confirmation dialog
- Middle-click to close terminal tabs
- Running session indicator — green dot with subtle glow

### Fixed
- Horizontal scroll in sidebar active tab
- Inconsistent border colors in dark mode

## [0.5.1] - 2026-02-16

### Changed
- Rebranded from GroundControl to DeepSky — new name, new icon, new identity
- Switched to dark icon variant for better taskbar/tray visibility

### Added
- Session rename — double-click any session title in the sidebar to rename it

## [0.4.0] - 2025-02-15

### Added
- Auto-update via GitHub Releases (electron-updater)
- "Check for Updates" button in Settings with download progress
- "Restart & Update" one-click install for downloaded updates
- About section in Settings showing version and changelog
- Switched from portable `.exe` to NSIS installer (install/uninstall, Start Menu entry)

## [0.3.0] - 2025-02-15

### Added
- Version and changelog visible in Settings panel
- Active sidebar now sorts sessions by last used

### Fixed
- New session not appearing in active list immediately
- Tab title not updating after session gets a title
- Startup crash and close ReferenceError

## [0.2.0] - 2025-02-01

### Added
- Windows portable installer via electron-builder
- Custom DeepSky window icon
- Ctrl+V and Shift+Insert paste support in terminal
- Notification bell and notification panel
- Session tags and resource indexing (PRs, work items)
- Theme switcher (Mocha/Latte)
- Keyboard shortcuts: Ctrl+Tab, Ctrl+W, Ctrl+N, Ctrl+K
- Session search with tag and resource filtering
- Copilot instructions editor

### Fixed
- 34 bugs from QA review
- Notification bell white background in dark mode

### Initial
- Electron-based session manager for GitHub Copilot CLI
- Sidebar with Active/History session views
- Terminal multiplexer with tab management
- PTY management with automatic session eviction
