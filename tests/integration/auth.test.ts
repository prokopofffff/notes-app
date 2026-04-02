import { createTestDb, clearTestDb } from '../helpers/testDb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../../src/types';

/**
 * Integration tests for POST /api/auth/login.
 * Uses an in-memory SQLite database to avoid touching the real notes.db.
 */

const testDb = createTestDb();

jest.mock('../../src/db', () => ({ __esModule: true, default: testDb }));

import request from 'supertest';
import app from '../helpers/app';

const TEST_USER = {
  email: 'alice@example.com',
  password: 'securepassword',
  name: 'Alice',
};

beforeAll(async () => {
  const hash = await bcrypt.hash(TEST_USER.password, 10);
  testDb
    .prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)')
    .run(TEST_USER.email, hash, TEST_USER.name);
});

afterAll(() => {
  clearTestDb(testDb);
});

describe('POST /api/auth/login', () => {
  describe('input validation', () => {
    it('returns 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'whatever' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'x@x.com' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 when both fields are missing (empty body)', async () => {
      const res = await request(app).post('/api/auth/login').send({});

      expect(res.status).toBe(400);
    });
  });

  describe('credential validation', () => {
    it('returns 401 when email does not exist in DB', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'password' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('returns 401 when email is correct but password is wrong', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_USER.email, password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('successful login', () => {
    it('returns 200 with a JWT token and user object on valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_USER.email, password: TEST_USER.password });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
    });

    it('returned token is a valid signed JWT containing user id, email, and name', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_USER.email, password: TEST_USER.password });

      const decoded = jwt.decode(res.body.token) as JwtPayload & { iat: number; exp: number };
      expect(decoded.email).toBe(TEST_USER.email);
      expect(decoded.name).toBe(TEST_USER.name);
      expect(typeof decoded.id).toBe('number');
      expect(decoded.exp).toBeGreaterThan(decoded.iat); // token has an expiry
    });

    it('returned user object does not include password hash', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_USER.email, password: TEST_USER.password });

      expect(res.body.user).not.toHaveProperty('password');
    });

    it('returned user object contains id, email, and name', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_USER.email, password: TEST_USER.password });

      expect(res.body.user).toMatchObject({
        email: TEST_USER.email,
        name: TEST_USER.name,
      });
      expect(typeof res.body.user.id).toBe('number');
    });
  });

  describe('user with null name', () => {
    beforeAll(async () => {
      const hash = await bcrypt.hash('pass', 10);
      testDb
        .prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)')
        .run('noname@example.com', hash, null);
    });

    it('returns 200 and user.name is null when name was not set', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'noname@example.com', password: 'pass' });

      expect(res.status).toBe(200);
      expect(res.body.user.name).toBeNull();
    });
  });
});
