import { createTestDb } from '../helpers/testDb';

/**
 * Integration tests for GET /api/health.
 * The health endpoint requires no auth and must always return 200.
 */

const testDb = createTestDb();

jest.mock('../../src/db', () => ({ __esModule: true, default: testDb }));

import request from 'supertest';
import app from '../helpers/app';

describe('GET /api/health', () => {
  it('returns 200 with status ok — no auth required', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('returns 200 even when Authorization header is present', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
