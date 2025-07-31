// Simple server start without TypeScript compilation issues
require('ts-node/register');

// Disable strict TypeScript checks for quick testing
process.env.TS_NODE_TRANSPILE_ONLY = 'true';

// Start the server
require('./src/server.ts');