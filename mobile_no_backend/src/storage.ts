import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActiveFast, FastSession } from './types';

const KEYS = {
  name: 'halo.name',
  goal: 'halo.goal',
  fast: 'halo.fast',
  history: 'halo.history',
};

export interface PersistedState {
  name: string | null;
  goalHours: number;
  fast: ActiveFast | null;
  history: FastSession[];
}

export async function loadState(): Promise<PersistedState> {
  const [name, goal, fast, history] = await Promise.all([
    AsyncStorage.getItem(KEYS.name),
    AsyncStorage.getItem(KEYS.goal),
    AsyncStorage.getItem(KEYS.fast),
    AsyncStorage.getItem(KEYS.history),
  ]);
  return {
    name: name ?? null,
    goalHours: goal ? JSON.parse(goal) : 16,
    fast: fast ? JSON.parse(fast) : null,
    history: history ? JSON.parse(history) : [],
  };
}

export const saveName = (v: string) => AsyncStorage.setItem(KEYS.name, v);
export const saveGoal = (v: number) => AsyncStorage.setItem(KEYS.goal, JSON.stringify(v));
export const saveFast = (v: ActiveFast | null) =>
  v ? AsyncStorage.setItem(KEYS.fast, JSON.stringify(v)) : AsyncStorage.removeItem(KEYS.fast);
export const saveHistory = (v: FastSession[]) =>
  AsyncStorage.setItem(KEYS.history, JSON.stringify(v));
export const clearAll = () => AsyncStorage.multiRemove(Object.values(KEYS));
