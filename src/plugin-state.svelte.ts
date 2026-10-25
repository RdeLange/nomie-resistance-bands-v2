// The state of the plugin: the settings, the history, and the session that runs now. The screens show it and call its actions.
import { DURATIONS, type Target } from './data/catalogue';
import { playCue, unlockAudio } from './audio';
import { sessionNote } from './log';
import { addEntry, normaliseHistory, type Entry } from './history';
import { buildRoutine } from './session/program';
import { WorkoutSession, type Position } from './session/session';
import { DEFAULT_SETTINGS, normaliseSettings, type Settings } from './settings';

const TICK_MS = 200;

class AppState {
  plugin: any = null;
  loaded = $state(false);
  settings = $state<Settings>(DEFAULT_SETTINGS);
  history = $state<Entry[]>([]);

  // the start screen's choice
  durationIndex = $state(0);
  target = $state<Target>('full');

  // the session that runs now. `now` is read from the clock on every tick, so the screens follow it.
  session = $state.raw<WorkoutSession | null>(null);
  status = $state<'idle' | 'running' | 'paused' | 'done'>('idle');
  now = $state(0);
  // the finished session, waiting for the choice to log it, and whether it was logged
  summary = $state<Entry | null>(null);
  logged = $state(false);
  message = $state('');

  private timer: ReturnType<typeof setInterval> | null = null;
  private wakeLock: any = null;

  get position(): Position | null {
    return this.session ? this.session.position(this.now) : null;
  }

  get elapsed(): number {
    return this.session ? this.session.elapsed(this.now) : 0;
  }

  // Reads the saved settings and history from the plugin's storage
  async load(plugin: any): Promise<void> {
    this.plugin = plugin;
    await plugin.storage.init();
    this.settings = normaliseSettings(plugin.storage.getItem('settings'));
    this.history = normaliseHistory(plugin.storage.getItem('history'));
    this.loaded = true;
  }

  private save(): void {
    this.plugin?.storage.setItem('settings', $state.snapshot(this.settings));
    this.plugin?.storage.setItem('history', $state.snapshot(this.history));
  }

  saveSettings(next: Settings): void {
    this.settings = normaliseSettings(next);
    this.save();
  }

  async clearHistory(): Promise<void> {
    const res = await this.plugin.confirm('Clear the history?', 'The sessions you finished are removed from the plugin. Your timeline is not changed.');
    if (!res?.value) return;
    this.history = [];
    this.save();
  }

  // Starts a session of the chosen length and target. The routine is picked now and stays the same for the session.
  start(): void {
    unlockAudio();
    const routine = buildRoutine(this.target, DURATIONS[this.durationIndex].programs);
    this.session = new WorkoutSession(routine);
    this.summary = null;
    this.logged = false;
    this.message = '';
    this.session.start(performance.now());
    this.now = performance.now();
    this.status = 'running';
    this.startTimer();
    this.keepAwake();
    if (this.settings.sound) playCue('change');
  }

  togglePause(): void {
    if (!this.session) return;
    const at = performance.now();
    if (this.status === 'running') {
      this.session.pause(at);
      this.status = 'paused';
    } else if (this.status === 'paused') {
      this.session.resume(at);
      this.status = 'running';
    }
    this.now = at;
  }

  next(): void {
    this.session?.skipNext(performance.now());
    this.now = performance.now();
  }

  previous(): void {
    this.session?.skipPrevious(performance.now());
    this.now = performance.now();
  }

  // Ending early asks first. A finished session is not asked about.
  async endEarly(): Promise<void> {
    const res = await this.plugin.confirm('End the session now?', 'The session is ended. What you finished so far is kept in your history.');
    if (res?.value) this.finish(true);
  }

  // The end of the session, early or on time. The session is kept in the history, and logged when the settings say so.
  finish(early: boolean): void {
    if (!this.session || this.status === 'done') return;
    const at = performance.now();
    this.now = at;
    this.stopTimer();
    this.releaseWakeLock();
    const elapsed = this.session.elapsed(at);
    const entry: Entry = {
      at: new Date().toISOString(),
      minutes: Math.round((elapsed / 60000) * 10) / 10,
      target: this.target,
      completed: this.session.completed(at),
      exercises: this.session.exercises,
      early,
    };
    this.summary = entry;
    this.history = addEntry(this.history, entry);
    this.save();
    this.status = 'done';
    if (this.settings.sound && !early) playCue('done');
    if (!this.settings.askBeforeLog) this.logSession();
  }

  // Writes the session to the timeline: the note, with the tracker's value when one is chosen
  logSession(): void {
    if (!this.summary || this.logged) return;
    this.plugin.createNote(
      sessionNote(this.settings, { minutes: this.summary.minutes, target: this.summary.target, early: this.summary.early }),
    );
    this.logged = true;
  }

  // Back to the start screen
  reset(): void {
    this.session = null;
    this.summary = null;
    this.status = 'idle';
  }

  // Ticks while the session runs, and ends it when the last exercise is over
  private startTimer(): void {
    this.stopTimer();
    this.timer = setInterval(() => {
      this.now = performance.now();
      if (this.session?.finished(this.now)) this.finish(false);
    }, TICK_MS);
  }

  private stopTimer(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  private async keepAwake(): Promise<void> {
    try {
      this.wakeLock = await (navigator as any).wakeLock?.request('screen');
    } catch {
      this.wakeLock = null;
    }
  }

  private releaseWakeLock(): void {
    this.wakeLock?.release?.();
    this.wakeLock = null;
  }
}

export const app = new AppState();
