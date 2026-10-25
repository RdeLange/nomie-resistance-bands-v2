// The note a finished session writes to the timeline, and the text it uses. v1 replaced <duration> and <workout> in the text.
import type { Settings } from './settings';
import { TARGETS, type Target } from './data/catalogue';

export type Finished = {
  // the minutes that were worked out (the length of the session as it was run)
  minutes: number;
  target: Target;
  // false when the session was ended early
  early: boolean;
};

export const targetLabel = (target: Target): string => TARGETS.find((t) => t.id === target)?.label ?? target;

// The log text with the placeholders filled in. The minutes are shown with one decimal, as v1 did.
export const logText = (entry: string, finished: Finished): string =>
  entry.replace('<duration>', finished.minutes.toFixed(1)).replace('<workout>', targetLabel(finished.target).toLowerCase());

// The note for the timeline: the heading, the log text and, when a tracker is chosen, its value in seconds
export const sessionNote = (settings: Settings, finished: Finished): string => {
  const trackerLine = settings.tracker ? `#${settings.tracker}(${Math.round(finished.minutes * 60)})\n` : '';
  return `Resistance Bands 🏋️:\n${logText(settings.logEntry, finished)}\n\n${trackerLine}`;
};
