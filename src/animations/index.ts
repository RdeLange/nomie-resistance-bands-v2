// The animation of each exercise: the v1 drawings, one file per exercise, loaded when the exercise starts.
// An exercise without a drawing shows the plank, as v1 did.
const drawings = import.meta.glob('./workout-*.svelte') as Record<string, () => Promise<{ default: any }>>;

export const loadDrawing = (woname: string): Promise<{ default: any }> => {
  const load = drawings[`./workout-${woname}.svelte`] ?? drawings['./workout-plank.svelte'];
  return load();
};
