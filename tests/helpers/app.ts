/**
 * Builds an Express app without calling app.listen(), suitable for supertest.
 * Import this AFTER mocking ../../src/db in your test file.
 */
import express from 'express';
import cors from 'cors';
import authRoutes from '../../src/routes/auth';
import notesRoutes from '../../src/routes/notes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default app;
