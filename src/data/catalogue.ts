// The resistance band workouts, the programs, and the choices of the start screen.
// The drawings are from workout-guide by Bryl Lim (CC BY-SA 4.0), derived from Everkinetic (CC BY-SA 4.0).
import workoutsJson from './workouts.json';
import programsJson from './programs.json';

export type Direction = 'left' | 'right';
export type Target = 'full' | 'upper' | 'lower' | 'core';

// One exercise (or the rest between two of them)
export type Workout = {
  id: number;
  // the name of the animation file, and the key of the exercise
  woname: string;
  displayname: string;
  wodirection: Direction;
  // seconds
  duration: number;
  targetarea: string;
};

// A program: a routine of exercise ids, with a rest (id 0) between each one
export type Program = { id: number; target: Target; routine: number[] };

export const REST_ID = 0;
// when a routine names an exercise that is not there, this one is used instead (id 7 is the banded squat)
export const FALLBACK_ID = 7;
export const REST_SECONDS = 30;

export const WORKOUTS: Workout[] = workoutsJson as Workout[];
export const PROGRAMS: Program[] = programsJson as Program[];

export const TARGETS: Array<{ id: Target; label: string }> = [
  { id: 'full', label: 'Full body' },
  { id: 'upper', label: 'Upper body' },
  { id: 'lower', label: 'Lower body' },
  { id: 'core', label: 'Core' },
];

// The length of the session: how many programs are put together. One program lasts 6 min 30 s.
export const DURATIONS: Array<{ programs: number; label: string }> = [
  { programs: 1, label: '12 min' },
  { programs: 2, label: '24 min' },
  { programs: 3, label: '36 min' },
  { programs: 4, label: '48 min' },
];

export const workoutById = (id: number): Workout => WORKOUTS.find((w) => w.id === id) ?? WORKOUTS.find((w) => w.id === FALLBACK_ID)!;
