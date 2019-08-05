// require all modules ending in ".test.js" from the
// current directory and all subdirectories
const testsContext = require.context('./spec', true, /\.spec\.js$/);

testsContext.keys().forEach(testsContext);
