const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/notes — list current user's notes
router.get('/', (req, res) => {
  const notes = db
    .prepare('SELECT id, title, content, created_at, updated_at FROM notes WHERE user_id = ? ORDER BY updated_at DESC')
    .all(req.user.id);
  res.json(notes);
});

// POST /api/notes — create note
router.post('/', (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const result = db
    .prepare('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)')
    .run(req.user.id, title, content);

  const note = db
    .prepare('SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?')
    .get(result.lastInsertRowid);

  res.status(201).json(note);
});

// GET /api/notes/:id — get single note
router.get('/:id', (req, res) => {
  const note = db
    .prepare('SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?')
    .get(req.params.id);

  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  if (note.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json(note);
});

// PUT /api/notes/:id — update note
router.put('/:id', (req, res) => {
  const note = db
    .prepare('SELECT * FROM notes WHERE id = ?')
    .get(req.params.id);

  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  if (note.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  db.prepare(
    'UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(title, content, req.params.id);

  const updated = db
    .prepare('SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?')
    .get(req.params.id);

  res.json(updated);
});

// DELETE /api/notes/:id — delete note
router.delete('/:id', (req, res) => {
  const note = db
    .prepare('SELECT * FROM notes WHERE id = ?')
    .get(req.params.id);

  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  if (note.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

module.exports = router;
