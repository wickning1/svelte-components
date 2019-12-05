<script>
  import { MultiSelect } from '../../src'
</script>

<MultiSelect name="test" label="Fruit" value={['apple']} getOptions={async val => ['apple', 'orange', 'banana'].filter(o => o.includes(val))} />

<MultiSelect name="test" label="Fruit" value={['orange', 'banana']} placeholder='Choose some fruit' getOptions={async val => [
  { value: 'apple', label: 'Apple'},
  { value: 'orange', label: 'Orange' },
  { value: 'banana', label: 'Banana' }
].filter(o => o.value.includes(val))} />
