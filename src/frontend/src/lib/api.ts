import type { Note, LoginRequest, LoginResponse, NoteRequest } from '../../../shared/types/notes';

const BASE_URL = 'http://localhost:3001/api';

function getToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((body as { error?: string }).error ?? res.statusText);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export const api = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<LoginResponse>(res);
  },

  async getNotes(): Promise<Note[]> {
    const res = await fetch(`${BASE_URL}/notes`, { headers: authHeaders() });
    return handleResponse<Note[]>(res);
  },

  async getNote(id: number): Promise<Note> {
    const res = await fetch(`${BASE_URL}/notes/${id}`, { headers: authHeaders() });
    return handleResponse<Note>(res);
  },

  async createNote(data: NoteRequest): Promise<Note> {
    const res = await fetch(`${BASE_URL}/notes`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Note>(res);
  },

  async updateNote(id: number, data: NoteRequest): Promise<Note> {
    const res = await fetch(`${BASE_URL}/notes/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Note>(res);
  },

  async deleteNote(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/notes/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse<void>(res);
  },
};
