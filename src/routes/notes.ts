import { Router, Request, Response } from 'express';
import db from '../db';
import { authMiddleware } from '../middleware/auth';
import { Note, NoteRequestBody } from '../types';

const router = Router();

router.use(authMiddleware);

router.get('/', (req: Request, res: Response): void => {
  const notes = db
    .prepare('SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC')
    .all(req.user!.id) as Note[];
  res.json(notes);
});

router.post('/', (req: Request<{}, {}, NoteRequestBody>, res: Response): void => {
  const { title = '', content = '' } = req.body;
  const result = db
    .prepare('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)')
    .run(req.user!.id, title, content);
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid) as Note;
  res.status(201).json(note);
});

router.put('/:id', (req: Request<{ id: string }, {}, NoteRequestBody>, res: Response): void => {
  const { title, content } = req.body;
  const note = db
    .prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user!.id) as Note | undefined;

  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }

  db.prepare(
    'UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(
    title !== undefined ? title : note.title,
    content !== undefined ? content : note.content,
    note.id
  );

  const updated = db.prepare('SELECT * FROM notes WHERE id = ?').get(note.id) as Note;
  res.json(updated);
});

router.delete('/:id', (req: Request<{ id: string }>, res: Response): void => {
  const note = db
    .prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user!.id) as Note | undefined;

  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }

  db.prepare('DELETE FROM notes WHERE id = ?').run(note.id);
  res.status(204).end();
});

export default router;
