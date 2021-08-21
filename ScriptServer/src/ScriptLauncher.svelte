<Header style="{style}" pref="{pref}" />
<div id="ScriptGrid" style="background-color: {style.backgroundColor}; color: {style.textColor};">
  {#each list as item}
    <Tile style="{style}" pref="{pref}" item="{item}" on:itemClicked="{(event) => { onClickHandler(event.detail.data); }}" />
  {/each}
</div>
<div id="newVars">
  <p>{redvar} changed to {redval}</p>
</div>

<style>
  #ScriptGrid {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-width: 100%;
    min-height: 100%;
    margin: 0px;
    padding: 10px;
  }
</style>

<script>
  import Tile from './components/Tile.svelte';
  import Header from './components/Header.svelte';
  import { onMount } from 'svelte';
  
  export let list;
  export let pref;
  export let style;

  let redvar = '';
  let redval = '';

  function onClickHandler(item) {
    //
    // Perform the action. After done, run the item.toggle() to turn
    // the item off.
    //
    setTimeout(()=>{item.toggle();}, 500)
  }

  onMount(() => {
    setTimeout( () => {
      globalThis.io = io();
		  globalThis.io.on('connection', (socket) => {
			  globalThis.socket = socket;
      });
      globalThis.io.on('varchanged', (data) => {
        redvar = data.variable;
        redval = data.value;
		  });
    }, 1000*5);
   });
</script>


