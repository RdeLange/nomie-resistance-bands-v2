<script lang="ts">
  // The figure of an exercise. The drawing sets its own frames, and the colours of the person are CSS variables on it.
  import { loadDrawing } from '../animations';
  import type { Colours } from '../settings';

  let { woname, direction, paused, colours }: { woname: string; direction: 'left' | 'right'; paused: boolean; colours: Colours } = $props();

  let Drawing = $state<any>(null);
  let shapes = $state<SVGElement | undefined>(undefined);

  // a new exercise loads its own drawing; a late one for an exercise that has gone is dropped
  $effect(() => {
    const name = woname;
    loadDrawing(name).then((m) => {
      if (name === woname) Drawing = m.default;
    });
  });

  // the person's colours, on the element that holds the drawing
  $effect(() => {
    if (!shapes) return;
    shapes.style.setProperty('--hair', colours.hair);
    shapes.style.setProperty('--flesh', colours.flesh);
    shapes.style.setProperty('--pants', colours.pants);
    shapes.style.setProperty('--shirt', colours.shirt);
  });

</script>

<div class="pose">
  {#if Drawing}
    <Drawing bind:rootElement={shapes} isPaused={paused} {direction} />
  {/if}
</div>

<style>
  .pose {
    --hair: inherit;
    --pants: inherit;
    --flesh: inherit;
    --shirt: inherit;
    --cool200: #c6c8d2;
    --book: var(--cool200);
    width: 100%;
    height: min(38vh, 300px);
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
