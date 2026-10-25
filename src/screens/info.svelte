<script lang="ts">
  let { back }: { back: () => void } = $props();
</script>

<section class="card">
  <p class="caption">About</p>
  <p>Resistance band workouts. Choose the length and the part of the body, and follow the exercises on screen. Each exercise is shown as a loop of three drawings.</p>
  <p>The drawings are by Bryl Lim, from <a href="https://github.com/bryllim/workout-guide">workout-guide</a>, licensed under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. They are derived from the exercise artwork of Everkinetic, also CC BY-SA 4.0.</p>
</section>

<section class="card">
  <p class="caption">How the timers work</p>
  <p>The session has one clock. The timer of the exercise is taken from the same clock, so the two always agree, also after a pause or a skip.</p>
</section>

<button class="ghost" onclick={back}>Back</button>

<style>
  .card { padding: 14px 16px; border-radius: 16px; background: var(--card); margin: 12px 0; line-height: 1.45; }
  .card p { margin: 6px 0; }
  .caption { font-size: calc(13px * var(--scale)); font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
  a { color: var(--tint); }
  .ghost { display: block; width: 100%; margin-top: 8px; padding: 12px; border: 0; border-radius: 12px; background: var(--fill); color: var(--text); font: inherit; font-weight: 600; cursor: pointer; }
</style>
