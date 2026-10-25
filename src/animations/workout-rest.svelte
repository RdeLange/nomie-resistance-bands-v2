<script lang="ts">
     export let isPaused = false;
</script>

<style lang="scss">
  
    .rest-message {
    font-size: 5vw;
    line-height: 1.2;
    /* text-align: center; */
    font-weight: 300;
    color: var(--color-primary-bright);
    animation: breathe 3s infinite linear;
    
  }
  
  .paused.rest-message  {
    filter: grayscale(100%);
      opacity: 0.8;
      animation-play-state: paused;
    }
  
    @keyframes breathe {
    0% {
      transform: scale(1);
    }
    20% {
      transform: scale(1.15);
    }
    100% {
      transform: scale(1);
    }
  }
</style>


  
    <span class="rest-message" class:paused={isPaused}>Catch your breath...</span>
 
{#if isPaused}
<svg viewBox="-6 -5 36 36" width="10%" height="10%" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M10 24h-6v-24h6v24zm10 0h-6v-24h6v24zm-11-23h-4v22h4v-22zm10 0h-4v22h4v-22z"/></svg>
{/if}