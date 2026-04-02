const JWT_SECRET = process.env.JWT_SECRET || 'notes-app-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';
const PORT = process.env.PORT || 3001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:4321';

module.exports = { JWT_SECRET, JWT_EXPIRES_IN, PORT, FRONTEND_ORIGIN };
