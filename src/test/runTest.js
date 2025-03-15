const path = require('path');
const Mocha = require('mocha');
const glob = require('glob');

// Create a Mocha instance
const mocha = new Mocha({
  ui: 'bdd',
  color: true
});

// Use glob to find all test files
const testDir = path.resolve(__dirname);
glob.sync('**/*.test.js', { cwd: testDir }).forEach(file => {
  mocha.addFile(path.join(testDir, file));
});

// Run the tests
mocha.run(failures => {
  process.exitCode = failures ? 1 : 0;
}); 