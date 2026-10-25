// Short beeps for the changes of an exercise. The audio context is made on the first tap, when the browser allows it.
let context: AudioContext | null = null;

const ensure = (): AudioContext | null => {
  try {
    if (!context) context = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (context.state === 'suspended') void context.resume();
    return context;
  } catch {
    return null;
  }
};

export type Cue = 'change' | 'countdown' | 'done';

// `change` is a higher beep for the next exercise, `countdown` a short tick, `done` the end of the session
export const playCue = (cue: Cue): void => {
  const ac = ensure();
  if (!ac) return;
  const pattern: Array<{ freq: number; at: number; length: number }> =
    cue === 'change'
      ? [{ freq: 880, at: 0, length: 0.25 }]
      : cue === 'countdown'
        ? [{ freq: 660, at: 0, length: 0.12 }]
        : [
            { freq: 660, at: 0, length: 0.2 },
            { freq: 880, at: 0.25, length: 0.4 },
          ];
  for (const beep of pattern) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.frequency.value = beep.freq;
    gain.gain.setValueAtTime(0.18, ac.currentTime + beep.at);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + beep.at + beep.length);
    osc.connect(gain).connect(ac.destination);
    osc.start(ac.currentTime + beep.at);
    osc.stop(ac.currentTime + beep.at + beep.length);
  }
};

// Unlocks the audio on a tap, so the beeps can play later in the session
export const unlockAudio = (): void => {
  ensure();
};
