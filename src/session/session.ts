// One clock for the whole session. The session timer and the timer of the exercise are both worked out from it, so they
// cannot drift apart. Time is taken from the moment the screen gives it (a timestamp in milliseconds), not from counting ticks.
import { REST_SECONDS, workoutById, REST_ID, type Workout } from '../data/catalogue';

export type Segment = {
  index: number;
  workout: Workout;
  // the start and the end of the segment, in milliseconds from the start of the session
  start: number;
  end: number;
};

// Where the session is at a moment: the segment that runs, and how long it has run and has left
export type Position = {
  segment: Segment | undefined;
  index: number;
  inside: number;
  left: number;
  finished: boolean;
};

// Lays the routine out in time: each exercise, and each rest, one after the other
export const buildSchedule = (routine: number[]): Segment[] => {
  let start = 0;
  return routine.map((id, index) => {
    const workout = id === REST_ID ? { ...workoutById(REST_ID), duration: REST_SECONDS } : workoutById(id);
    const end = start + workout.duration * 1000;
    const segment = { index, workout, start, end };
    start = end;
    return segment;
  });
};

// Where the session is at `ms` from its start
export const positionAt = (schedule: Segment[], ms: number): Position => {
  const total = schedule.length ? schedule[schedule.length - 1].end : 0;
  if (ms >= total) {
    const last = schedule[schedule.length - 1];
    return { segment: last, index: last ? last.index : 0, inside: last ? last.end - last.start : 0, left: 0, finished: true };
  }
  const segment = schedule.find((s) => ms >= s.start && ms < s.end);
  if (!segment) return { segment: undefined, index: 0, inside: 0, left: 0, finished: false };
  return { segment, index: segment.index, inside: ms - segment.start, left: segment.end - ms, finished: false };
};

export const totalMs = (schedule: Segment[]): number => (schedule.length ? schedule[schedule.length - 1].end : 0);

// The clock: it runs from the start, and stops while the session is paused. `now` is a timestamp in milliseconds.
export class Clock {
  private accumulated = 0;
  private since: number | null = null;

  get running(): boolean {
    return this.since !== null;
  }

  elapsed(now: number): number {
    return this.accumulated + (this.since === null ? 0 : now - this.since);
  }

  start(now: number): void {
    this.accumulated = 0;
    this.since = now;
  }

  pause(now: number): void {
    if (this.since === null) return;
    this.accumulated += now - this.since;
    this.since = null;
  }

  resume(now: number): void {
    if (this.since !== null) return;
    this.since = now;
  }

  // Moves the clock to `ms`, keeping it running or paused as it was
  seek(ms: number, now: number): void {
    const target = Math.max(0, ms);
    this.accumulated = target - (this.since === null ? 0 : now - this.since);
  }
}

// If an exercise has run this long, going back starts it again; before that, going back goes to the one before
export const RESTART_AFTER_MS = 3000;

// A session of a routine: its schedule and its clock, and the moves a user makes in it
export class WorkoutSession {
  readonly schedule: Segment[];
  readonly total: number;
  private readonly clock = new Clock();

  constructor(routine: number[]) {
    this.schedule = buildSchedule(routine);
    this.total = totalMs(this.schedule);
  }

  start(now: number): void {
    this.clock.start(now);
  }

  pause(now: number): void {
    this.clock.pause(now);
  }

  resume(now: number): void {
    this.clock.resume(now);
  }

  get paused(): boolean {
    return !this.clock.running;
  }

  elapsed(now: number): number {
    return Math.min(this.clock.elapsed(now), this.total);
  }

  position(now: number): Position {
    return positionAt(this.schedule, this.elapsed(now));
  }

  finished(now: number): boolean {
    return this.clock.elapsed(now) >= this.total;
  }

  // The next exercise, or the end of the session when this is the last one
  skipNext(now: number): void {
    const elapsed = this.elapsed(now);
    const next = this.schedule.find((s) => s.start > elapsed);
    this.clock.seek(next ? next.start : this.total, now);
  }

  // The start of this exercise when it has run a little, or the one before it
  skipPrevious(now: number): void {
    const at = this.position(now);
    if (!at.segment) return this.clock.seek(0, now);
    if (at.inside > RESTART_AFTER_MS) return this.clock.seek(at.segment.start, now);
    const before = this.schedule[at.index - 1];
    this.clock.seek(before ? before.start : 0, now);
  }

  // The exercises finished so far (rests do not count)
  completed(now: number): number {
    const done = this.elapsed(now);
    return this.schedule.filter((s) => s.workout.id !== REST_ID && s.end <= done).length;
  }

  // The number of exercises in the routine (rests do not count)
  get exercises(): number {
    return this.schedule.filter((s) => s.workout.id !== REST_ID).length;
  }
}
