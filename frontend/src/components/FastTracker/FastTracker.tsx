'use client';

import { useEffect, useRef, useState } from 'react';
import type { User, FastSession, ActiveFast } from '@/types/fast.types';
import { apiClient, tokenStore, setUnauthorizedCallback, type AuthResponse } from '@/lib/api-client';
import { AuthScreen } from '../AuthScreen';
import { AppScreen } from '../AppScreen';
import styles from './FastTracker.module.scss';

export function FastTracker() {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<FastSession[]>([]);
  const [fast, setFast] = useState<ActiveFast | null>(null);
  const [goalHours, setGoalHours] = useState(16);
  const [now, setNow] = useState(Date.now());
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Force-logout when both tokens expire (triggered from api-client)
    setUnauthorizedCallback(() => {
      setUser(null);
      setHistory([]);
      setFast(null);
      try { localStorage.removeItem('sft_user'); localStorage.removeItem('sft_fast'); } catch { /* ignore */ }
    });

    try {
      const f = localStorage.getItem('sft_fast');
      const g = localStorage.getItem('sft_goal');
      const u = localStorage.getItem('sft_user');
      if (f) setFast(JSON.parse(f));
      if (g) setGoalHours(JSON.parse(g));
      if (u) setUser(JSON.parse(u));
    } catch { /* ignore */ }

    setMounted(true);
    intervalRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Load history from DB whenever user changes
  useEffect(() => {
    if (!user) { setHistory([]); return; }
    apiClient.fasting.getAll()
      .then(sessions => setHistory(sessions.map(s => ({ id: s.id, start: s.start, end: s.end, duration: s.duration }))))
      .catch(() => { /* ignore — tokens might still be loading */ });
  }, [user]);

  const handleLogin = ({ user: authUser, accessToken, refreshToken }: AuthResponse) => {
    const u: User = { id: authUser.id, name: authUser.name, email: authUser.email };
    setUser(u);
    tokenStore.set(accessToken, refreshToken);
    try { localStorage.setItem('sft_user', JSON.stringify(u)); } catch { /* ignore */ }
  };

  const handleLogout = async () => {
    try { await apiClient.auth.logout(); } catch { /* ignore — best effort */ }
    setUser(null);
    setHistory([]);
    setFast(null);
    tokenStore.clear();
    try {
      localStorage.removeItem('sft_user');
      localStorage.removeItem('sft_fast');
    } catch { /* ignore */ }
  };

  const handleStart = () => {
    const f: ActiveFast = { start: Date.now() };
    setFast(f);
    setNow(Date.now());
    try { localStorage.setItem('sft_fast', JSON.stringify(f)); } catch { /* ignore */ }
  };

  const handleEnd = async () => {
    if (!fast) return;
    const end = Date.now();
    const duration = end - fast.start;

    // Optimistically update UI
    const tempSession: FastSession = { start: fast.start, end, duration };
    setFast(null);
    setHistory(prev => [tempSession, ...prev]);
    try { localStorage.removeItem('sft_fast'); } catch { /* ignore */ }

    try {
      const saved = await apiClient.fasting.create({ start: fast.start, end, duration });
      setHistory(prev => prev.map(s =>
        s === tempSession ? { id: saved.id, start: saved.start, end: saved.end, duration: saved.duration } : s
      ));
    } catch { /* session stays in local state if save fails */ }
  };

  const handleClear = async () => {
    setHistory([]);
    try { await apiClient.fasting.clearAll(); } catch { /* ignore */ }
  };

  const handleSetGoal = (h: number) => {
    setGoalHours(h);
    try { localStorage.setItem('sft_goal', JSON.stringify(h)); } catch { /* ignore */ }
  };

  if (!mounted) return null;

  return (
    <div className={styles.page}>
      {!user ? (
        <AuthScreen onLogin={handleLogin} />
      ) : (
        <AppScreen
          user={user}
          history={history}
          fast={fast}
          goalHours={goalHours}
          now={now}
          onLogout={handleLogout}
          onStart={handleStart}
          onEnd={handleEnd}
          onClear={handleClear}
          onSetGoal={handleSetGoal}
        />
      )}
    </div>
  );
}
