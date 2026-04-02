import express from 'express';
import cors from 'cors';
import { PORT, FRONTEND_ORIGIN } from './config';

// Initialize DB (creates tables + seeds users)
import './db';

import authRoutes from './routes/auth';
import notesRoutes from './routes/notes';
import authMiddleware from './middleware/auth';

const app = express();

app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/notes', authMiddleware, notesRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Notes API running on port ${PORT}`);
});

export default app;
