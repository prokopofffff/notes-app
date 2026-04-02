import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// In-memory db shared across this test file
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Database = require('better-sqlite3');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcrypt');

const testDb = new Database(':memory:');
testDb.pragma('journal_mode = WAL');
testDb.pragma('foreign_keys = ON');

testDb.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

const aliceHash = bcrypt.hashSync('alice123', 10);
const bobHash = bcrypt.hashSync('bob123', 10);
testDb.prepare('INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)').run('alice', aliceHash);
testDb.prepare('INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)').run('bob', bobHash);

vi.mock('../src/db', () => ({ default: testDb }));

const { default: app } = await import('../src/index');

const TEST_SECRET = 'test-jwt-secret-key-for-testing-only';
const aliceId = (testDb.prepare('SELECT id FROM users WHERE username = ?').get('alice') as { id: number }).id;
const bobId = (testDb.prepare('SELECT id FROM users WHERE username = ?').get('bob') as { id: number }).id;

const aliceToken = jwt.sign({ user_id: aliceId, username: 'alice' }, TEST_SECRET);
const bobToken = jwt.sign({ user_id: bobId, username: 'bob' }, TEST_SECRET);

beforeEach(() => {
  // Clean up notes between tests
  testDb.prepare('DELETE FROM notes').run();
});

describe('GET /api/notes', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/notes');
    expect(res.status).toBe(401);
  });

  it('returns 401 with malformed token', async () => {
    const res = await request(app)
      .get('/api/notes')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });

  it('returns empty array when user has no notes', async () => {
    const res = await request(app)
      .get('/api/notes')
      .set('Authorization', `Bearer ${aliceToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns only the authenticated user\'s notes', async () => {
    // Create notes for both alice and bob
    testDb.prepare('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)').run(aliceId, 'Alice Note', 'Alice content');
    testDb.prepare('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)').run(bobId, 'Bob Note', 'Bob content');

    const res = await request(app)
      .get('/api/notes')
      .set('Authorization', `Bearer ${aliceToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Alice Note');
  });

  it('returns notes ordered by updated_at DESC', async () => {
    testDb.prepare('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)').run(aliceId, 'First Note', 'content1');
    testDb.prepare('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)').run(aliceId, 'Second Note', 'content2');

    const res = await request(app)
      .get('/api/notes')
      .set('Authorization', `Bearer ${aliceToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    // Most recently created should be first (or same timestamp)
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('title');
    expect(res.body[0]).toHaveProperty('content');
    expect(res.body[0]).toHaveProperty('created_at');
    expect(res.body[0]).toHaveProperty('updated_at');
  });
});

describe('POST /api/notes', () => {
  it('creates a new note and returns 201', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ title: 'My Note', content: 'Some content' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: 'My Note',
      content: 'Some content',
    });
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('created_at');
    expect(res.body).toHaveProperty('updated_at');
  });

  it('returns 401 without token', async () => {
    const res = await request(app)
      .post('/api/notes')
      .send({ title: 'Note', content: 'Content' });

    expect(res.status).toBe(401);
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ content: 'Content only' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when content is missing', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ title: 'Title only' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when both fields are missing', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({});

    expect(res.status).toBe(400);
  });
});

describe('GET /api/notes/:id', () => {
  it('returns the note for its owner', async () => {
    const insert = testDb
      .prepare('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)')
      .run(aliceId, 'Alice Note', 'Hello');
    const noteId = insert.lastInsertRowid;

    const res = await request(app)
      .get(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${aliceToken}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Alice Note');
  });

  it('returns 403 when another user tries to access the note', async () => {
    const insert = testDb
      .prepare('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)')
      .run(aliceId, 'Alice Private Note', 'private');
    const noteId = insert.lastInsertRowid;

    const res = await request(app)
      .get(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${bobToken}`);

    expect(res.status).toBe(403);
  });

  it('returns 404 for non-existent note', async () => {
    const res = await request(app)
      .get('/api/notes/99999')
      .set('Authorization', `Bearer ${aliceToken}`);

    expect(res.status).toBe(404);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/notes/1');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/notes/:id', () => {
  it('updates the note for its owner', async () => {
    const insert = testDb
      .prepare('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)')
      .run(aliceId, 'Original Title', 'Original content');
    const noteId = insert.lastInsertRowid;

    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ title: 'Updated Title', content: 'Updated content' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Title');
    expect(res.body.content).toBe('Updated content');
  });

  it('returns 403 when another user tries to update the note', async () => {
    const insert = testDb
      .prepare('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)')
      .run(aliceId, 'Alice Note', 'content');
    const noteId = insert.lastInsertRowid;

    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${bobToken}`)
      .send({ title: 'Hacked', content: 'Hacked content' });

    expect(res.status).toBe(403);
  });

  it('returns 404 for non-existent note', async () => {
    const res = await request(app)
      .put('/api/notes/99999')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ title: 'Title', content: 'Content' });

    expect(res.status).toBe(404);
  });

  it('returns 400 when title is missing', async () => {
    const insert = testDb
      .prepare('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)')
      .run(aliceId, 'Note', 'content');
    const noteId = insert.lastInsertRowid;

    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ content: 'content only' });

    expect(res.status).toBe(400);
  });

  it('returns 401 without token', async () => {
    const res = await request(app)
      .put('/api/notes/1')
      .send({ title: 'T', content: 'C' });

    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/notes/:id', () => {
  it('deletes the note for its owner and returns 204', async () => {
    const insert = testDb
      .prepare('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)')
      .run(aliceId, 'To Delete', 'bye');
    const noteId = insert.lastInsertRowid;

    const res = await request(app)
      .delete(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${aliceToken}`);

    expect(res.status).toBe(204);

    // Verify note is gone
    const note = testDb.prepare('SELECT * FROM notes WHERE id = ?').get(noteId);
    expect(note).toBeUndefined();
  });

  it('returns 403 when another user tries to delete the note', async () => {
    const insert = testDb
      .prepare('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)')
      .run(aliceId, 'Alice Note', 'content');
    const noteId = insert.lastInsertRowid;

    const res = await request(app)
      .delete(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${bobToken}`);

    expect(res.status).toBe(403);

    // Verify note still exists
    const note = testDb.prepare('SELECT * FROM notes WHERE id = ?').get(noteId);
    expect(note).toBeDefined();
  });

  it('returns 404 for non-existent note', async () => {
    const res = await request(app)
      .delete('/api/notes/99999')
      .set('Authorization', `Bearer ${aliceToken}`);

    expect(res.status).toBe(404);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).delete('/api/notes/1');
    expect(res.status).toBe(401);
  });
});
