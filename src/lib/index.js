import equal from 'fast-deep-equal'
import { writable } from 'svelte/store'
import { cloneDeep } from 'lodash-es'

export function setCursorToEnd (inputelement) {
  setTimeout(() => inputelement.setSelectionRange(10000, 10000), 0)
}

export function modifierKey (e) {
  return e.ctrlKey || e.altKey || e.metaKey || e.key === 'Insert'
}

export function deepderived (store, getter, immutable = false) {
  const dest = writable(undefined)
  let current
  store.subscribe(data => {
    const reduced = getter(data)
    if (!equal(reduced, current)) {
      current = immutable ? reduced : cloneDeep(reduced)
      dest.set(reduced)
    }
  })
  return dest
}
