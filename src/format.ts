// Times as the screens show them: minutes and seconds, the seconds always two digits.
export const clock = (ms: number): string => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// A date as a short day and time, in the language of the device
export const shortDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
