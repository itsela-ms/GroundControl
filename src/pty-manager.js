const EventEmitter = require('events');
const crypto = require('crypto');

const os = require('os');

// Default to node-pty, but allow injection for testing
let defaultPty;
try { defaultPty = require('node-pty'); } catch { defaultPty = null; }

class PtyManager extends EventEmitter {
  constructor(copilotPath, settingsService, ptyModule) {
    super();
    this.copilotPath = copilotPath;
    this.sessions = new Map();
    this.settingsService = settingsService;
    this._pty = ptyModule || defaultPty;
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

    // Bug #26: clean up dead entry before respawning
    if (this.sessions.has(sessionId)) {
      this.sessions.delete(sessionId);
    }

    // Evict oldest if at max capacity
    this._evictIfNeeded();

    let ptyProcess;
    try {
      ptyProcess = this._pty.spawn(this.copilotPath, ['--resume', sessionId, '--yolo'], {
        name: 'xterm-256color',
        cols: 120,
        rows: 40,
        cwd: os.homedir(),
        env: { ...process.env, TERM: 'xterm-256color' }
      });
    } catch (err) {
      throw new Error(`Failed to spawn PTY for session ${sessionId}: ${err.message}`);
    }

    ptyProcess.onData((data) => {
      const entry = this.sessions.get(sessionId);
      if (entry && entry.alive) {
        entry.lastDataAt = Date.now();
        this.emit('data', sessionId, data);
      }
    });

    ptyProcess.onExit(({ exitCode }) => {
      const entry = this.sessions.get(sessionId);
      if (entry && entry.alive) {
        entry.alive = false;
        this.emit('exit', sessionId, exitCode);
      }
    });

    this.sessions.set(sessionId, {
      pty: ptyProcess,
      alive: true,
      openedAt: Date.now(),
      lastDataAt: Date.now()
    });

    return sessionId;
  }

  newSession() {
    const sessionId = this._generateId();

    this._evictIfNeeded();

    let ptyProcess;
    try {
      ptyProcess = this._pty.spawn(this.copilotPath, ['--resume', sessionId, '--yolo'], {
        name: 'xterm-256color',
        cols: 120,
        rows: 40,
        cwd: os.homedir(),
        env: { ...process.env, TERM: 'xterm-256color' }
      });
    } catch (err) {
      throw new Error(`Failed to spawn PTY for session ${sessionId}: ${err.message}`);
    }

    ptyProcess.onData((data) => {
      const entry = this.sessions.get(sessionId);
      if (entry && entry.alive) {
        entry.lastDataAt = Date.now();
        this.emit('data', sessionId, data);
      }
    });

    ptyProcess.onExit(({ exitCode }) => {
      const entry = this.sessions.get(sessionId);
      if (entry && entry.alive) {
        entry.alive = false;
        this.emit('exit', sessionId, exitCode);
      }
    });

    this.sessions.set(sessionId, {
      pty: ptyProcess,
      alive: true,
      openedAt: Date.now(),
      lastDataAt: Date.now()
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
        result.push({ id, openedAt: entry.openedAt, lastDataAt: entry.lastDataAt || 0 });
      }
    }
    return result;
  }

  /**
   * Returns sessions that received pty output within the last `thresholdMs`.
   * These are likely still processing AI work.
   */
  getBusySessions(thresholdMs = 5000) {
    const now = Date.now();
    const result = [];
    for (const [id, entry] of this.sessions) {
      if (entry.alive && entry.lastDataAt && (now - entry.lastDataAt) < thresholdMs) {
        result.push(id);
      }
    }
    return result;
  }

  /**
   * Kill sessions that haven't produced output within `thresholdMs`.
   * Returns the IDs of sessions that were killed.
   */
  killIdle(thresholdMs = 5000) {
    const now = Date.now();
    const killed = [];
    for (const [id, entry] of this.sessions) {
      if (entry.alive && (!entry.lastDataAt || (now - entry.lastDataAt) >= thresholdMs)) {
        try { entry.pty.kill(); } catch {}
        entry.alive = false;
        this.sessions.delete(id);
        killed.push(id);
      }
    }
    return killed;
  }

  updateSettings(settings) {
    // Settings are persisted by SettingsService; just evict if needed
  }

  _evictIfNeeded() {
    let alive = [...this.sessions.entries()].filter(([, e]) => e.alive);
    alive.sort((a, b) => a[1].openedAt - b[1].openedAt);
    let i = 0;
    while (alive.length - i >= this.maxConcurrent) {
      const [oldestId, oldestEntry] = alive[i];
      oldestEntry.alive = false;
      this.emit('evicted', oldestId);
      try { oldestEntry.pty.kill(); } catch {}
      this.sessions.delete(oldestId);
      i++;
    }
  }
}

module.exports = PtyManager;
