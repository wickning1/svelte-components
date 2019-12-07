<script>
  import CardLayout from '../../src/FlexCardLayout.svelte'
  import Card from '../../src/FlexCard.svelte'
  export let maxwidth = undefined
  export let className = 'test1'
  export let preserveorder = false
  let cards = [
    { ptop: 30 },
    { ptop: 50 },
    { ptop: 20 },
    { ptop: 100 },
    { ptop: 40 },
    { ptop: 56.25 },
    { ptop: 150 },
    { ptop: 80 },
    { ptop: 10 }
  ]
  function randheight () {
    return Math.ceil(Math.random() * 150) + 20
  }
  function mutateall () {
    cards = cards.map(c => ({ ptop: randheight() }))
  }
  function mutatecard () {
    const which = Math.floor(Math.random() * cards.length)
    cards[which].ptop = randheight()
  }
  function addcard () {
    cards = [...cards, { ptop: randheight() }]
  }
</script>

<style>
  .card {
    position: relative;
    background-color: rgba(0, 0, 0, 0.3);
    transition: padding-top 0.5s;
  }
  .card:focus {
    outline: 2px solid blue;
  }
  .card span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
  }
</style>

<CardLayout className={className} maxwidth={maxwidth} preserveorder={preserveorder}>
  {#each cards as card, i}
    <Card><div class="card card{i+1}" style="padding-top: {card.ptop}%;" tabindex=0><span>Card {i+1}</span></div></Card>
  {/each}
</CardLayout>

<button on:click={mutateall}>Randomize All</button>
<button on:click={mutatecard}>Randomize Card</button>
<button on:click={addcard}>Add Card</button>
