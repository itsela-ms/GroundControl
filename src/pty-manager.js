const EventEmitter = require('events');
const pty = require('node-pty');
const crypto = require('crypto');

class PtyManager extends EventEmitter {
  constructor(copilotPath, settingsService) {
    super();
    this.copilotPath = copilotPath;
    this.sessions = new Map();
    this.settingsService = settingsService;
  }

  _generateId() {
    return crypto.randomUUID();
  }

  get maxConcurrent() {
    return this.settingsService?.get().maxConcurrent || 5;
  }

  openSession(sessionId) {
    // If already alive, just return the id
    if (this.sessions.has(sessionId) && this.sessions.get(sessionId).alive) {
      return sessionId;
    }

    // Evict oldest if at max capacity
    this._evictIfNeeded();

    const ptyProcess = pty.spawn(this.copilotPath, ['--resume', sessionId, '--yolo'], {
      name: 'xterm-256color',
      cols: 120,
      rows: 40,
      cwd: process.env.USERPROFILE,
      env: { ...process.env, TERM: 'xterm-256color' }
    });

    ptyProcess.onData((data) => {
      this.emit('data', sessionId, data);
    });

    ptyProcess.onExit(({ exitCode }) => {
      this.emit('exit', sessionId, exitCode);
      const entry = this.sessions.get(sessionId);
      if (entry) entry.alive = false;
    });

    this.sessions.set(sessionId, {
      pty: ptyProcess,
      alive: true,
      openedAt: Date.now()
    });

    return sessionId;
  }

  newSession() {
    const sessionId = this._generateId();

    this._evictIfNeeded();

    const ptyProcess = pty.spawn(this.copilotPath, ['--resume', sessionId, '--yolo'], {
      name: 'xterm-256color',
      cols: 120,
      rows: 40,
      cwd: process.env.USERPROFILE,
      env: { ...process.env, TERM: 'xterm-256color' }
    });

    ptyProcess.onData((data) => {
      this.emit('data', sessionId, data);
    });

    ptyProcess.onExit(({ exitCode }) => {
      this.emit('exit', sessionId, exitCode);
      const entry = this.sessions.get(sessionId);
      if (entry) entry.alive = false;
    });

    this.sessions.set(sessionId, {
      pty: ptyProcess,
      alive: true,
      openedAt: Date.now()
    });

    return sessionId;
  }

  write(sessionId, data) {
    const entry = this.sessions.get(sessionId);
    if (entry && entry.alive) {
      entry.pty.write(data);
    }
  }

  resize(sessionId, cols, rows) {
    const entry = this.sessions.get(sessionId);
    if (entry && entry.alive) {
      entry.pty.resize(cols, rows);
    }
  }

  kill(sessionId) {
    const entry = this.sessions.get(sessionId);
    if (entry && entry.alive) {
      entry.pty.kill();
      entry.alive = false;
    }
    this.sessions.delete(sessionId);
  }

  killAll() {
    for (const [id, entry] of this.sessions) {
      if (entry.alive) {
        try { entry.pty.kill(); } catch {}
      }
    }
    this.sessions.clear();
  }

  getActiveSessions() {
    const result = [];
    for (const [id, entry] of this.sessions) {
      if (entry.alive) {
        result.push({ id, openedAt: entry.openedAt });
      }
    }
    return result;
  }

  updateSettings(settings) {
    // Settings are persisted by SettingsService; just evict if needed
  }

  _evictIfNeeded() {
    const alive = [...this.sessions.entries()].filter(([, e]) => e.alive);
    if (alive.length >= this.maxConcurrent) {
      alive.sort((a, b) => a[1].openedAt - b[1].openedAt);
      const [oldestId, oldestEntry] = alive[0];
      try { oldestEntry.pty.kill(); } catch {}
      oldestEntry.alive = false;
      this.sessions.delete(oldestId);
    }
  }
}

module.exports = PtyManager;
