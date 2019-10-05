<script>
  import CardLayout from '../../src/FlexCardLayout.svelte'
  import Card from '../../src/FlexCard.svelte'
  export let maxwidth = undefined
  export let className = 'test1'
  export let preserveorder = false
</script>

<style>
  .card { position: relative; background-color: rgba(0, 0, 0, 0.3); }
  .card span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
  }
  .card1 { padding-top: 30%; }
  .card2 { padding-top: 50%; }
  .card3 { padding-top: 20%; }
  .card4 { padding-top: 100%; }
  .card5 { padding-top: 40%; }
  .card6 { padding-top: 56.25%; }
  .card7 { padding-top: 150%; }
  .card8 { padding-top: 80%; }
  .card9 { padding-top: 10%; }
</style>

<CardLayout className={className} maxwidth={maxwidth} preserveorder={preserveorder}>
  <Card><div class="card card1"><span>Card 1</span></div></Card>
  <Card><div class="card card2"><span>Card 2</span></div></Card>
  <Card><div class="card card3"><span>Card 3</span></div></Card>
  <Card><div class="card card4"><span>Card 4</span></div></Card>
  <Card><div class="card card5"><span>Card 5</span></div></Card>
  <Card><div class="card card6"><span>Card 6</span></div></Card>
  <Card><div class="card card7"><span>Card 7</span></div></Card>
  <Card><div class="card card8"><span>Card 8</span></div></Card>
  <Card><div class="card card9"><span>Card 9</span></div></Card>
</CardLayout>
