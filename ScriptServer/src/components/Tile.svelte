<div class="{active ? 'inactive' : 'active'} scriptItem" style="background-color: {item.color}; color: {item.textColor};" on:click="{(e) => { launchScript(item)}}">
  <p>{item.name}</p>
</div>

<style>
  .scriptItem {
    width:  20%;
    height: 20%;
    border-color: gray;
    border-radius: 10px;
    border-width: 3px;
    border-style: solid;
    margin: 10px;
    text-align: center;
    align-content: center;
  }

  .inactive {
    box-shadow: inset 5px 5px 5px grey;
  }

  .active {
    box-shadow: 5px 5px 5px grey;
  }
</style>


<script>
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();

  export let pref;
  export let item;
  export let style;
  let active = false;

  function fire(name, data) {
    dispatch(name, {
      data: data
    });
  }

  function launchScript(item) {
    toggleActive();
    fire('itemClicked', Object.assign(item,{
      toggle: toggleActive
    }));
  }

  function toggleActive() {
    active = !active;
  }
</script>


