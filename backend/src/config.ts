import type { SignOptions } from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export const JWT_SECRET: string = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN: SignOptions['expiresIn'] = '24h';
export const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
export const FRONTEND_ORIGIN: string = process.env.FRONTEND_ORIGIN ?? 'http://localhost:4321';
