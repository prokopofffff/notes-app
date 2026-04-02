import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import notesRouter from './routes/notes.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:4321', 'http://127.0.0.1:4321'],
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/notes', notesRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
