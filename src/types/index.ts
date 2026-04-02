export interface User {
  id: number;
  email: string;
  password: string;
  name: string | null;
}

export interface Note {
  id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface JwtPayload {
  id: number;
  email: string;
  name: string | null;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface NoteRequestBody {
  title?: string;
  content?: string;
}
