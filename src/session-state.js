/**
 * Derive the display state for a session.
 * Pure function — no DOM dependencies.
 *
 * @param {object} opts
 * @param {boolean} opts.isRunning      - Session has an active terminal
 * @param {boolean} opts.isActive       - Session is the currently focused one
 * @param {boolean} opts.hasPR          - Session has PR resources
 * @param {boolean} opts.isHistory      - Currently viewing the history tab
 * @param {boolean} [opts.isBusy]       - Session produced pty output recently
 * @returns {{ label: string, cls: string }}
 */
function deriveSessionState({ isRunning, isActive, hasPR, isHistory, isBusy }) {
  if (hasPR && !isRunning) return { label: 'Pending', cls: 'state-pending', tip: 'Has a PR linked — waiting to be picked up' };
  if (isRunning && isBusy)  return { label: 'Working', cls: 'state-working', tip: 'AI is actively producing output' };
  if (isRunning)            return { label: 'Waiting', cls: 'state-waiting', tip: 'Session is open but idle — no recent output' };
  if (isHistory)            return { label: '\u2713 Done', cls: 'state-done', tip: 'Session completed' };
  return { label: 'Idle', cls: 'state-idle', tip: 'No active terminal' };
}

module.exports = { deriveSessionState };
