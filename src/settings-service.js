const fs = require('fs');
const path = require('path');

const DEFAULTS = {
  maxConcurrent: 5,
  sidebarWidth: 280,
  lastActiveTab: 'active', // 'active' or 'history'
  theme: 'mocha', // 'mocha' or 'latte'
  instructionsPath: '', // empty = default (~/.copilot/copilot-instructions.md)
};

class SettingsService {
  constructor(configDir) {
    this.configPath = path.join(configDir, 'session-gui-settings.json');
    this.settings = { ...DEFAULTS };
  }

  async load() {
    try {
      const data = await fs.promises.readFile(this.configPath, 'utf8');
      const saved = JSON.parse(data);
      this.settings = { ...DEFAULTS, ...saved };
    } catch {
      this.settings = { ...DEFAULTS };
    }
    return this.settings;
  }

  async save() {
    try {
      const dir = path.dirname(this.configPath);
      await fs.promises.mkdir(dir, { recursive: true });
      await fs.promises.writeFile(this.configPath, JSON.stringify(this.settings, null, 2), 'utf8');
    } catch {}
  }

  get() {
    return { ...this.settings };
  }

  async update(partial) {
    Object.assign(this.settings, partial);
    await this.save();
    return this.settings;
  }
}

module.exports = SettingsService;
