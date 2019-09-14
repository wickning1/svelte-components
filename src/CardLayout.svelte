<script context="module">
  export const CARDLAYOUT = {}
</script>
<script>
  import { afterUpdate, onDestroy, tick, setContext } from 'svelte'
  export let maxwidth = 500
  export let widthguess = 1000
  export let preserveorder = false
  export let gutter = 10
  export let className = ''

  let blocks = []
  setContext(CARDLAYOUT, {
    registerBlock: block => {
      blocks.push(block)
      onDestroy(() => {
        blocks.splice(blocks.indexOf(block), 1)
      })
    },
    gutter
  })

  // make number of columns rely on the current width of the card layout area
  let w = widthguess // this is bound to .cardlayout clientWidth, see HTML section below
  $: columns = Math.ceil(w / maxwidth)
  $: columnarray = [...Array(columns).keys()]
  $: guttereach = gutter * (columns-1) / columns

  // this next section is designed to minimize the amount of work that needs to be done
  // svelte is responsible for creating all cardlayout components and placing them into
  // .cardlayout-unsorted, then after svelte finishes rendering, we use pure JS to move
  // the images into the correct column according to the heights
  // this way all the dom elements are preserved in responsive re-renders (because we
  // use a keyed #each loop to create them)
  let savecolumns = 0
  let columnelements = []
  let unsortedcolumn
  $: savecolumns = 0 * blocks.length // little trick to trigger a sort when blocks array changes
  afterUpdate(async () => {
    await tick()
    if (savecolumns !== columns) { // only do work if number of columns has changed, afterUpdate triggers on resize
      // elements in columns that have just been eliminated need to be placed back into the DOM
      // in order to have a height - the easiest way to do that is to add them into unsorted
      blocks.filter(block => !block.element.clientHeight)
        .forEach(block => unsortedcolumn.append(block.element))
      // collect all the card heights at this new column width
      // we do this before we start the main sorting loop so that all our
      // DOM reads are bundled up to avoid thrashing
      const blockheights = blocks.map(block => block.element.clientHeight)
      if (preserveorder) {
        let optimal = [blocks]
        if (columns > 1) {
          const totalheight = blockheights.reduce((totalheight, blockheight) => totalheight + blockheight + gutter, 0)
          const minheight = Math.max(totalheight / columns, ...blockheights)
          let shortestoverall = totalheight
          // 2d packing problem is NP-hard so this is an O(n) heuristic
          // optimal configuration would be if each column is `minheight` so start there
          // then relax it in a few increments and see if the overall height shrinks
          for (let colmaxheight = minheight; colmaxheight < 1.5*minheight; colmaxheight += 0.1 * minheight) {
            let colheight = 0
            let colidx = 0
            let tallestcol = 0
            const arrangement = []
            for (const [i,block] of blocks.entries()) {
              if (colheight + blockheights[i] > colmaxheight && colidx < columns - 1) {
                colidx++
                if (colheight > tallestcol) tallestcol = colheight
                colheight = 0
              }
              if (!arrangement[colidx]) arrangement[colidx] = []
              arrangement[colidx].push(block)
              colheight += blockheights[i] + gutter
            }
            if (colheight > tallestcol) tallestcol = colheight
            if (tallestcol < shortestoverall) {
              shortestoverall = tallestcol
              optimal = arrangement
            }
          }
        }
        // we created the optimal arrangement, now move the block elements to
        // reflect it
        for (let i = 0; i < optimal.length; i++) {
          for(const block of optimal[i]) {
            columnelements[i].append(block.element)
          }
        }
      } else {
        const heights = Array.apply(null, Array(columns)).map(h => 0) // initializes heights to an array of zeroes
        // begin sorting blocks into columns
        for (const [i,block] of blocks.entries()) {
          // find the column with the smallest current height
          const colidx = heights.reduce((acc, curr, curridx) => curr < heights[acc] ? curridx : acc, 0)
          // move the current card to the chosen column
          columnelements[colidx].append(block.element)
          // record the height we just added to the chosen column
          // do NOT read the height from the DOM, it would cause thrashing
          heights[colidx] += blockheights[i] + gutter
        }
      }
      // allow garbage collection of empty column elements
      while (columnelements.length > columns) columnelements.pop()
      savecolumns = columns
    }
  })
</script>

<style>
  .cardlayout {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .cardlayout-unsorted {
    visibility: hidden;
    height: 1px;
  }
</style>

<div class="cardlayout {className}" bind:clientWidth={w}>
  {#each columnarray as idx}
    <div class="cardlayout-column" style="width: calc({100 / columns}% - {guttereach}px); {idx ? 'margin-left: ' + gutter + 'px' : ''}" bind:this={columnelements[idx]}></div>
  {/each}
  <div class="cardlayout-unsorted" style="width: calc({100 / columns}% - {guttereach}px);" bind:this={unsortedcolumn}>
    <slot></slot>
  </div>
</div>
