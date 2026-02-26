// Quick security test for cwd handling
const path = require('path');
const fs = require('fs');

console.log('Testing cwd validation edge cases...\n');

// Test 1: Empty string
const testCases = [
  { name: 'empty string', cwd: '' },
  { name: 'very long path', cwd: 'C:\\' + 'a\\'.repeat(1000) + 'test' },
  { name: 'UNC path', cwd: '\\\\server\\share\\folder' },
  { name: 'path with quotes', cwd: 'C:\\temp\\"malicious"\\path' },
  { name: 'path with newlines', cwd: 'C:\\temp\nmewline\\path' },
  { name: 'null bytes', cwd: 'C:\\temp\x00evil\\path' },
  { name: 'mixed separators', cwd: 'C:/temp\\mixed/path' },
  { name: 'nonexistent path', cwd: 'C:\\this\\does\\not\\exist\\anywhere\\on\\disk' }
];

// Test if special chars are present (would need escaping in HTML)
function needsEscaping(str) {
  return /[<>"'&\n\r\t\0]/.test(str);
}

console.log('=== HTML Special Characters Check ===');
testCases.forEach(tc => {
  const needs = needsEscaping(tc.cwd);
  console.log(`${tc.name}: ${needs ? 'CONTAINS SPECIAL CHARS (needs escaping)' : 'no special chars'}`);
  if (needs) {
    console.log(`  Value: "${tc.cwd.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\0/g, '\\0')}"`);
  }
});

console.log('\n=== Path Validation Test ===');
// Test what happens when node spawns with invalid cwd
testCases.forEach(tc => {
  try {
    // This mimics what pty.spawn would receive
    const testPath = tc.cwd || require('os').homedir();
    console.log(`${tc.name}: would use "${testPath}"`);
  } catch (err) {
    console.log(`${tc.name}: ERROR - ${err.message}`);
  }
});

console.log('\n=== File Write Test ===');
const tempDir = path.join(require('os').tmpdir(), 'deepsky-test-' + Date.now());
fs.mkdirSync(tempDir, { recursive: true });

testCases.forEach(tc => {
  try {
    const testFile = path.join(tempDir, 'test-cwd');
    fs.writeFileSync(testFile, tc.cwd.trim(), 'utf8');
    const read = fs.readFileSync(testFile, 'utf8').trim();
    const matches = read === tc.cwd.trim();
    console.log(`${tc.name}: ${matches ? 'round-trip OK' : 'MISMATCH'}`);
    if (!matches) {
      console.log(`  Written: ${tc.cwd.trim()}`);
      console.log(`  Read:    ${read}`);
    }
    fs.unlinkSync(testFile);
  } catch (err) {
    console.log(`${tc.name}: ERROR - ${err.message}`);
  }
});

fs.rmdirSync(tempDir);
console.log('\nTest complete.');
