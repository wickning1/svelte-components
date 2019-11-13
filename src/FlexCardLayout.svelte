<script context="module">
  export const CARDLAYOUT = {}
</script>
<script>
  import { afterUpdate, onDestroy, tick, setContext } from 'svelte'
  import { writable } from 'svelte/store'
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
      block.order = writable(0)
      block.linebreak = writable(false)
      block.width = writable('0px')
      return block
    },
    gutter
  })

  // make number of columns rely on the current width of the card layout area
  let w = widthguess // this is bound to .cardlayout clientWidth, see HTML section below
  let cycling = false
  let cycle1 = 0
  let cycle2 = 0
  $: { // sometimes scroll bars autohide and change the width, which can
       // lead to cycles, so we need cycle prevention
    if (cycling) {
      if (w !== cycle1 && w !== cycle2) {
        cycling = false
        cycle1 = 0
        cycle2 = 0
      }
    } else if (cycle1 === 0 && w !== cycle2) {
      cycle1 = w
    } else if (cycle2 === 0 && w !== cycle1) {
      cycle2 = w
    } else {
      cycling = true
    }
  }
  $: columns = Math.ceil(w / maxwidth)
  $: guttereach = gutter * (columns-1) / columns

  // this next section is designed to minimize the amount of work that needs to be done
  // svelte is responsible for creating all cardlayout components and placing them into
  // .cardlayout-unsorted, then after svelte finishes rendering, we use pure JS to move
  // the images into the correct column according to the heights
  // this way all the dom elements are preserved in responsive re-renders (because we
  // use a keyed #each loop to create them)
  let savecolumns = 0
  $: savecolumns = 0 * blocks.length // little trick to trigger a sort when blocks array changes
  let optimal
  let fullheight = 0
  let pendingupdate = false
  afterUpdate(async () => {
    if (pendingupdate || cycling) return
    while (savecolumns !== columns) { // wait for columns to stabilize, in case we're inside a responsive container
      pendingupdate = true
      for (const block of blocks) block.width.set(`calc(${100.0 / columns}% - ${guttereach}px`)
      savecolumns = columns
      await tick()
    }

    // collect all the card heights at this new column width
    for (const block of blocks) block.height = block.element.clientHeight

    if (pendingupdate) { // only do work if number of columns has changed, afterUpdate triggers on resize
      if (preserveorder) {
        optimal = [blocks]
        if (columns > 1) {
          const totalheight = blocks.reduce((totalheight, block) => totalheight + block.height + gutter, 0)
          const minheight = Math.max(totalheight / columns, ...blocks.map(b => b.height))
          let shortestoverall = totalheight
          // 2d packing problem is NP-hard so this is an O(n) heuristic
          // optimal configuration would be if each column is `minheight` so start there
          // then relax it in a few increments and see if the overall height shrinks
          for (let colmaxheight = minheight; colmaxheight < 1.5*minheight; colmaxheight += 0.1 * minheight) {
            let colheight = 0
            let colidx = 0
            let tallestcol = 0
            const arrangement = []
            for (const block of blocks) {
              if (colheight + block.height > colmaxheight && colidx < columns - 1) {
                colidx++
                if (colheight > tallestcol) tallestcol = colheight
                colheight = 0
              }
              if (!arrangement[colidx]) arrangement[colidx] = []
              arrangement[colidx].push(block)
              colheight += block.height + gutter
            }
            if (colheight > tallestcol) tallestcol = colheight
            if (tallestcol < shortestoverall) {
              shortestoverall = tallestcol
              optimal = arrangement
            }
          }
        }
      } else {
        optimal = []
        const heights = Array.apply(null, Array(columns)).map(h => 0) // initializes heights to an array of zeroes
        // begin sorting blocks into columns
        for (const block of blocks) {
          // find the column with the smallest current height
          const colidx = heights.reduce((acc, curr, curridx) => curr < heights[acc] ? curridx : acc, 0)
          // record the height we are adding to the chosen column
          // do NOT read the height from the DOM, it would cause thrashing
          heights[colidx] += block.height + gutter
          // move the current card to the chosen column
          if (!optimal[colidx]) optimal[colidx] = []
          optimal[colidx].push(block)
        }
      }
      // we created the optimal arrangement, now move the block elements to
      // reflect it
      let order = 0
      for (let i = 0; i < optimal.length; i++) {
        for(let j = 0; j < optimal[i].length; j++) {
          const block = optimal[i][j]
          block.order.set(order++)
          block.linebreak.set(j === optimal[i].length - 1 && i < optimal.length - 1)
        }
      }
      pendingupdate = false
    }
    // re-adjust container height
    fullheight = 0
    for (let i = 0; i < optimal.length; i++) {
      let top = 0
      for(const block of optimal[i]) {
        top += block.height + gutter
      }
      fullheight = Math.max(fullheight, top)
    }
    fullheight += 20
  })
</script>

<style>
  .cardlayout {
    position: relative;
    list-style: none;
    padding: 0;
    margin: 0;
    overflow: hidden;
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    align-content: space-between;
  }
</style>

<ul class="cardlayout {className}" bind:clientWidth={w} style="height: {fullheight}px;">
  <slot></slot>
</ul>
