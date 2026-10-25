<script lang="ts">
  import { app } from '../plugin-state.svelte';
  import { DEFAULT_COLOURS, type Colours, type Settings } from '../settings';
  import Pose from '../components/pose.svelte';

  let { back }: { back: () => void } = $props();

  // the colours a part of the figure can take: the choices are the ones of the figure, so every one of them reads well
  const CHOICES: Record<keyof Colours, { label: string; colours: string[] }> = {
    flesh: { label: 'Skin', colours: ['#f6d7b8', '#d5ae83', '#b07a4f', '#7a4a2b', '#4a2c1c'] },
    hair: { label: 'Hair', colours: ['#412323', '#1c1c1c', '#8b5a2b', '#d9b26f', '#b8b8b8'] },
    pants: { label: 'Pants', colours: ['#414141', '#1f3b5c', '#4b5d3a', '#6b4a2e', '#2b2b3d'] },
    shirt: { label: 'Shirt', colours: ['#42cbef', '#ef5350', '#66bb6a', '#ffca28', '#ab47bc', '#ffffff'] },
  };
  const parts = Object.keys(CHOICES) as Array<keyof Colours>;

  // which part is open for a new colour
  let open = $state<keyof Colours | null>(null);

  const update = (patch: Partial<Settings>) => app.saveSettings({ ...app.settings, ...patch });
  const setColour = (part: keyof Colours, colour: string) => {
    update({ colours: { ...app.settings.colours, [part]: colour } });
    open = null;
  };

  const chooseTracker = async () => {
    const picked = await app.plugin.selectTrackables('tracker', false);
    const tag = picked?.[0]?.tracker?.tag;
    if (tag) update({ tracker: tag });
  };
</script>

<section class="card">
  <p class="caption">The figure</p>
  <div class="preview">
    <Pose woname="banded-squat" direction="right" paused={false} colours={app.settings.colours} />
  </div>
  {#each parts as part (part)}
    <div class="row">
      <button class="swatch-row" aria-expanded={open === part} onclick={() => (open = open === part ? null : part)}>
        <span class="swatch" style="background: {app.settings.colours[part]}"></span>
        <span>{CHOICES[part].label}</span>
      </button>
    </div>
    {#if open === part}
      <div class="choices">
        {#each CHOICES[part].colours as colour (colour)}
          <button class="dot" class:picked={app.settings.colours[part] === colour} style="background: {colour}" aria-label="Use {colour}" onclick={() => setColour(part, colour)}></button>
        {/each}
      </div>
    {/if}
  {/each}
  <button class="link" onclick={() => update({ colours: { ...DEFAULT_COLOURS } })}>Reset the figure</button>
</section>

<section class="card">
  <p class="caption">Timeline</p>
  <div class="row">
    <span>Tracker</span>
    <span class="muted">{app.settings.tracker ? `#${app.settings.tracker}` : 'None'}</span>
  </div>
  <div class="actions">
    <button class="chip" onclick={chooseTracker}>{app.settings.tracker ? 'Change' : 'Choose a tracker'}</button>
    {#if app.settings.tracker}<button class="chip danger" onclick={() => update({ tracker: null })}>Remove</button>{/if}
  </div>
  <label class="field">
    <span class="muted">Text of the log</span>
    <textarea rows="3" value={app.settings.logEntry} oninput={(e) => update({ logEntry: e.currentTarget.value })}></textarea>
    <span class="hint">&lt;duration&gt; is the length in minutes, &lt;workout&gt; the target.</span>
  </label>
  <div class="row">
    <span>Ask before logging</span>
    <button class="toggle" class:on={app.settings.askBeforeLog} aria-pressed={app.settings.askBeforeLog} aria-label="Ask before logging" onclick={() => update({ askBeforeLog: !app.settings.askBeforeLog })}></button>
  </div>
</section>

<section class="card">
  <div class="row">
    <span>Sound</span>
    <button class="toggle" class:on={app.settings.sound} aria-pressed={app.settings.sound} aria-label="Sound" onclick={() => update({ sound: !app.settings.sound })}></button>
  </div>
  <p class="hint">A beep when an exercise changes, and a tick in its last three seconds.</p>
</section>

<section class="card">
  <p class="muted">{app.history.length} sessions in your history.</p>
  <button class="link danger" onclick={() => app.clearHistory()}>Clear the history</button>
</section>

<button class="ghost" onclick={back}>Back</button>

<style>
  .card { padding: 14px 16px; border-radius: 16px; background: var(--card); margin: 12px 0; }
  .caption { margin: 0 0 6px; font-size: calc(13px * var(--scale)); font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
  .row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 0; border-top: 1px solid var(--line); }
  .row:first-of-type { border-top: 0; }
  .swatch-row { display: flex; align-items: center; gap: 10px; width: 100%; padding: 6px 0; border: 0; background: transparent; color: var(--text); font: inherit; text-align: left; cursor: pointer; }
  .swatch { width: 22px; height: 22px; border-radius: 6px; box-shadow: 0 0 0 1px var(--line); }
  .choices { display: flex; flex-wrap: wrap; gap: 10px; padding: 6px 0 10px; }
  .dot { width: 30px; height: 30px; border: 0; border-radius: 50%; cursor: pointer; }
  .dot.picked { outline: 2px solid var(--text); outline-offset: 2px; }
  .muted { color: var(--muted); }
  .preview { height: 150px; overflow: hidden; }
  .preview :global(.pose) { height: 150px !important; }
  .hint { margin: 2px 0 0; font-size: calc(13px * var(--scale)); color: var(--muted); }
  .field { display: flex; flex-direction: column; gap: 4px; padding: 10px 0 4px; }
  textarea { box-sizing: border-box; width: 100%; padding: 10px 12px; border: 0; border-radius: 12px; background: var(--card-inner, var(--fill)); color: var(--text); font: inherit; resize: vertical; }
  .actions { display: flex; gap: 8px; padding-bottom: 6px; }
  .chip { padding: 8px 12px; border: 0; border-radius: 10px; background: var(--fill); color: var(--tint); font: inherit; cursor: pointer; }
  .chip.danger { color: var(--danger); }
  .toggle { position: relative; width: 50px; height: 30px; border: 0; border-radius: 15px; background: var(--switch-off, var(--fill)); cursor: pointer; flex-shrink: 0; }
  .toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 26px; height: 26px; border-radius: 50%; background: #fff; transition: transform 0.15s; }
  .toggle.on { background: var(--tint); }
  .toggle.on::after { transform: translateX(20px); }
  .link { padding: 8px 0; border: 0; background: transparent; color: var(--tint); font: inherit; cursor: pointer; }
  .danger { color: var(--danger); }
  .ghost { display: block; width: 100%; margin-top: 8px; padding: 12px; border: 0; border-radius: 12px; background: var(--fill); color: var(--text); font: inherit; font-weight: 600; cursor: pointer; }
</style>
