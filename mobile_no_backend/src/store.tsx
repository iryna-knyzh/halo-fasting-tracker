import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ActiveFast, FastSession } from './types';
import * as storage from './storage';

interface HaloState {
  ready: boolean;
  name: string | null;
  goalHours: number;
  fast: ActiveFast | null;
  history: FastSession[];
  setName: (n: string) => void;
  setGoal: (h: number) => void;
  startFast: () => void;
  endFast: () => void;
  deleteSession: (start: number) => void;
  clearHistory: () => void;
  resetAll: () => void;
}

const Ctx = createContext<HaloState | null>(null);

export function useHalo(): HaloState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useHalo must be used within HaloProvider');
  return v;
}

export function HaloProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [name, setNameState] = useState<string | null>(null);
  const [goalHours, setGoalState] = useState(16);
  const [fast, setFast] = useState<ActiveFast | null>(null);
  const [history, setHistory] = useState<FastSession[]>([]);

  useEffect(() => {
    storage.loadState().then((s) => {
      setNameState(s.name);
      setGoalState(s.goalHours);
      setFast(s.fast);
      setHistory(s.history);
      setReady(true);
    });
  }, []);

  const setName = (n: string) => {
    const trimmed = n.trim();
    setNameState(trimmed);
    storage.saveName(trimmed);
  };

  const setGoal = (h: number) => {
    setGoalState(h);
    storage.saveGoal(h);
  };

  const startFast = () => {
    const f: ActiveFast = { start: Date.now() };
    setFast(f);
    storage.saveFast(f);
  };

  const endFast = () => {
    if (!fast) return;
    const end = Date.now();
    const session: FastSession = { start: fast.start, end, duration: end - fast.start };
    const next = [session, ...history];
    setHistory(next);
    setFast(null);
    storage.saveHistory(next);
    storage.saveFast(null);
  };

  const deleteSession = (start: number) => {
    const next = history.filter((s) => s.start !== start);
    setHistory(next);
    storage.saveHistory(next);
  };

  const clearHistory = () => {
    setHistory([]);
    storage.saveHistory([]);
  };

  const resetAll = () => {
    setNameState(null);
    setGoalState(16);
    setFast(null);
    setHistory([]);
    storage.clearAll();
  };

  return (
    <Ctx.Provider
      value={{ ready, name, goalHours, fast, history, setName, setGoal, startFast, endFast, deleteSession, clearHistory, resetAll }}
    >
      {children}
    </Ctx.Provider>
  );
}
