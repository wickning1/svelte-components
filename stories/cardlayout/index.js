import { storiesOf } from '@storybook/svelte'
import NineCards from './NineCards.svelte'

storiesOf('CardLayout', module)
  .add('Regular Layout', () => ({
    Component: NineCards,
    props: {
      className: 'test1',
      maxwidth: 400
    }
  }))
  .add('Preserve Order', () => ({
    Component: NineCards,
    props: {
      className: 'test1',
      maxwidth: 400,
      preserveorder: true
    }
  }))
