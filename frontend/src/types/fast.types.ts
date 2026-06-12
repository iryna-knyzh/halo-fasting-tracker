export type User = { id: number; name: string; email: string };
export type FastSession = { id?: number; start: number; end: number; duration: number };
export type ActiveFast = { start: number };
export type AuthMode = 'login' | 'register';
