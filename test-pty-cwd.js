// Test what happens when spawning with invalid cwd
const pty = require('node-pty');
const os = require('os');

console.log('Testing node-pty spawn with invalid cwd values...\n');

const testCases = [
  { name: 'nonexistent path', cwd: 'C:\\this\\does\\not\\exist' },
  { name: 'empty string', cwd: '' },
  { name: 'null', cwd: null },
  { name: 'undefined', cwd: undefined },
  { name: 'UNC path (may not exist)', cwd: '\\\\server\\share\\folder' },
];

testCases.forEach(tc => {
  console.log(`\nTesting: ${tc.name} (cwd="${tc.cwd}")`);
  try {
    const shell = process.platform === 'win32' ? 'cmd.exe' : 'bash';
    const spawnCwd = tc.cwd === undefined ? os.homedir() : (tc.cwd || os.homedir());
    
    console.log(`  Attempting spawn with cwd="${spawnCwd}"...`);
    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd: spawnCwd,
      env: process.env
    });
    
    console.log(`  ✓ Spawn succeeded (pid: ${ptyProcess.pid})`);
    
    // Kill immediately
    setTimeout(() => {
      try {
        ptyProcess.kill();
        console.log(`  ✓ Process killed`);
      } catch (err) {
        console.log(`  ! Kill failed: ${err.message}`);
      }
    }, 100);
    
  } catch (err) {
    console.log(`  ✗ Spawn FAILED: ${err.message}`);
    console.log(`  Error code: ${err.code || 'N/A'}`);
  }
});

// Wait for kills to complete
setTimeout(() => {
  console.log('\nTest complete.');
  process.exit(0);
}, 1000);
