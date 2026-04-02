import { Router, Request, Response } from 'express';
import db from '../db';
import type { Note, NoteRequestBody } from '../types';

const router = Router();

// GET /api/notes — list current user's notes
router.get('/', (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const notes = db
    .prepare('SELECT id, title, content, created_at, updated_at FROM notes WHERE user_id = ? ORDER BY updated_at DESC')
    .all(req.user.id) as Note[];
  res.json(notes);
});

// POST /api/notes — create note
router.post('/', (req: Request<object, object, NoteRequestBody>, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const { title, content } = req.body;

  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }

  const result = db
    .prepare('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)')
    .run(req.user.id, title, content);

  const note = db
    .prepare('SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?')
    .get(result.lastInsertRowid) as Note;

  res.status(201).json(note);
});

// GET /api/notes/:id — get single note
router.get('/:id', (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const note = db
    .prepare('SELECT id, user_id, title, content, created_at, updated_at FROM notes WHERE id = ?')
    .get(req.params['id']) as Note | undefined;

  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }

  if (note.user_id !== req.user.id) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  res.json(note);
});

// PUT /api/notes/:id — update note
router.put('/:id', (req: Request<{ id: string }, object, NoteRequestBody>, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const note = db
    .prepare('SELECT * FROM notes WHERE id = ?')
    .get(req.params['id']) as Note | undefined;

  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }

  if (note.user_id !== req.user.id) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const { title, content } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }

  db.prepare(
    'UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(title, content, req.params['id']);

  const updated = db
    .prepare('SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?')
    .get(req.params['id']) as Note;

  res.json(updated);
});

// DELETE /api/notes/:id — delete note
router.delete('/:id', (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const note = db
    .prepare('SELECT * FROM notes WHERE id = ?')
    .get(req.params['id']) as Note | undefined;

  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }

  if (note.user_id !== req.user.id) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  db.prepare('DELETE FROM notes WHERE id = ?').run(req.params['id']);
  res.status(204).send();
});

export default router;
