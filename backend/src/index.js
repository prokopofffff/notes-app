const express = require('express');
const cors = require('cors');
const { PORT, FRONTEND_ORIGIN } = require('./config');

// Initialize DB (creates tables + seeds users)
require('./db');

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const authMiddleware = require('./middleware/auth');

const app = express();

app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/notes', authMiddleware, notesRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Notes API running on port ${PORT}`);
});

module.exports = app;
