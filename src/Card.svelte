<script>
  export let className = ''
  import { getContext } from 'svelte'
  import { CARDLAYOUT } from './CardLayout.svelte'
  const block = {}
  const { registerBlock, gutter } = getContext(CARDLAYOUT)
  registerBlock(block)
</script>

<div class="cardlayout-card {className}" bind:this={block.element} role="listitem" style="margin-bottom: {$gutter}px;">
  <slot></slot>
</div>
