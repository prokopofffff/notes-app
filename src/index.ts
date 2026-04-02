import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import notesRoutes from './routes/notes';

// Initialize DB on startup
import './db';

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);

app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:4321',
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
