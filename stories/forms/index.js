import { storiesOf } from '@storybook/svelte'
import MultiSelectExample from './MultiSelectExample.svelte'

storiesOf('MultiSelect', module)
  .add('Regular', () => ({
    Component: MultiSelectExample
  }))
