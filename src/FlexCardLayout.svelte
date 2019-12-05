<script context="module">
  export const CARDLAYOUT = {}
</script>
<script>
  import { onMount, onDestroy, tick, setContext } from 'svelte'
  import { writable } from 'svelte/store'
  import ResizeObserver from 'resize-observer-polyfill'
  export let maxwidth = 500
  export let preserveorder = false
  export let gutter = 10
  export let className = ''

  let blocks = []
  let gutterstore = writable(gutter)
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
    recalculate: () => {
      savewidth = 0
      savecolumns = 0
      triggerrecalc()
    },
    gutter: gutterstore
  })
  $: gutterstore.set(gutter)

  let layoutelement

  let cycle1 = 0
  let cycle2 = 0
  function detectcycle (w) {
    if (cycle1 === 0 && Math.abs(w - cycle2) > 5) {
      cycle1 = w
    } else if (cycle2 === 0 && Math.abs(w - cycle1) > 5) {
      cycle2 = w
    } else if (w === cycle1 || w === cycle2) {
      return true
    } else {
      cycle1 = 0
      cycle2 = 0
    }
    return false
  }

  let savecolumns = 0
  let optimal
  let fullheight = 0
  async function recalculate (realw) {
    let columns = Math.ceil(realw / maxwidth)
    let guttereach = gutter * (columns-1) / columns
    const cycling = detectcycle(realw)

    if (columns !== savecolumns) {
      for (const block of blocks) block.width.set(`calc(${100.0 / columns}% - ${guttereach}px`)
      await tick()
    }
    // collect all the card heights at this new column width
    for (const block of blocks) block.height = block.element.offsetHeight

    if (columns !== savecolumns) { // only do real work if number of columns has changed, recalculate triggers on resize
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
      savecolumns = columns
    }
    // re-adjust container height
    const saveheight = fullheight
    fullheight = 0
    for (let i = 0; i < optimal.length; i++) {
      let top = 0
      for(const block of optimal[i]) {
        top += block.height + gutter
      }
      fullheight = Math.max(fullheight, top)
    }
    fullheight += 0
    if (cycling && saveheight > fullheight) fullheight = saveheight
  }

  let timer
  let savewidth = 0
  function triggerrecalc (width) {
    if (!layoutelement) return
    if (!width) width = layoutelement.clientWidth
    if (width === savewidth) return
    cancelAnimationFrame(timer)
    timer = requestAnimationFrame(() => {
      recalculate(width)
      savewidth = width
    })
  }

  $: triggerrecalc(0, blocks.length) // little trick to trigger a sort when blocks array changes
  const ro = new ResizeObserver((entries, observer) => {
    triggerrecalc(entries[0].contentBoxSize || entries[0].contentRect.width)
  })
  onMount(() => ro.observe(layoutelement))
</script>

<style>
  .cardlayout {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 150%;
    list-style: none;
    padding: 0;
    margin: 0;
    overflow: hidden;
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    align-content: space-between;
  }
  div {
    position: relative;
    overflow: hidden;
  }
</style>

<div style="height: {fullheight}px;">
  <ul class="cardlayout {className}" bind:this={layoutelement}>
    <slot></slot>
  </ul>
</div>
