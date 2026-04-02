// DB models
export interface User {
  id: number;
  username: string;
  password_hash: string;
}

export interface Note {
  id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// JWT payload
export interface JwtPayload {
  user_id: number;
  username: string;
  iat?: number;
  exp?: number;
}

// Authenticated request user
export interface AuthUser {
  id: number;
  username: string;
}

// Augment Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Request body types
export interface LoginRequestBody {
  username: string;
  password: string;
}

export interface NoteRequestBody {
  title: string;
  content: string;
}

// Response types
export interface LoginResponse {
  token: string;
}

export interface ErrorResponse {
  error: string;
}
