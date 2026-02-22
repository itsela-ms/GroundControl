import { describe, it, expect, vi, beforeEach } from 'vitest';
const PtyManager = require('../src/pty-manager');

function createMockPty() {
  const handlers = {};
  return {
    onData: (cb) => { handlers.data = cb; },
    onExit: (cb) => { handlers.exit = cb; },
    kill: vi.fn(),
    resize: vi.fn(),
    write: vi.fn(),
    _emitData: (data) => handlers.data?.(data),
    _emitExit: (code) => handlers.exit?.({ exitCode: code }),
  };
}

const mockPtyModule = { spawn: vi.fn(() => createMockPty()) };

function createManager(maxConcurrent = 5) {
  const settingsService = { get: () => ({ maxConcurrent }) };
  return new PtyManager('/fake/copilot', settingsService, mockPtyModule);
}

function getPty(manager, sessionId) {
  // Access internal session entry to get the mock pty
  const entry = manager.sessions.get(sessionId);
  return entry?.pty;
}

describe('PtyManager', () => {
  let manager;

  beforeEach(() => {
    vi.useFakeTimers();
    manager = createManager();
  });

  describe('lastDataAt tracking', () => {
    it('initializes lastDataAt as null on openSession', () => {
      const id = manager.openSession('test-1');
      const entry = manager.sessions.get(id);
      expect(entry.lastDataAt).toBeNull();
    });

    it('initializes lastDataAt as null on newSession', () => {
      const id = manager.newSession();
      const entry = manager.sessions.get(id);
      expect(entry.lastDataAt).toBeNull();
    });

    it('updates lastDataAt when pty emits data', () => {
      const id = manager.openSession('test-2');
      const entry = manager.sessions.get(id);
      expect(entry.lastDataAt).toBeNull();

      vi.advanceTimersByTime(1000);
      getPty(manager, id)._emitData('hello');

      expect(entry.lastDataAt).toBeGreaterThan(0);
    });
  });

  describe('getBusySessions', () => {
    it('returns sessions with recent output', () => {
      const id = manager.openSession('busy-1');
      // Simulate actual output
      getPty(manager, id)._emitData('output');
      const busy = manager.getBusySessions(5000);
      expect(busy).toContain('busy-1');
    });

    it('excludes sessions with stale output', () => {
      manager.openSession('stale-1');
      vi.advanceTimersByTime(6000);

      const busy = manager.getBusySessions(5000);
      expect(busy).not.toContain('stale-1');
    });

    it('excludes dead sessions', () => {
      const id = manager.openSession('dead-1');
      manager.kill(id);

      const busy = manager.getBusySessions(5000);
      expect(busy).not.toContain('dead-1');
    });

    it('returns empty array when no sessions exist', () => {
      expect(manager.getBusySessions(5000)).toEqual([]);
    });

    it('excludes sessions with no output yet', () => {
      manager.openSession('fresh-no-output');
      const busy = manager.getBusySessions(5000);
      expect(busy).not.toContain('fresh-no-output');
    });

    it('uses threshold correctly', () => {
      const id = manager.openSession('threshold-1');
      getPty(manager, id)._emitData('output');
      vi.advanceTimersByTime(3000);

      expect(manager.getBusySessions(5000)).toContain('threshold-1');
      expect(manager.getBusySessions(2000)).not.toContain('threshold-1');
    });
  });

  describe('killIdle', () => {
    it('kills sessions with stale output', () => {
      manager.openSession('idle-1');
      vi.advanceTimersByTime(6000);

      const killed = manager.killIdle(5000);
      expect(killed).toContain('idle-1');
      expect(manager.sessions.has('idle-1')).toBe(false);
    });

    it('keeps sessions with recent output', () => {
      const id = manager.openSession('fresh-1');
      getPty(manager, id)._emitData('output');

      const killed = manager.killIdle(5000);
      expect(killed).not.toContain('fresh-1');
      expect(manager.sessions.has('fresh-1')).toBe(true);
    });

    it('calls kill on the pty process', () => {
      const id = manager.openSession('kill-pty-1');
      const pty = getPty(manager, id);
      vi.advanceTimersByTime(6000);

      manager.killIdle(5000);
      expect(pty.kill).toHaveBeenCalled();
    });

    it('handles mixed busy and idle sessions', () => {
      const oldId = manager.openSession('old-1');
      getPty(manager, oldId)._emitData('output');
      vi.advanceTimersByTime(6000);
      const newId = manager.openSession('new-1');
      getPty(manager, newId)._emitData('output');

      const killed = manager.killIdle(5000);
      expect(killed).toContain('old-1');
      expect(killed).not.toContain('new-1');
      expect(manager.sessions.has('old-1')).toBe(false);
      expect(manager.sessions.has('new-1')).toBe(true);
    });

    it('is safe to call when no sessions exist', () => {
      expect(() => manager.killIdle(5000)).not.toThrow();
      expect(manager.killIdle(5000)).toEqual([]);
    });

    it('marks killed sessions as not alive', () => {
      const id = manager.openSession('alive-check');
      vi.advanceTimersByTime(6000);

      // Session is still in map before killIdle, with alive=true
      expect(manager.sessions.get(id).alive).toBe(true);

      manager.killIdle(5000);
      // Session should be deleted from map entirely
      expect(manager.sessions.has(id)).toBe(false);
    });
  });

  describe('integration: busy detection after data events', () => {
    it('session becomes busy again after receiving new data', () => {
      const id = manager.openSession('revive-1');
      vi.advanceTimersByTime(6000);
      expect(manager.getBusySessions(5000)).not.toContain('revive-1');

      // Simulate new output
      getPty(manager, id)._emitData('still working...');
      expect(manager.getBusySessions(5000)).toContain('revive-1');
    });

    it('killIdle spares a session that just received data', () => {
      const id = manager.openSession('just-in-time');
      vi.advanceTimersByTime(6000);

      // Right before killIdle, session gets output
      getPty(manager, id)._emitData('output');

      const killed = manager.killIdle(5000);
      expect(killed).not.toContain('just-in-time');
    });
  });
});
