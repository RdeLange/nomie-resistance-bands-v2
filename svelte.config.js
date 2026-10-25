import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// scss in the drawings is compiled by sass through the preprocessor
export default {
  preprocess: vitePreprocess(),
};
