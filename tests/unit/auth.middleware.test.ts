import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware, JWT_SECRET } from '../../src/middleware/auth';
import { JwtPayload } from '../../src/types';

/**
 * Unit tests for authMiddleware.
 * Tests the middleware in isolation using mock Request/Response objects
 * without spinning up an HTTP server.
 */

function makeReq(authHeader?: string): Partial<Request> {
  return {
    headers: authHeader ? { authorization: authHeader } : {},
  };
}

function makeRes(): { res: Partial<Response>; statusCode: number | null; body: unknown } {
  const ctx = { statusCode: null as number | null, body: null as unknown };
  const res: Partial<Response> = {
    status(code: number) {
      ctx.statusCode = code;
      return this as Response;
    },
    json(data: unknown) {
      ctx.body = data;
      return this as Response;
    },
  };
  return { res, statusCode: ctx.statusCode, body: ctx.body };
}

describe('authMiddleware', () => {
  let next: jest.Mock<NextFunction>;

  beforeEach(() => {
    next = jest.fn();
  });

  describe('missing or malformed Authorization header', () => {
    it('returns 401 when Authorization header is absent', () => {
      const req = makeReq();
      const { res, ...ctx } = makeRes();
      let capturedStatus: number | null = null;
      let capturedBody: unknown = null;
      const mockRes = {
        status: (code: number) => {
          capturedStatus = code;
          return mockRes;
        },
        json: (body: unknown) => {
          capturedBody = body;
          return mockRes;
        },
      } as unknown as Response;

      authMiddleware(req as Request, mockRes, next as unknown as NextFunction);

      expect(capturedStatus).toBe(401);
      expect(capturedBody).toEqual({ error: 'Missing or invalid authorization header' });
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when Authorization header does not start with "Bearer "', () => {
      const req = makeReq('Token abc123');
      let capturedStatus: number | null = null;
      let capturedBody: unknown = null;
      const mockRes = {
        status: (code: number) => { capturedStatus = code; return mockRes; },
        json: (body: unknown) => { capturedBody = body; return mockRes; },
      } as unknown as Response;

      authMiddleware(req as Request, mockRes, next as unknown as NextFunction);

      expect(capturedStatus).toBe(401);
      expect(capturedBody).toEqual({ error: 'Missing or invalid authorization header' });
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when Authorization header is "Bearer" with no token', () => {
      const req = makeReq('Bearer');
      let capturedStatus: number | null = null;
      let capturedBody: unknown = null;
      const mockRes = {
        status: (code: number) => { capturedStatus = code; return mockRes; },
        json: (body: unknown) => { capturedBody = body; return mockRes; },
      } as unknown as Response;

      authMiddleware(req as Request, mockRes, next as unknown as NextFunction);

      // "Bearer" doesn't start with "Bearer " (with a trailing space)
      expect(capturedStatus).toBe(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('invalid or expired tokens', () => {
    it('returns 401 for a completely invalid token string', () => {
      const req = makeReq('Bearer not.a.jwt');
      let capturedStatus: number | null = null;
      let capturedBody: unknown = null;
      const mockRes = {
        status: (code: number) => { capturedStatus = code; return mockRes; },
        json: (body: unknown) => { capturedBody = body; return mockRes; },
      } as unknown as Response;

      authMiddleware(req as Request, mockRes, next as unknown as NextFunction);

      expect(capturedStatus).toBe(401);
      expect(capturedBody).toEqual({ error: 'Invalid or expired token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 for a token signed with a different secret', () => {
      const wrongToken = jwt.sign({ id: 1, email: 'x@x.com', name: null }, 'wrong-secret');
      const req = makeReq(`Bearer ${wrongToken}`);
      let capturedStatus: number | null = null;
      const mockRes = {
        status: (code: number) => { capturedStatus = code; return mockRes; },
        json: () => mockRes,
      } as unknown as Response;

      authMiddleware(req as Request, mockRes, next as unknown as NextFunction);

      expect(capturedStatus).toBe(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 for an expired token', () => {
      const expiredToken = jwt.sign(
        { id: 1, email: 'x@x.com', name: null },
        JWT_SECRET,
        { expiresIn: -1 } // already expired
      );
      const req = makeReq(`Bearer ${expiredToken}`);
      let capturedStatus: number | null = null;
      const mockRes = {
        status: (code: number) => { capturedStatus = code; return mockRes; },
        json: () => mockRes,
      } as unknown as Response;

      authMiddleware(req as Request, mockRes, next as unknown as NextFunction);

      expect(capturedStatus).toBe(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('valid token', () => {
    it('calls next() and attaches user payload to req.user', () => {
      const payload: JwtPayload = { id: 42, email: 'user@example.com', name: 'Alice' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      const req = makeReq(`Bearer ${token}`) as Request;
      const mockRes = {} as Response;

      authMiddleware(req, mockRes, next as unknown as NextFunction);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.user).toMatchObject(payload);
    });

    it('attaches user with null name when name is null in token', () => {
      const payload: JwtPayload = { id: 7, email: 'anon@example.com', name: null };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      const req = makeReq(`Bearer ${token}`) as Request;
      const mockRes = {} as Response;

      authMiddleware(req, mockRes, next as unknown as NextFunction);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.user).toMatchObject({ id: 7, email: 'anon@example.com', name: null });
    });
  });
});
