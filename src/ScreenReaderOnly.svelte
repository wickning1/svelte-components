<script>
  export let id = ''
  export let arialive = ''
</script>

<style>
  .sr-only {
    border: 0 !important;
    clip: rect(1px, 1px, 1px, 1px) !important;
    -webkit-clip-path: inset(50%) !important;
      clip-path: inset(50%) !important;
    height: 1px !important;
    margin: -1px !important;
    overflow: hidden !important;
    padding: 0 !important;
    position: absolute !important;
    width: 1px !important;
    white-space: nowrap !important;
    font-size: 20px !important;
    background: white !important;
    color: black !important;
  }
</style>

<span id={id} class="sr-only" aria-live={arialive}><slot/></span>
