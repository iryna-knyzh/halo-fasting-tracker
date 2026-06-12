import type { FastSession } from '@/types/fast.types';

export const pad = (n: number) => String(n).padStart(2, '0');

export const fmt = (ms: number) => {
  const t = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

export const dur = (ms: number) => {
  const t = Math.floor(ms / 60000);
  return `${Math.floor(t / 60)}h ${pad(t % 60)}m`;
};

export const timeStr = (t: number) =>
  new Date(t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export const dateStr = (t: number) =>
  new Date(t).toLocaleDateString([], { month: 'short', day: 'numeric' });

export const wd = (t: number) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(t).getDay()];

export const getInitials = (name: string, email: string) => {
  const src = (name || '').trim() || (email || '').trim();
  if (!src) return '?';
  const parts = src.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
};

export const seedHistory = (): FastSession[] => {
  const now = Date.now();
  const day = 86400000;
  const hrs = [16.3, 14.6, 17.4, 15.1, 18.2, 16.7, 13.9];
  return hrs.map((h, i) => {
    const end = now - i * day - 9 * 3.6e6;
    const duration = Math.round(h * 3.6e6);
    return { start: end - duration, end, duration };
  });
};
