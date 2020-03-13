<script>
  import { onMount, onDestroy, tick } from 'svelte'
  import { randomid } from 'txstate-utils'
  import ScreenReaderOnly from '../ScreenReaderOnly.svelte'
  import { setCursorToEnd, modifierKey } from '../lib'

  export let name
  export let getOptions
  export let lookupOptions = async vals => {
    return Promise.all(vals.map(async val => {
      const suggestions = await getOptions(val)
      const first = suggestions[0]
      if (first && typeof first === 'object') return first
      if (first) return { value: first }
      return { value: val }
    }))
  }
  export let id = randomid()
  export let label = ''
  export let value = []
  export let placeholder = ''
  export let noResultText = 'No Results'

  let activearea = false
  let inputvalue = ''
  let rawOptions = []
  let options = []
  let optionelements = []
  let selected = []
  let selectedelements = []

  async function repositionMenu () {
    if (!menushown) return
    await tick()
    const rect = inputcontainerelement.getBoundingClientRect()
    offsetleft = rect.left + (window.pageXOffset || document.documentElement.scrollLeft)
    offsettop = rect.bottom + (window.pageYOffset || document.documentElement.scrollTop) + 2
  }

  function cleanupOptions (opts) {
    const ret = opts.map(r => typeof r !== 'object' ? { value: r } : r).filter(o => !value.includes(o.value))
    return ret.length ? ret : [{ value: '', label: noResultText }]
  }

  async function reactToInputChange (inputvalue) {
    rawOptions = await getOptions(inputvalue)
    options = cleanupOptions(rawOptions)
  }
  $: reactToInputChange(inputvalue)

  async function reactToValueChange (value) {
    const keep = selected.filter(s => value.some(v => s.value === v))
    const newopts = value.filter(v => !selected.some(s => s.value === v))
    if (newopts.length) {
      const results = await lookupOptions(newopts)
      selected = [...keep, ...results]
    }
    options = cleanupOptions(rawOptions)
    repositionMenu()
  }
  $: reactToValueChange(value)

  $: availablemessage = options.filter(o => o.value).length + ' autocomplete choices available'
  let menuhidden = false
  $: menushown = activearea && !menuhidden && selectedidx === -1
  $: if (menushown) repositionMenu()

  let selectedidx = -1
  let hilitedidx = -1

  let inputcontainerelement
  let inputelement
  let menuelement
  let offsetleft = 0
  let offsettop = 0
  let menuid = randomid()
  let descriptionid = randomid()
  onMount(() => {
    document.body.appendChild(menuelement)
  })
  onDestroy(() => {
    document.body.removeChild(menuelement)
  })
  function showMenu () {
    if (menushown) return
    menuhidden = false
    hilitedidx = -1
    selectedidx = -1
    if (window.innerWidth < 400) inputcontainerelement.scrollIntoView(true)
    inputelement.focus()
  }
  function addSelection (e) {
    inputvalue = ''
    const opt = options.find(o => o.value === e.target.dataset.value)
    if (opt && opt.value) {
      selected = [...selected, opt]
      value = [...value, opt.value]
    }
    inputelement.focus()
  }
  function removeSelection (selectedelement, nextfocus = 0) {
    let idx
    const opt = selected.find((s, i) => {
      if (selectedelements[i] === selectedelement) {
        idx = i
        return true
      }
    })
    if (!opt) return
    selected = selected.filter(s => s.value !== opt.value)
    value = value.filter(v => v !== opt.value)
    if (nextfocus === 1 && selected.length > idx) select(idx)
    else if (nextfocus === -1 && idx > 0) select(idx - 1)
    else inputelement.focus()

  }
  function hilite (newidx) {
    if (newidx < options.length) hilitedidx = newidx
    optionelements[hilitedidx].focus()
  }
  function select (newidx) {
    if (newidx >= 0 && newidx < selected.length) selectedidx = newidx
    selectedelements[selectedidx].focus()
  }
  function inputkeydown (e) {
    if (modifierKey(e)) return
    e.stopPropagation()
    if (e.key === 'ArrowDown') {
      if (!menushown) showMenu()
      else hilite(0)
    } else if (e.key === 'ArrowLeft') {
      select(selected.length - 1)
    } else if (['Backspace', 'Delete'].includes(e.key) && !inputvalue) {
      select(selected.length - 1)
    } else if (e.key === 'Escape') {
      menuhidden = true
    }
  }
  function menukeydown (e) {
    if (modifierKey(e)) return
    e.stopPropagation()
    if (e.key === 'ArrowUp') {
      if (hilitedidx === 0) inputelement.focus()
      else hilite(hilitedidx - 1)
    } else if (e.key === 'ArrowDown') {
      hilite(hilitedidx + 1)
    } else if (e.key === 'ArrowLeft') {
      select(selected.length - 1)
    } else if (['Enter', 'Space'].includes(e.key)) {
      addSelection(e)
      e.preventDefault()
    } else if (e.key === 'Escape') {
      menuhidden = true
      inputelement.focus()
    } else {
      inputelement.focus()
    }
  }
  function selectedkeydown (e) {
    if (modifierKey(e)) return
    e.stopPropagation()
    if (e.type === 'click') {
      removeSelection(e.target)
      e.preventDefault()
    } else if (e.key === 'ArrowDown') {
      inputelement.focus()
    } else if (e.key === 'ArrowLeft') {
      select(selectedidx - 1)
    } else if (e.key === 'ArrowRight') {
      if (selectedidx === selected.length - 1) inputelement.focus()
      else select(selectedidx + 1)
    } else if (['Backspace', 'Delete', 'Clear', 'Space', 'Enter'].includes(e.key)) {
      removeSelection(e.target, e.key === 'Delete' ? 1 : -1)
      e.preventDefault()
    } else if (e.key === 'Escape') {
      inputelement.focus()
      e.preventDefault()
    }
  }
  function onclick (e) {
    addSelection(e)
  }
  function inputfocus () {
    setCursorToEnd(inputelement)
    showMenu()
  }
  let timer
  function onfocusin () {
    clearTimeout(timer)
    activearea = true
  }
  function onfocusout (e) {
    activearea = menuelement.contains(e.relatedTarget)
    clearTimeout(timer)
    setTimeout(() => { inputvalue = '' }, 500)
  }
