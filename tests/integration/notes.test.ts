import { createTestDb, clearTestDb } from '../helpers/testDb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../src/middleware/auth';

/**
 * Integration tests for /api/notes CRUD endpoints.
 * Covers authentication guards, happy paths, edge cases, and ownership isolation.
 */

const testDb = createTestDb();

jest.mock('../../src/db', () => ({ __esModule: true, default: testDb }));

import request from 'supertest';
import app from '../helpers/app';

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeToken(id: number, email: string, name: string | null): string {
  return jwt.sign({ id, email, name }, JWT_SECRET, { expiresIn: '1h' });
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ── Fixtures ─────────────────────────────────────────────────────────────────

let aliceId: number;
let aliceToken: string;
let bobId: number;
let bobToken: string;

beforeAll(async () => {
  const hash = await bcrypt.hash('password', 10);

  const aliceRow = testDb
    .prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)')
    .run('alice@notes.test', hash, 'Alice');
  aliceId = Number(aliceRow.lastInsertRowid);
  aliceToken = makeToken(aliceId, 'alice@notes.test', 'Alice');

  const bobRow = testDb
    .prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)')
    .run('bob@notes.test', hash, 'Bob');
  bobId = Number(bobRow.lastInsertRowid);
  bobToken = makeToken(bobId, 'bob@notes.test', 'Bob');
});

beforeEach(() => {
  testDb.exec('DELETE FROM notes');
});

afterAll(() => {
  clearTestDb(testDb);
});

// ── Authentication guard tests ────────────────────────────────────────────────

describe('authentication guard', () => {
  const endpoints = [
    { method: 'get', path: '/api/notes' },
    { method: 'post', path: '/api/notes' },
    { method: 'put', path: '/api/notes/1' },
    { method: 'delete', path: '/api/notes/1' },
  ] as const;

  endpoints.forEach(({ method, path }) => {
    it(`${method.toUpperCase()} ${path} returns 401 with no token`, async () => {
      const res = await (request(app) as any)[method](path);
      expect(res.status).toBe(401);
    });

    it(`${method.toUpperCase()} ${path} returns 401 with invalid token`, async () => {
      const res = await (request(app) as any)[method](path)
        .set('Authorization', 'Bearer not-a-jwt');
      expect(res.status).toBe(401);
    });
  });
});

// ── GET /api/notes ────────────────────────────────────────────────────────────

describe('GET /api/notes', () => {
  it('returns empty array when user has no notes', async () => {
    const res = await request(app)
      .get('/api/notes')
      .set(authHeader(aliceToken));

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns only the authenticated user\'s notes, not other users\'', async () => {
    testDb
      .prepare('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)')
      .run(aliceId, 'Alice note', 'alice content');
    testDb
      .prepare('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)')
      .run(bobId, 'Bob note', 'bob content');

    const res = await request(app)
      .get('/api/notes')
      .set(authHeader(aliceToken));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Alice note');
  });

  it('returns notes ordered by updated_at descending', async () => {
    // Insert with explicit updated_at to control ordering
    testDb
      .prepare("INSERT INTO notes (user_id, title, content, updated_at) VALUES (?, ?, ?, ?)")
      .run(aliceId, 'Older', '', '2025-01-01 00:00:00');
    testDb
      .prepare("INSERT INTO notes (user_id, title, content, updated_at) VALUES (?, ?, ?, ?)")
      .run(aliceId, 'Newer', '', '2025-06-01 00:00:00');

    const res = await request(app)
      .get('/api/notes')
      .set(authHeader(aliceToken));

    expect(res.status).toBe(200);
    expect(res.body[0].title).toBe('Newer');
    expect(res.body[1].title).toBe('Older');
  });

  it('returned note objects include expected fields', async () => {
    testDb
      .prepare('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)')
      .run(aliceId, 'Test Note', 'Test Content');

    const res = await request(app)
      .get('/api/notes')
      .set(authHeader(aliceToken));

    const note = res.body[0];
    expect(note).toHaveProperty('id');
    expect(note).toHaveProperty('user_id');
    expect(note).toHaveProperty('title', 'Test Note');
    expect(note).toHaveProperty('content', 'Test Content');
    expect(note).toHaveProperty('created_at');
    expect(note).toHaveProperty('updated_at');
  });
});

// ── POST /api/notes ───────────────────────────────────────────────────────────

describe('POST /api/notes', () => {
  it('creates a note with title and content, returns 201 with full note', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set(authHeader(aliceToken))
      .send({ title: 'My Note', content: 'Some content' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: 'My Note',
      content: 'Some content',
      user_id: aliceId,
    });
    expect(typeof res.body.id).toBe('number');
    expect(res.body).toHaveProperty('created_at');
    expect(res.body).toHaveProperty('updated_at');
  });

  it('creates a note with empty title and content when body is empty', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set(authHeader(aliceToken))
      .send({});

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('');
    expect(res.body.content).toBe('');
  });

  it('defaults missing title to empty string when only content provided', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set(authHeader(aliceToken))
      .send({ content: 'Only content' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('');
    expect(res.body.content).toBe('Only content');
  });

  it('defaults missing content to empty string when only title provided', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set(authHeader(aliceToken))
      .send({ title: 'Only title' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Only title');
    expect(res.body.content).toBe('');
  });

  it('associates the created note with the authenticated user', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set(authHeader(aliceToken))
      .send({ title: 'Alice owns this' });

    expect(res.body.user_id).toBe(aliceId);
  });
});

