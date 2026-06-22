import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { api, tokenStore, storage, setUnauthorized, AuthResponse } from './src/api';
import { User, FastSession, ActiveFast } from './src/types';
import { AuthScreen } from './src/screens/AuthScreen';
import { AppScreen } from './src/screens/AppScreen';
import { colors } from './src/theme';

const FAST_KEY = 'sftFast';
const GOAL_KEY = 'sftGoal';

export default function App() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<FastSession[]>([]);
  const [fast, setFast] = useState<ActiveFast | null>(null);
  const [goalHours, setGoalHours] = useState(16);
  const [now, setNow] = useState(Date.now());

  // tick every second
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // boot: restore local state + session
  useEffect(() => {
    setUnauthorized(() => {
      setUser(null);
      setHistory([]);
      setFast(null);
    });

    (async () => {
      try {
        const f = await storage.get(FAST_KEY);
        const g = await storage.get(GOAL_KEY);
        if (f) setFast(JSON.parse(f));
        if (g) setGoalHours(JSON.parse(g));

        const token = await tokenStore.getAccess();
        if (token) {
          const me = await api.users.me();
          setUser({ id: me.id, name: me.name, email: me.email });
        }
      } catch {
        // not logged in / token invalid — stay on auth screen
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // load history whenever the user changes
  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }
    api.fasting
      .getAll()
      .then((s) => setHistory(s.map((x) => ({ id: x.id, start: x.start, end: x.end, duration: x.duration }))))
      .catch(() => {});
  }, [user]);

  const handleAuthed = async ({ user: u, accessToken, refreshToken }: AuthResponse) => {
    await tokenStore.set(accessToken, refreshToken);
    setUser({ id: u.id, name: u.name, email: u.email });
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // best effort
    }
    await tokenStore.clear();
    setUser(null);
    setHistory([]);
    setFast(null);
  };

  const handleStart = async () => {
    const f: ActiveFast = { start: Date.now() };
    setFast(f);
    setNow(Date.now());
    await storage.set(FAST_KEY, JSON.stringify(f));
  };

  const handleEnd = async () => {
    if (!fast) return;
    const end = Date.now();
    const duration = end - fast.start;

    const temp: FastSession = { start: fast.start, end, duration };
    setFast(null);
    setHistory((prev) => [temp, ...prev]);
    await storage.del(FAST_KEY);

    try {
      const saved = await api.fasting.create({ start: fast.start, end, duration });
      setHistory((prev) =>
        prev.map((s) =>
          s === temp ? { id: saved.id, start: saved.start, end: saved.end, duration: saved.duration } : s,
        ),
      );
    } catch {
      // stays in local state if save fails
    }
  };

  const handleClear = async () => {
    setHistory([]);
    try {
      await api.fasting.clearAll();
    } catch {
      // ignore
    }
  };

  const handleSetGoal = async (h: number) => {
    setGoalHours(h);
    await storage.set(GOAL_KEY, JSON.stringify(h));
  };

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <>
      {user ? (
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
      ) : (
        <AuthScreen onAuthed={handleAuthed} />
      )}
      <StatusBar style="dark" />
    </>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
