import { Router } from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All notes routes require authentication
router.use(authenticate);

// GET /api/notes
router.get('/', (req, res) => {
  const notes = db.prepare(
    'SELECT id, title, content, created_at, updated_at FROM notes WHERE user_id = ? ORDER BY updated_at DESC'
  ).all(req.user.id);
  res.json({ notes });
});

// POST /api/notes
router.post('/', (req, res) => {
  const { title, content = '' } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (typeof content !== 'string') {
    return res.status(400).json({ error: 'Content must be a string' });
  }

  const result = db.prepare(
    'INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)'
  ).run(req.user.id, title.trim(), content);

  const note = db.prepare(
    'SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?'
  ).get(result.lastInsertRowid);

  res.status(201).json({ note });
});

// GET /api/notes/:id
router.get('/:id', (req, res) => {
  const note = db.prepare(
    'SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.user.id);

  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }
  res.json({ note });
});

// PUT /api/notes/:id
router.put('/:id', (req, res) => {
  const { title, content } = req.body;

  const note = db.prepare('SELECT id FROM notes WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({ error: 'Title must be a non-empty string' });
  }
  if (content !== undefined && typeof content !== 'string') {
    return res.status(400).json({ error: 'Content must be a string' });
  }

  db.prepare(
    `UPDATE notes SET
      title = COALESCE(?, title),
      content = COALESCE(?, content),
      updated_at = datetime('now')
    WHERE id = ? AND user_id = ?`
  ).run(
    title !== undefined ? title.trim() : null,
    content !== undefined ? content : null,
    req.params.id,
    req.user.id
  );

  const updated = db.prepare(
    'SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?'
  ).get(req.params.id);

  res.json({ note: updated });
});

// DELETE /api/notes/:id
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Note not found' });
  }
  res.json({ message: 'Note deleted successfully' });
});

export default router;
