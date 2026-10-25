<script lang="ts">
  import { app } from '../plugin-state.svelte';
  import Pose from '../components/pose.svelte';
  import { WORKOUTS, REST_ID, type Workout } from '../data/catalogue';

  let { back }: { back: () => void } = $props();

  // the workouts in the order of the list, with the rest first as a plain reminder
  const list = WORKOUTS.filter((w) => w.id !== REST_ID).sort((a, b) => a.displayname.localeCompare(b.displayname));
  let chosen = $state<Workout>(list.find((w) => w.id !== REST_ID) ?? list[0]);
  let direction = $state<'left' | 'right'>('right');
  let paused = $state(false);

  const TARGET_NAMES: Record<string, string> = { full: 'Full body', upper: 'Upper body', lower: 'Lower body', core: 'Core', rest: 'Rest' };
</script>

<div class="head">
  <button class="link" onclick={back}>‹ Back</button>
</div>

<div class="chips" role="group" aria-label="Workouts">
  {#each list as w (w.id)}
    <button class:on={chosen.id === w.id} aria-pressed={chosen.id === w.id} onclick={() => (chosen = w)}>{w.displayname}</button>
  {/each}
</div>

<section class="stage">
  {#key chosen.id}
    <Pose woname={chosen.woname} direction={direction} paused={paused} colours={app.settings.colours} />
  {/key}
  <p class="name">{chosen.displayname}</p>
  <p class="muted">{TARGET_NAMES[chosen.targetarea] ?? chosen.targetarea} · {chosen.duration} s</p>
</section>

<div class="controls">
  <button class:on={direction === 'left'} onclick={() => (direction = direction === 'left' ? 'right' : 'left')}>Mirror</button>
  <button class:on={paused} onclick={() => (paused = !paused)}>{paused ? 'Play' : 'Pause'}</button>
</div>

<style>
  .head { display: flex; align-items: center; margin-bottom: 8px; }
  .link { padding: 6px 0; border: 0; background: transparent; color: var(--tint); font: inherit; cursor: pointer; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; max-height: 120px; overflow-y: auto; }
  .chips button { padding: 7px 11px; border: 0; border-radius: 10px; background: var(--fill); color: var(--text); font: inherit; font-size: calc(14px * var(--scale)); cursor: pointer; }
  .chips button.on { background: var(--tint); color: var(--on-tint); font-weight: 600; }
  .stage { display: flex; flex-direction: column; align-items: center; text-align: center; margin-top: 10px; }
  .name { margin: 4px 0 0; font-size: calc(22px * var(--scale)); font-weight: 700; }
  .muted { margin: 2px 0; color: var(--muted); font-size: calc(14px * var(--scale)); }
  .controls { display: flex; gap: 10px; margin-top: 14px; }
  .controls button { flex: 1; padding: 12px 0; border: 0; border-radius: 14px; background: var(--fill); color: var(--text); font: inherit; font-weight: 600; cursor: pointer; }
  .controls button.on { background: var(--tint-soft); color: var(--tint); }
</style>
