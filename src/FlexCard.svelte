<script>
  export let className = ''
  import { getContext } from 'svelte'
  import { CARDLAYOUT } from './FlexCardLayout.svelte'
  const block = {}
  const { registerBlock, gutter } = getContext(CARDLAYOUT)
  const { width, order, linebreak } = registerBlock(block)
</script>

<style>
  .cardlayout-columnbreak {
    width: 0;
    height: 100%;
  }
</style>

<li class="cardlayout-card {className}" bind:this={block.element} style="margin-bottom: {$gutter}px; width: {$width}; order: {$order};">
  <slot></slot>
</li>
{#if $linebreak}
  <li aria-hidden="true" class="cardlayout-columnbreak" style="order: {$order};"></li>
{/if}
