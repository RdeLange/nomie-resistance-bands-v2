// The settings of the plugin: the colours of the animated person, the tracker and the text of the log, and the sound.
export type Colours = { flesh: string; hair: string; pants: string; shirt: string };

export type Settings = {
  colours: Colours;
  // the tracker the session is logged to (its tag without the #), or null for none
  tracker: string | null;
  // the text of the log. <duration> is the length in minutes and <workout> is the target.
  logEntry: string;
  // ask before the session is written to the timeline
  askBeforeLog: boolean;
  // beeps when an exercise changes and in the last seconds of an exercise
  sound: boolean;
};

export const DEFAULT_COLOURS: Colours = { flesh: '#d5ae83', hair: '#412323', pants: '#414141', shirt: '#42cbef' };

export const DEFAULT_SETTINGS: Settings = {
  colours: DEFAULT_COLOURS,
  tracker: null,
  logEntry: 'Just finished <workout> exercise taking <duration> minutes.',
  askBeforeLog: true,
  sound: true,
};

const isColour = (value: unknown): value is string => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);

// Reads the saved settings. A value that is missing or not right falls back to the default.
export const normaliseSettings = (saved: any): Settings => {
  const colours = saved?.colours ?? {};
  return {
    colours: {
      flesh: isColour(colours.flesh) ? colours.flesh : DEFAULT_COLOURS.flesh,
      hair: isColour(colours.hair) ? colours.hair : DEFAULT_COLOURS.hair,
      pants: isColour(colours.pants) ? colours.pants : DEFAULT_COLOURS.pants,
      shirt: isColour(colours.shirt) ? colours.shirt : DEFAULT_COLOURS.shirt,
    },
    tracker: typeof saved?.tracker === 'string' && saved.tracker !== '' ? saved.tracker : null,
    logEntry: typeof saved?.logEntry === 'string' ? saved.logEntry : DEFAULT_SETTINGS.logEntry,
    askBeforeLog: typeof saved?.askBeforeLog === 'boolean' ? saved.askBeforeLog : true,
    sound: typeof saved?.sound === 'boolean' ? saved.sound : true,
  };
};
