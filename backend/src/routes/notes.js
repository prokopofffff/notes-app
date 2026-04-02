const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', (req, res) => {
  const notes = db
    .prepare('SELECT id, title, body, created_at, updated_at FROM notes WHERE user_id = ? ORDER BY updated_at DESC')
    .all(req.session.userId);
  res.json(notes);
});

router.post('/', (req, res) => {
  const { title, body = '' } = req.body;

  if (!title) {
    return res.status(422).json({ error: 'title is required' });
  }

  const result = db
    .prepare('INSERT INTO notes (user_id, title, body) VALUES (?, ?, ?)')
    .run(req.session.userId, title, body);

  const note = db
    .prepare('SELECT id, title, body, created_at, updated_at FROM notes WHERE id = ?')
    .get(result.lastInsertRowid);

  res.status(201).json(note);
});

router.put('/:id', (req, res) => {
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);

  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  if (note.user_id !== req.session.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { title, body } = req.body;

  if (title === undefined && body === undefined) {
    return res.status(422).json({ error: 'title or body is required' });
  }

  const newTitle = title !== undefined ? title : note.title;
  const newBody = body !== undefined ? body : note.body;

  db.prepare('UPDATE notes SET title = ?, body = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
    newTitle,
    newBody,
    req.params.id
  );

  const updated = db
    .prepare('SELECT id, title, body, created_at, updated_at FROM notes WHERE id = ?')
    .get(req.params.id);

  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);

  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  if (note.user_id !== req.session.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);

  res.status(204).send();
});

module.exports = router;
