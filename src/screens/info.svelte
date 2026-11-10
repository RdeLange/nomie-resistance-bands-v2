<script lang="ts">
  import { t } from '../i18n/index.svelte';
  let { back }: { back: () => void } = $props();
</script>

<section class="card">
  <p class="caption">{t('aboutHead')}</p>
  <p>{t('infoAbout')}</p>
  <p>{t('creditBefore')} <a href="https://github.com/bryllim/workout-guide">workout-guide</a>{t('creditMid')} <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>{t('creditAfter')}</p>
</section>

<section class="card">
  <p class="caption">{t('timersHead')}</p>
  <p>{t('timers')}</p>
</section>

<button class="ghost" onclick={back}>{t('back')}</button>

<style>
  .card { padding: 14px 16px; border-radius: 16px; background: var(--card); margin: 12px 0; line-height: 1.45; }
  .card p { margin: 6px 0; }
  .caption { font-size: calc(13px * var(--scale)); font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
  a { color: var(--tint); }
  .ghost { display: block; width: 100%; margin-top: 8px; padding: 12px; border: 0; border-radius: 12px; background: var(--fill); color: var(--text); font: inherit; font-weight: 600; cursor: pointer; }
</style>
