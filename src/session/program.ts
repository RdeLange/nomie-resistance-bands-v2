// Builds the routine of a session: the programs of the chosen target, one after the other, with a rest between them.
import { PROGRAMS, REST_ID, type Program, type Target } from '../data/catalogue';

// A random number from 0 up to, not including, max
export type Random = (max: number) => number;
export const randomInt: Random = (max) => Math.floor(Math.random() * max);

// The programs of a target, in the order of the data
export const programsFor = (target: Target): Program[] => PROGRAMS.filter((p) => p.target === target);

// The routine of a session: `count` programs picked at random, each one followed by a rest, except the last
export const buildRoutine = (target: Target, count: number, random: Random = randomInt): number[] => {
  const choices = programsFor(target);
  if (choices.length === 0 || count < 1) return [];
  const picked = Array.from({ length: count }, () => choices[random(choices.length)]);
  return picked.flatMap((program, i) => (i === 0 ? program.routine : [REST_ID, ...program.routine]));
};
