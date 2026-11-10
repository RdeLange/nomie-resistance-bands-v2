<script lang="ts">
  import { t } from '../i18n/index.svelte';
  import { app } from '../plugin-state.svelte';
  import { DURATIONS, TARGETS } from '../data/catalogue';
  import { thisWeek } from '../history';
  import { shortDate } from '../format';

  const week = $derived(thisWeek(app.history, new Date()));
  const recent = $derived(app.history.slice(0, 3));
</script>

<section class="card week">
  <p class="caption">{t('thisWeek')}</p>
  <p class="big">{week.sessions} <span class="muted">{week.sessions === 1 ? t('sessionOne') : t('sessionMany')}</span></p>
  <p class="muted">{t('minutesExercise', { minutes: week.minutes })}</p>
</section>

<h2>{t('length')}</h2>
<div class="chips">
  {#each DURATIONS as d, i (d.label)}
    <button class:on={app.durationIndex === i} aria-pressed={app.durationIndex === i} onclick={() => (app.durationIndex = i)}>{d.label}</button>
  {/each}
</div>

<h2>{t('target')}</h2>
<div class="chips">
  {#each TARGETS as target (target.id)}
    <button class:on={app.target === target.id} aria-pressed={app.target === target.id} onclick={() => (app.target = target.id)}>{target.label}</button>
  {/each}
</div>

<button class="primary" onclick={() => app.start()}>{t('startWorkout')}</button>

{#if recent.length}
  <h2>{t('recent')}</h2>
  <section class="card">
    {#each recent as entry (entry.at)}
      <div class="row">
        <span>{shortDate(entry.at)}</span>
        <span class="muted">{t('minShort', { minutes: entry.minutes })} · {t('completedOf', { completed: entry.completed, exercises: entry.exercises })}{entry.early ? t('endedEarlySuffix') : ''}</span>
      </div>
    {/each}
  </section>
{/if}

<style>
  .card { padding: 14px 16px; border-radius: 16px; background: var(--card); margin: 12px 0; }
  .week p { margin: 0; }
  .caption { font-size: calc(13px * var(--scale)); font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
  .big { font-size: calc(28px * var(--scale)); font-weight: 700; }
  .muted { color: var(--muted); font-size: calc(14px * var(--scale)); font-weight: 400; }
  h2 { margin: 18px 0 8px; font-size: calc(13px * var(--scale)); font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .chips button { padding: 10px 14px; border: 0; border-radius: 12px; background: var(--fill); color: var(--text); font: inherit; cursor: pointer; }
  .chips button.on { background: var(--tint-soft); color: var(--tint); font-weight: 600; outline: 2px solid var(--tint); }
  .primary { display: block; width: 100%; margin-top: 22px; padding: 14px; border: 0; border-radius: 14px; background: var(--tint); color: var(--on-tint); font: inherit; font-size: calc(17px * var(--scale)); font-weight: 600; cursor: pointer; }
  .row { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-top: 1px solid var(--line); }
  .row:first-child { border-top: 0; }
</style>
