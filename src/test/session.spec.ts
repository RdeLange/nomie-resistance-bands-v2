import { describe, expect, it } from 'vitest';
import { PROGRAMS, REST_ID, REST_SECONDS, WORKOUTS, workoutById } from '../data/catalogue';
import { buildRoutine, programsFor } from '../session/program';
import { Clock, WorkoutSession, buildSchedule, positionAt, RESTART_AFTER_MS } from '../session/session';
import { logText, sessionNote, targetLabel } from '../log';
import { addEntry, normaliseHistory, startOfWeek, thisWeek, type Entry } from '../history';
import { DEFAULT_SETTINGS, normaliseSettings } from '../settings';

// a short routine: exercise 30 s, rest 10 s, exercise 30 s
const routine = [1, REST_ID, 2];

describe('the catalogue', () => {
  it('has the workouts and the programs of v1, with the same ids', () => {
    expect(WORKOUTS.length).toBe(20);
    expect(PROGRAMS.length).toBe(22);
    expect(workoutById(7).woname).toBe('banded-squat');
  });

  it('falls back to the banded squat for an id that is not there', () => {
    expect(workoutById(999).woname).toBe('banded-squat');
  });
});

describe('the routine', () => {
  it('one program is one routine, two or more have a rest between them', () => {
    const one = buildRoutine('full', 1, () => 0);
    expect(one).toEqual(programsFor('full')[0].routine);
    const two = buildRoutine('full', 2, () => 0);
    expect(two).toEqual([...programsFor('full')[0].routine, REST_ID, ...programsFor('full')[0].routine]);
  });

  it('a session of one program lasts 6 min 30 s, as v1 did', () => {
    const schedule = buildSchedule(buildRoutine('core', 1, () => 0));
    const total = schedule[schedule.length - 1].end;
    expect(total).toBe(6.5 * 60 * 1000);
  });
});

describe('the schedule', () => {
  it('lays the exercises and the rests out one after the other, rests lasting 10 s', () => {
    const schedule = buildSchedule(routine);
    expect(schedule.map((s) => [s.start, s.end])).toEqual([
      [0, 30000],
      [30000, 30000 + REST_SECONDS * 1000],
      [40000, 70000],
    ]);
  });

  it('tells where the session is at a moment', () => {
    const schedule = buildSchedule(routine);
    expect(positionAt(schedule, 5000)).toMatchObject({ index: 0, inside: 5000, left: 25000, finished: false });
    expect(positionAt(schedule, 35000)).toMatchObject({ index: 1, inside: 5000, finished: false });
    expect(positionAt(schedule, 70000).finished).toBe(true);
  });
});

describe('the clock: one clock for the session and the exercise', () => {
  it('stops for both when the session is paused, and carries on from the same point', () => {
    const clock = new Clock();
    clock.start(0);
    expect(clock.elapsed(10000)).toBe(10000);
    clock.pause(10000);
    expect(clock.elapsed(50000)).toBe(10000);
    clock.resume(50000);
    expect(clock.elapsed(55000)).toBe(15000);
  });

  it('a session timer and an exercise timer cannot drift: both come from the same elapsed time', () => {
    const session = new WorkoutSession(routine);
    session.start(0);
    session.pause(12000);
    session.resume(100000);
    const at = session.position(112000);
    // 12 s before the pause plus 12 s after it: 24 s into the first exercise, 6 s left of it
    expect(session.elapsed(112000)).toBe(24000);
    expect(at).toMatchObject({ index: 0, inside: 24000, left: 6000 });
  });

  it('skip next goes to the start of the next segment, and to the end after the last one', () => {
    const session = new WorkoutSession(routine);
    session.start(0);
    session.skipNext(5000);
    expect(session.elapsed(5000)).toBe(30000);
    session.skipNext(5000);
    expect(session.elapsed(5000)).toBe(40000);
    session.skipNext(5000);
    expect(session.elapsed(5000)).toBe(70000);
    expect(session.finished(5000)).toBe(true);
  });

  it('skip previous restarts an exercise that has run a little, and goes back when it has just started', () => {
    const session = new WorkoutSession(routine);
    session.start(0);
    // at 35 s the rest is running; skip next goes to the last exercise, at 40 s
    session.skipNext(35000);
    expect(session.elapsed(35000)).toBe(40000);
    // 4 s into the last exercise: going back restarts it
    session.skipPrevious(44000);
    expect(session.elapsed(44000)).toBe(40000);
    // 1 s into it now: going back goes to the rest before it, at 30 s
    session.skipPrevious(45000);
    expect(session.elapsed(45000)).toBe(30000);
    expect(RESTART_AFTER_MS).toBe(3000);
  });

  it('counts the exercises finished, rests do not count', () => {
    const session = new WorkoutSession(routine);
    session.start(0);
    expect(session.exercises).toBe(2);
    expect(session.completed(35000)).toBe(1);
    expect(session.completed(80000)).toBe(2);
  });
});

describe('the log', () => {
  const settings = { ...DEFAULT_SETTINGS, tracker: 'workout' };

  it('fills in the duration and the target of the entry', () => {
    expect(logText('Just finished <workout> exercise taking <duration> minutes.', { minutes: 6.5, target: 'upper', early: false })).toBe(
      'Just finished upper body exercise taking 6.5 minutes.',
    );
    expect(targetLabel('core')).toBe('Core');
  });

  it('writes the tracker with its value in seconds, when there is one', () => {
    const note = sessionNote(settings, { minutes: 6.5, target: 'full', early: false });
    expect(note).toContain('#workout(390)');
    expect(sessionNote({ ...settings, tracker: null }, { minutes: 6.5, target: 'full', early: false })).not.toContain('#');
  });
});

describe('the history', () => {
  const entry = (at: string, minutes = 7, early = false): Entry => ({ at, minutes, target: 'full', completed: 10, exercises: 10, early });

  it('keeps the entries that are well formed, newest first', () => {
    const kept = normaliseHistory([entry('2026-10-20T10:00:00Z'), { at: 'nope', minutes: 3 }, entry('2026-10-22T10:00:00Z')]);
    expect(kept.map((e) => e.at)).toEqual(['2026-10-22T10:00:00Z', '2026-10-20T10:00:00Z']);
  });

  it('a week starts on a Monday, and counts the sessions that were finished, not the early ones', () => {
    const wednesday = new Date(2026, 9, 21, 12, 0);
    expect(startOfWeek(wednesday).getDay()).toBe(1);
    const history = addEntry(addEntry([], entry(new Date(2026, 9, 20, 9).toISOString(), 7)), entry(new Date(2026, 9, 21, 9).toISOString(), 14));
    const early = entry(new Date(2026, 9, 19, 9).toISOString(), 3, true);
    expect(thisWeek([...history, early], wednesday)).toEqual({ sessions: 2, minutes: 21 });
  });
});

describe('the settings', () => {
  it('a missing or wrong value falls back to the default', () => {
    const settings = normaliseSettings({ colours: { flesh: 'red' }, tracker: '', sound: 'yes' });
    expect(settings.colours.flesh).toBe(DEFAULT_SETTINGS.colours.flesh);
    expect(settings.tracker).toBeNull();
    expect(settings.sound).toBe(true);
  });
});
