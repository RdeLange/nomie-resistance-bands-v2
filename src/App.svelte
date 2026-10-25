<script lang="ts">
  import { onMount } from 'svelte';
  import { app } from './plugin-state.svelte';
  import { paletteFrom, type Palette } from './palette';
  import { onPrefsChange } from './prefs-live';
  import Start from './screens/start.svelte';
  import Session from './screens/session.svelte';
  import Settings from './screens/settings.svelte';
  import Info from './screens/info.svelte';
  import Preview from './screens/preview.svelte';

  let view = $state<'start' | 'settings' | 'info' | 'preview'>('start');
  let palette = $state<Palette>(paletteFrom(undefined));
  let scale = $state(1);

  // while a session runs, or its summary is on screen, the session has the screen
  const inSession = $derived(app.status !== 'idle' && app.session !== null);

  const applyNomieValues = (plugin: any) => {
    if (!plugin?.prefs) return;
    palette = paletteFrom(plugin.prefs);
    scale = plugin.prefs.fontScale || 1;
  };

  onMount(() => {
    const plugin = new NomiePlugin({
      name: 'Resistance Bands',
      emoji: '🏋️',
      description: 'Resistance band workouts of about twelve minutes, with an animation for each exercise. The session and each exercise have a timer, and the workout is logged to Nomie.',
      uses: ['createNote', 'selectTrackables', 'confirm', 'getStorageItem', 'setStorageItem'],
      version: '2.0',
      addToCaptureMenu: true,
      addToMoreMenu: true,
      addToWidgets: false,
    });
    app.plugin = plugin;
    onPrefsChange(plugin, () => applyNomieValues(plugin));
    plugin.onRegistered(async () => {
      applyNomieValues(plugin);
      if (!app.loaded) await app.load(plugin);
    });
    plugin.onUIOpened(async () => {
      applyNomieValues(plugin);
      if (!app.loaded) await app.load(plugin);
    });
  });
</script>

<div class="root" style="--page: {palette.page}; --card: {palette.card}; --card-inner: {palette.cardInner}; --text: {palette.text}; --muted: {palette.textSecondary}; --line: {palette.separator}; --fill: {palette.fill}; --tint: {palette.tint}; --on-tint: {palette.onTint}; --tint-soft: {palette.tintSoft}; --good: {palette.good}; --danger: {palette.danger}; --scale: {scale};">
  <header class="top">
    <div class="title">
      <span aria-hidden="true">🏋️</span>
      <h1>Resistance Bands</h1>
    </div>
    {#if !inSession}
      <div class="icons">
        <button aria-label="Preview the workouts" onclick={() => (view = 'preview')}>▶︎</button>
        <button aria-label="Settings" onclick={() => (view = 'settings')}>⚙︎</button>
        <button aria-label="About" onclick={() => (view = 'info')}>ⓘ</button>
      </div>
    {/if}
  </header>

  {#if !app.loaded}
    <p class="muted">Loading…</p>
  {:else if inSession}
    <Session />
  {:else if view === 'settings'}
    <Settings back={() => (view = 'start')} />
  {:else if view === 'info'}
    <Info back={() => (view = 'start')} />
  {:else if view === 'preview'}
    <Preview back={() => (view = 'start')} />
  {:else}
    <Start />
  {/if}
</div>

<style>
  .root { box-sizing: border-box; min-height: 100vh; max-width: 520px; margin: 0 auto; padding: 16px; background: var(--page); color: var(--text); font-size: calc(16px * var(--scale)); line-height: 1.4; }
  .top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .title { display: flex; align-items: center; gap: 8px; }
  h1 { margin: 0; font-size: calc(22px * var(--scale)); font-weight: 700; }
  .icons { display: flex; gap: 6px; }
  .icons button { width: 36px; height: 36px; border: 0; border-radius: 50%; background: var(--fill); color: var(--text); font-size: calc(17px * var(--scale)); cursor: pointer; }
  .muted { color: var(--muted); }
</style>
