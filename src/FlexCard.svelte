<script>
  export let className = ''
  import { getContext, onMount, onDestroy } from 'svelte'
  import ResizeObserver from 'resize-observer-polyfill'
  import { CARDLAYOUT } from './FlexCardLayout.svelte'
  const block = {}
  const { registerBlock, gutter, recalculate } = getContext(CARDLAYOUT)
  const { width, order, linebreak } = registerBlock(block)
  let savew = 0
  let saveh = 0
  const ro = new ResizeObserver(entries => {
    const w = entries[0].contentRect.width
    const h = entries[0].contentRect.height
    if (w === savew && h !== saveh) recalculate()
    savew = w
    saveh = h
  })
  onMount(() => ro.observe(block.element))
  onDestroy(() => ro.disconnect())
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
