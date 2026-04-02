// Set required env vars before any app modules are imported
process.env['JWT_SECRET'] = 'test-jwt-secret-key-for-testing-only';
process.env['NODE_ENV'] = 'test';
// Use port 0 so the OS assigns a random available port per worker,
// preventing EADDRINUSE when multiple test files run in parallel
process.env['PORT'] = '0';
