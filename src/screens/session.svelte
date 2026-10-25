<script lang="ts">
  import { app } from '../plugin-state.svelte';
  import Pose from '../components/pose.svelte';
  import { clock } from '../format';
  import { playCue } from '../audio';
  import { REST_ID, TARGETS, workoutById } from '../data/catalogue';
  import { thisWeek } from '../history';

  const session = $derived(app.session);
  const pos = $derived(app.position);
  const total = $derived(session?.total ?? 0);
  const sessionLeft = $derived(Math.max(0, total - app.elapsed));
  const sessionShare = $derived(total ? Math.min(100, (app.elapsed / total) * 100) : 0);
  const current = $derived(pos?.segment?.workout ?? workoutById(REST_ID));
  const resting = $derived(current.id === REST_ID);
  const exerciseShare = $derived(pos?.segment ? (pos.inside / (pos.segment.end - pos.segment.start)) * 100 : 0);
  // the exercise number, counting only the exercises (rests do not count), and the one after this
  const exerciseNumber = $derived(
    session && pos?.segment && !resting ? session.schedule.slice(0, pos.index + 1).filter((s) => s.workout.id !== REST_ID).length : 0,
  );
  const upNext = $derived(session && pos ? session.schedule[pos.index + 1]?.workout.displayname : undefined);
  const targetName = $derived(TARGETS.find((t) => t.id === app.target)?.label ?? '');
  const week = $derived(thisWeek(app.history, new Date()));

  // beeps: one when an exercise changes, and a tick in the last three seconds of each
  let lastIndex = -1;
  let lastTick = -1;
  $effect(() => {
    const p = app.position;
    if (!p || app.status !== 'running' && app.status !== 'paused') return;
    if (p.index !== lastIndex) {
      if (lastIndex !== -1 && app.status === 'running' && app.settings.sound) playCue('change');
      lastIndex = p.index;
      lastTick = -1;
    }
    const seconds = Math.ceil(p.left / 1000);
    if (app.status === 'running' && app.settings.sound && seconds >= 1 && seconds <= 3 && seconds !== lastTick) {
      playCue('countdown');
      lastTick = seconds;
    }
  });
</script>

{#if app.status === 'done' && app.summary}
  <section class="card done">
    <p class="caption">{app.summary.early ? 'Session ended early' : 'Session complete'}</p>
    <h1>{app.summary.early ? 'Session ended' : 'Well done'}</h1>
    <p class="big">{app.summary.minutes} min</p>
    <p class="muted">{app.summary.completed} of {app.summary.exercises} exercises · {targetName}</p>
    <p class="muted">This week: {week.sessions} {week.sessions === 1 ? 'session' : 'sessions'}, {week.minutes} minutes</p>
    {#if app.logged}
      <p class="notice">Logged to your timeline.</p>
    {:else if app.settings.askBeforeLog}
      <button class="primary" onclick={() => app.logSession()}>Log to timeline</button>
    {/if}
  </section>
  <button class="ghost" onclick={() => app.reset()}>Done</button>
{:else if session}
  <section class="card head">
    <div>
      <p class="caption">{targetName}</p>
      <p class="big" aria-live="off">{clock(sessionLeft)} <span class="muted">left</span></p>
    </div>
    {#if app.status === 'paused'}<span class="pill">Paused</span>{/if}
  </section>
  <div class="bar" aria-hidden="true"><div class="fill" style="width: {sessionShare}%"></div></div>

  <section class="stage">
    <Pose woname={current.woname} direction={current.wodirection} paused={app.status === 'paused'} colours={app.settings.colours} />
    <p class="name">{resting ? 'Rest' : current.displayname}</p>
    <p class="muted">{resting ? 'Next exercise soon' : `Exercise ${exerciseNumber} of ${session.exercises}`}</p>
    <p class="exercise-time">{clock(pos?.left ?? 0)}</p>
    <div class="bar small" aria-hidden="true"><div class="fill" style="width: {exerciseShare}%"></div></div>
    {#if upNext}<p class="muted">Up next: {upNext}</p>{/if}
  </section>

  <div class="controls">
    <button aria-label="Previous exercise" onclick={() => app.previous()}>⏮</button>
    <button class="main" aria-label={app.status === 'paused' ? 'Resume' : 'Pause'} onclick={() => app.togglePause()}>
      {app.status === 'paused' ? '▶︎ Resume' : '❚❚ Pause'}
    </button>
    <button aria-label="Next exercise" onclick={() => app.next()}>⏭</button>
  </div>
  <button class="link danger" onclick={() => app.endEarly()}>End session</button>
{/if}

<style>
  .card { padding: 14px 16px; border-radius: 16px; background: var(--card); margin: 8px 0; }
  .head { display: flex; align-items: center; justify-content: space-between; }
  .caption { margin: 0; font-size: calc(13px * var(--scale)); font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
  .big { margin: 2px 0 0; font-size: calc(30px * var(--scale)); font-weight: 700; font-variant-numeric: tabular-nums; }
  .muted { margin: 4px 0; color: var(--muted); }
  .pill { padding: 4px 10px; border-radius: 999px; background: var(--fill); color: var(--text); font-size: calc(13px * var(--scale)); font-weight: 600; }
  .bar { height: 6px; border-radius: 3px; background: var(--fill); overflow: hidden; margin: 4px 0 12px; }
  .bar.small { height: 4px; margin: 6px 0 4px; }
  .fill { height: 100%; background: var(--tint); transition: width 0.2s linear; }
  .stage { display: flex; flex-direction: column; align-items: center; text-align: center; }
  .name { margin: 4px 0 0; font-size: calc(22px * var(--scale)); font-weight: 700; }
  .exercise-time { margin: 6px 0 0; font-size: calc(40px * var(--scale)); font-weight: 700; font-variant-numeric: tabular-nums; }
  .controls { display: flex; gap: 10px; margin-top: 14px; }
  .controls button { flex: 1; padding: 12px 0; border: 0; border-radius: 14px; background: var(--fill); color: var(--text); font: inherit; font-size: calc(18px * var(--scale)); cursor: pointer; }
  .controls button.main { flex: 2; background: var(--tint); color: var(--on-tint); font-weight: 600; font-size: calc(17px * var(--scale)); }
  .link { display: block; margin: 14px auto 0; padding: 8px; border: 0; background: transparent; font: inherit; cursor: pointer; }
  .danger { color: var(--danger); }
  .done h1 { margin: 2px 0 0; font-size: calc(28px * var(--scale)); }
  .primary { display: block; width: 100%; margin-top: 12px; padding: 12px; border: 0; border-radius: 12px; background: var(--tint); color: var(--on-tint); font: inherit; font-weight: 600; cursor: pointer; }
  .ghost { display: block; width: 100%; margin-top: 8px; padding: 12px; border: 0; border-radius: 12px; background: var(--fill); color: var(--text); font: inherit; font-weight: 600; cursor: pointer; }
  .notice { margin: 12px 0 0; color: var(--good); font-weight: 600; }
</style>
