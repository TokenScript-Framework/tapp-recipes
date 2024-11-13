<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  export let value: string = '';
  
  let isCopied = false;
  let inputElement: HTMLInputElement;

  function copyToClipboard() {
    if (inputElement) {
      inputElement.select();
      document.execCommand('copy');
      isCopied = true;
      setTimeout(() => {
        isCopied = false;
      }, 2000);
    }
  }

  onMount(() => {
    if (inputElement) {
      inputElement.focus();
    }
  });
</script>

<div class="max-w-md mx-auto p-4">
  <div class="relative">
    <input
      bind:this={inputElement}
      type="text"
      {value}
      readonly
      class="w-full px-4 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-default"
    />
    <button
      on:click={copyToClipboard}
      class="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
    >
      Copy
    </button>
  </div>
  {#if isCopied}
    <div transition:fade class="mt-2 text-sm text-green-600">
      Copied to clipboard!
    </div>
  {/if}
</div>