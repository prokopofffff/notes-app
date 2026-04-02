export const JWT_SECRET: string = process.env.JWT_SECRET ?? 'notes-app-secret-key-change-in-production';
export const JWT_EXPIRES_IN: string = '24h';
export const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
export const FRONTEND_ORIGIN: string = process.env.FRONTEND_ORIGIN ?? 'http://localhost:4321';
