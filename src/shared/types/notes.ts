export interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface NoteRequest {
  title: string;
  content: string;
}

export interface ApiError {
  error: string;
}