</script>

<style>
  fieldset {
    border: 0;
  }
  fieldset * {
    box-sizing: border-box;
  }
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  li {
    cursor: pointer;
  }
  input {
    outline: 0;
    border: 0;
    min-width: 0;
    width: 100%;
    height: 100%;
    font-size: 16px;
  }
  .multiselect-selected {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    padding: 5px;
    border: 1px solid #666666;
    border-radius: 5px;
  }
  .multiselect-selected li {
    flex-grow: 0;
    margin-right: 5px;
  }
  .multiselect-selected li.input {
    flex-grow: 1;
  }
  .multiselect-pill {
    height: 28px;
    border-radius: 14px;
    background-color: var(--multiselect-pill-bg, transparent);
    border: 1px solid var(--multiselect-pill-border, gray);
    color: var(--multiselect-pill-text, black);
    padding: 4px 8px;
  }
  .multiselect-pill:focus {
    outline: 0;
    background-color: var(--multiselect-pill-selected, gray);
    border: 1px solid var(--multiselect-pill-selected-border, transparent);
    color: var(--multiselect-pill-selected-text, white);
  }
  .multiselect-menu {
    position: absolute;
    background-color: white;
    border: 1px solid black;
    min-width: 300px;
    max-height: 80vh;
    overflow-y: auto;
  }
  .multiselect-menu li {
    padding: 5px 15px;
  }
  .multiselect-menu li:hover, .multiselect-menu li:focus {
    outline: 0;
    background-color: lightblue;
  }
  .multiselect-menu li.noresults {
    font-style: italic;
    font-size: 0.9em;
    text-align: center;
    color: var(--multiselect-noresult-color, #333333);
  }
  .multiselect-menu li.noresults:hover {
    background: none;
  }
  .multiselect-selected.focuswithin {
    outline-width: var(--multiselect-focus-width, 2px);
    outline-style: solid;
    outline-color: var(--multiselect-focus-color, Highlight);
  }
</style>

<fieldset on:focusout={onfocusout} on:focusin={onfocusin}>
  {#if label}<legend id="leg-{id}">{label}</legend>{/if}
  <ul class="multiselect-selected" role="listbox" class:focuswithin={activearea} bind:this={inputcontainerelement} on:click={() => inputelement.focus()}>
    {#each selected as option, i}
      <li role="option" tabindex="-1" class="multiselect-pill" bind:this={selectedelements[i]}
        on:keydown={selectedkeydown} on:click={selectedkeydown}
        aria-selected="true" aria-labelledby="leg-{id}">
        {option.label || option.value}
        <ScreenReaderOnly>, click to remove</ScreenReaderOnly>
      </li>
    {/each}
    <li class="input">
      <input type="text" id={id} name={name} placeholder={placeholder}
        bind:this={inputelement} bind:value={inputvalue}
        on:focus={inputfocus} on:click|stopPropagation={showMenu} on:keydown={inputkeydown}
        autocomplete="off" autocorrect="off" spellcheck="false" aria-autocomplete="list"
        aria-labelledby="leg-{id}" aria-describedby="{descriptionid}" aria-owns={menuid}>
    </li>
  </ul>
  <ScreenReaderOnly id={descriptionid} arialive="assertive">
    <span>{selected.length ? selected.length + ' selected' : 'select multiple'}, up down to choose, left right to select existing choices</span>
    {#if menushown}<span>{availablemessage}, touch users explore to find autocomplete menu</span>{/if}
  </ScreenReaderOnly>
  <ul id={menuid} bind:this={menuelement} on:keydown={menukeydown} on:focusout={onfocusout}
    on:focusin={onfocusin} role="listbox" class="multiselect-menu"
    style="display: {menushown ? 'block' : 'none'}; left: {offsetleft}px; top: {offsettop}px">
    {#each options as option, i (option.value)}
      <li bind:this={optionelements[i]} tabindex="-1"
        class:noresults={!option.value} aria-selected="false"
        role="option" data-value={option.value} on:click={onclick}>
        {option.label || option.value}
        <ScreenReaderOnly>, click to autocomplete</ScreenReaderOnly>
      </li>
    {/each}
  </ul>
  <slot></slot>
</fieldset>