// ── PUT /api/notes/:id ────────────────────────────────────────────────────────

describe('PUT /api/notes/:id', () => {
  let noteId: number;

  beforeEach(() => {
    const row = testDb
      .prepare('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)')
      .run(aliceId, 'Original Title', 'Original Content');
    noteId = Number(row.lastInsertRowid);
  });

  it('updates both title and content, returns 200 with updated note', async () => {
    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .set(authHeader(aliceToken))
      .send({ title: 'Updated Title', content: 'Updated Content' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Title');
    expect(res.body.content).toBe('Updated Content');
  });

  it('partial update: updates only title, keeps existing content', async () => {
    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .set(authHeader(aliceToken))
      .send({ title: 'New Title Only' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('New Title Only');
    expect(res.body.content).toBe('Original Content');
  });

  it('partial update: updates only content, keeps existing title', async () => {
    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .set(authHeader(aliceToken))
      .send({ content: 'New Content Only' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Original Title');
    expect(res.body.content).toBe('New Content Only');
  });

  it('returns 404 when note id does not exist', async () => {
    const res = await request(app)
      .put('/api/notes/99999')
      .set(authHeader(aliceToken))
      .send({ title: 'Nope' });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Note not found');
  });

  it('returns 404 when note belongs to a different user (ownership isolation)', async () => {
    // Bob tries to update Alice's note
    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .set(authHeader(bobToken))
      .send({ title: 'Bob hijack attempt' });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Note not found');
  });

  it('returned note has updated updated_at timestamp', async () => {
    const original = testDb
      .prepare('SELECT updated_at FROM notes WHERE id = ?')
      .get(noteId) as { updated_at: string };

    // Small delay to ensure timestamp differs
    await new Promise((r) => setTimeout(r, 1000));

    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .set(authHeader(aliceToken))
      .send({ title: 'Timestamp check' });

    expect(res.status).toBe(200);
    expect(res.body.updated_at).not.toBe(original.updated_at);
  });
});

// ── DELETE /api/notes/:id ─────────────────────────────────────────────────────

describe('DELETE /api/notes/:id', () => {
  let noteId: number;

  beforeEach(() => {
    const row = testDb
      .prepare('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)')
      .run(aliceId, 'To be deleted', 'content');
    noteId = Number(row.lastInsertRowid);
  });

  it('deletes the note and returns 204 with no body', async () => {
    const res = await request(app)
      .delete(`/api/notes/${noteId}`)
      .set(authHeader(aliceToken));

    expect(res.status).toBe(204);
    expect(res.text).toBe('');
  });

  it('note is actually removed from the database after delete', async () => {
    await request(app)
      .delete(`/api/notes/${noteId}`)
      .set(authHeader(aliceToken));

    const remaining = testDb
      .prepare('SELECT id FROM notes WHERE id = ?')
      .get(noteId);
    expect(remaining).toBeUndefined();
  });

  it('returns 404 when note id does not exist', async () => {
    const res = await request(app)
      .delete('/api/notes/99999')
      .set(authHeader(aliceToken));

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Note not found');
  });

  it('returns 404 when note belongs to a different user (ownership isolation)', async () => {
    // Bob tries to delete Alice's note
    const res = await request(app)
      .delete(`/api/notes/${noteId}`)
      .set(authHeader(bobToken));

    expect(res.status).toBe(404);

    // Alice's note should still exist
    const stillExists = testDb
      .prepare('SELECT id FROM notes WHERE id = ?')
      .get(noteId);
    expect(stillExists).toBeTruthy();
  });
});
