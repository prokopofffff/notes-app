import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from '../src/lib/api';

const BASE_URL = 'http://localhost:3001/api';

const mockNote = {
  id: 1,
  title: 'Test Note',
  content: 'Test content',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  // Reset localStorage
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function mockOk(body: unknown, status = 200): Response {
  return {
    ok: true,
    status,
    json: async () => body,
  } as unknown as Response;
}

function mockError(status: number, errorBody: unknown): Response {
  return {
    ok: false,
    status,
    statusText: `Error ${status}`,
    json: async () => errorBody,
  } as unknown as Response;
}

function mockNoContent(): Response {
  return {
    ok: true,
    status: 204,
    json: async () => { throw new Error('No content'); },
  } as unknown as Response;
}

describe('api.login', () => {
  it('POSTs to /api/auth/login and returns token', async () => {
    mockFetch.mockResolvedValue(mockOk({ token: 'my-jwt-token' }));

    const result = await api.login({ username: 'alice', password: 'alice123' });

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/auth/login`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'alice', password: 'alice123' }),
      })
    );
    expect(result).toEqual({ token: 'my-jwt-token' });
  });

  it('throws an error on 401 with error message from body', async () => {
    mockFetch.mockResolvedValue(mockError(401, { error: 'Invalid credentials' }));

    await expect(api.login({ username: 'alice', password: 'wrong' }))
      .rejects.toThrow('Invalid credentials');
  });

  it('throws an error on 400 with error message from body', async () => {
    mockFetch.mockResolvedValue(mockError(400, { error: 'Username and password are required' }));

    await expect(api.login({ username: '', password: '' }))
      .rejects.toThrow('Username and password are required');
  });

  it('falls back to statusText when error body has no error field', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({}),
    } as unknown as Response);

    await expect(api.login({ username: 'x', password: 'y' }))
      .rejects.toThrow('Internal Server Error');
  });
});

describe('api.getNotes', () => {
  it('GETs /api/notes with auth header', async () => {
    localStorage.setItem('token', 'test-token');
    mockFetch.mockResolvedValue(mockOk([mockNote]));

    const result = await api.getNotes();

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/notes`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
    expect(result).toEqual([mockNote]);
  });

  it('GETs /api/notes without auth header when no token', async () => {
    mockFetch.mockResolvedValue(mockOk([]));

    await api.getNotes();

    const callHeaders = mockFetch.mock.calls[0][1].headers as Record<string, string>;
    expect(callHeaders['Authorization']).toBeUndefined();
  });

  it('returns empty array when user has no notes', async () => {
    mockFetch.mockResolvedValue(mockOk([]));
    const result = await api.getNotes();
    expect(result).toEqual([]);
  });

  it('throws on error response', async () => {
    mockFetch.mockResolvedValue(mockError(401, { error: 'Unauthorized' }));
    await expect(api.getNotes()).rejects.toThrow('Unauthorized');
  });
});

describe('api.getNote', () => {
  it('GETs /api/notes/:id with auth header', async () => {
    localStorage.setItem('token', 'test-token');
    mockFetch.mockResolvedValue(mockOk(mockNote));

    const result = await api.getNote(1);

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/notes/1`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
    expect(result).toEqual(mockNote);
  });

  it('throws 404 error for non-existent note', async () => {
    mockFetch.mockResolvedValue(mockError(404, { error: 'Note not found' }));
    await expect(api.getNote(9999)).rejects.toThrow('Note not found');
  });

  it('throws 403 error when accessing another user\'s note', async () => {
    mockFetch.mockResolvedValue(mockError(403, { error: 'Forbidden' }));
    await expect(api.getNote(1)).rejects.toThrow('Forbidden');
  });
});

describe('api.createNote', () => {
  it('POSTs to /api/notes and returns the created note', async () => {
    localStorage.setItem('token', 'test-token');
    mockFetch.mockResolvedValue(mockOk(mockNote, 201));

    const result = await api.createNote({ title: 'Test Note', content: 'Test content' });

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/notes`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        }),
        body: JSON.stringify({ title: 'Test Note', content: 'Test content' }),
      })
    );
    expect(result).toEqual(mockNote);
  });

  it('throws 400 error on validation failure', async () => {
    mockFetch.mockResolvedValue(mockError(400, { error: 'Title and content are required' }));
    await expect(api.createNote({ title: '', content: '' }))
      .rejects.toThrow('Title and content are required');
  });

  it('throws 401 error when unauthenticated', async () => {
    mockFetch.mockResolvedValue(mockError(401, { error: 'Unauthorized' }));
    await expect(api.createNote({ title: 'T', content: 'C' }))
      .rejects.toThrow('Unauthorized');
  });
});

describe('api.updateNote', () => {
  it('PUTs to /api/notes/:id and returns updated note', async () => {
    localStorage.setItem('token', 'test-token');
    const updated = { ...mockNote, title: 'Updated', content: 'Updated content' };
    mockFetch.mockResolvedValue(mockOk(updated));

    const result = await api.updateNote(1, { title: 'Updated', content: 'Updated content' });

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/notes/1`,
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
        body: JSON.stringify({ title: 'Updated', content: 'Updated content' }),
      })
    );
    expect(result).toEqual(updated);
  });

  it('throws 403 when updating another user\'s note', async () => {
    mockFetch.mockResolvedValue(mockError(403, { error: 'Forbidden' }));
    await expect(api.updateNote(1, { title: 'T', content: 'C' }))
      .rejects.toThrow('Forbidden');
  });

  it('throws 404 when note not found', async () => {
    mockFetch.mockResolvedValue(mockError(404, { error: 'Note not found' }));
    await expect(api.updateNote(9999, { title: 'T', content: 'C' }))
      .rejects.toThrow('Note not found');
  });
});

describe('api.deleteNote', () => {
  it('DELETEs /api/notes/:id and returns undefined on 204', async () => {
    localStorage.setItem('token', 'test-token');
    mockFetch.mockResolvedValue(mockNoContent());

    const result = await api.deleteNote(1);

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/notes/1`,
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
    expect(result).toBeUndefined();
  });

  it('throws 403 when deleting another user\'s note', async () => {
    mockFetch.mockResolvedValue(mockError(403, { error: 'Forbidden' }));
    await expect(api.deleteNote(1)).rejects.toThrow('Forbidden');
  });

  it('throws 404 when note not found', async () => {
    mockFetch.mockResolvedValue(mockError(404, { error: 'Note not found' }));
    await expect(api.deleteNote(9999)).rejects.toThrow('Note not found');
  });

  it('throws 401 when unauthenticated', async () => {
    mockFetch.mockResolvedValue(mockError(401, { error: 'Unauthorized' }));
    await expect(api.deleteNote(1)).rejects.toThrow('Unauthorized');
  });
});
