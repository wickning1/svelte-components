import { configure } from '@storybook/svelte'

function loadStories() {
  require('../stories/index.js')
}

configure(loadStories, module)
