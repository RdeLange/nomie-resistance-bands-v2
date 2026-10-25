// The sessions that were run, kept in the plugin's storage, so the start screen can show the week.
import type { Target } from './data/catalogue';

export type Entry = {
  // the moment the session ended, as an ISO date
  at: string;
  // the minutes that were run
  minutes: number;
  target: Target;
  // the exercises that were finished, and how many there were
  completed: number;
  exercises: number;
  early: boolean;
};

export const HISTORY_LIMIT = 200;

// Keeps the saved entries that are well formed, newest first, and no more than the limit
export const normaliseHistory = (saved: unknown): Entry[] => {
  if (!Array.isArray(saved)) return [];
  return saved
    .filter((e: any) => typeof e?.at === 'string' && !isNaN(Date.parse(e.at)) && typeof e.minutes === 'number')
    .map((e: any) => ({
      at: e.at,
      minutes: e.minutes,
      target: e.target,
      completed: Number(e.completed) || 0,
      exercises: Number(e.exercises) || 0,
      early: e.early === true,
    }))
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, HISTORY_LIMIT);
};

export const addEntry = (history: Entry[], entry: Entry): Entry[] => [entry, ...history].slice(0, HISTORY_LIMIT);

// The Monday of the week of `now`, at local midnight. Weeks start on Monday, as in the rest of Nomie's week views.
export const startOfWeek = (now: Date): Date => {
  const day = (now.getDay() + 6) % 7;
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
};

// The sessions finished in the week of `now`, and the minutes they took
export const thisWeek = (history: Entry[], now: Date): { sessions: number; minutes: number } => {
  const from = startOfWeek(now).getTime();
  const inWeek = history.filter((e) => Date.parse(e.at) >= from && !e.early);
  return { sessions: inWeek.length, minutes: Math.round(inWeek.reduce((sum, e) => sum + e.minutes, 0)) };
};
