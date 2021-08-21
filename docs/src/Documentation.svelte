<script>
  import Main from './Main.svexy'
  import MainWindows from './MainWindows.svexy'
  import MainMenu from './MainMenu.svexy'
  import ScriptEditor from './ScriptEditor.svexy'
  import RegularExpressionEditor from './RegularExpressionEditor.svexy'
  import FeaturesStillComming from './FeaturesStillComming.svexy'
  import FilesUsed from './FilesUsed.svexy'
  import TodoList from './TodoList.svexy'
  import Preferences from './Preferences.svexy'
  import Templater from './Templater.svexy'
  import Alfred from './Alfred.svexy'
  import Dropzone from './Dropzone.svexy'
  import KeyboardMaestro from './KeyboardMaestro.svexy'
  import LaunchBar from './LaunchBar.svexy'
  import PopClip from './PopClip.svexy'
  import QueryUser from './QueryUser.svexy'
  import Modules from './Modules.svexy'
  import CommandConsole from './CommandConsole.svexy'
  import NodeRed from './NodeRed.svexy'
  import API from './API.svexy';
  
  let currentPage = 'Main'

  function changePage(page) {
    currentPage = page;
  }
</script>

<style>

  #page {
    display: flex;
    flex-direction: row;
    overflow: hidden;
  }

  #main {
    display: block;
    width: 65%;
    margin-right: 20px;
    overflow-y: scroll;
  }

  #sidebar {
    display: flex;
    flex-direction: column;
    width: 25%;
    margin-left: 20px;
  }

  #sidebar ul li {
    cursor: pointer;
    margin: 10px 0px 0px 0px;
    color: blue;
  }

  :global(img) {
    border-radius: 10px;
    border: 2px solid black;
  }

  :global(td) {
    padding: 5px;
    border: 2px solid black;
  }
</style>

<div id="page">
  <div id="sidebar">
    <h2>Contents</h2>
    <ul>
      <li on:click="{() =>{ changePage('Main')}}">ScriptPad</li>
      <li on:click="{() =>{ changePage('MainWindow')}}">Main Window</li>
      <li on:click="{() =>{ changePage('MainMenu')}}">Main Menu</li>
      <li on:click="{() =>{ changePage('ScriptEditor')}}">Script Editor</li>
      <li on:click="{() =>{ changePage('RegularExpressionEditor')}}">Regular Expression Editor</li>
      <li on:click="{() =>{ changePage('TodoList')}}">Todo lists</li>
      <li on:click="{() =>{ changePage('Templater')}}">Templater</li>      
      <li on:click="{() =>{ changePage('Preferences')}}">Preferences</li>
      <li on:click="{() =>{ changePage('CommandConsole')}}">Command Console</li>
      <li on:click="{() =>{ changePage('NodeRed')}}">Node-Red</li>
      <li on:click="{() =>{ changePage('Modules')}}">Modules</li>
      <li on:click="{() =>{ changePage('queryUser')}}">queryUser Program</li>
      <li on:click="{() =>{ changePage('API')}}">API Reference</li>
      <li on:click="{() =>{ changePage('Alfred')}}">Alfred Workflow</li>
      <li on:click="{() =>{ changePage('Dropzone')}}">Dropzone Action</li>
      <li on:click="{() =>{ changePage('KeyboardMaestro')}}">Keyboard Maestro</li>
      <li on:click="{() =>{ changePage('LaunchBar')}}">LaunchBar Actions</li>
      <li on:click="{() =>{ changePage('PopClip')}}">PopClip Extension</li>
      <li on:click="{() =>{ changePage('FilesUsed')}}">Files Used</li>
      <li on:click="{() =>{ changePage('FeaturesStillComming')}}">Features Still to Come</li>
    </ul>
  </div>
  <div id="main" >
    {#if currentPage === 'Main'}
      <Main />
    {:else if currentPage === 'MainWindow'}
      <MainWindows />
    {:else if currentPage === 'MainMenu'}
      <MainMenu />
    {:else if currentPage === 'ScriptEditor'}
      <ScriptEditor />
    {:else if currentPage === 'RegularExpressionEditor'}
      <RegularExpressionEditor />
    {:else if currentPage === 'TodoList'}
      <TodoList />
    {:else if currentPage === 'FilesUsed'}
      <FilesUsed />
    {:else if currentPage === 'Templater'}
      <Templater />
    {:else if currentPage === 'Preferences'}
      <Preferences />
    {:else if currentPage === 'CommandConsole'}
      <CommandConsole />
    {:else if currentPage === 'NodeRed'}
      <NodeRed />
    {:else if currentPage === 'API'}
      <API />
    {:else if currentPage === 'Alfred'}
      <Alfred />
    {:else if currentPage === 'Dropzone'}
      <Dropzone />
    {:else if currentPage === 'KeyboardMaestro'}
      <KeyboardMaestro />
    {:else if currentPage === 'LaunchBar'}
      <LaunchBar />
    {:else if currentPage === 'PopClip'}
      <PopClip />
    {:else if currentPage === 'FeaturesStillComming'}
      <FeaturesStillComming />
    {:else if currentPage === 'queryUser'}
      <QueryUser />
    {:else if currentPage === 'Modules'}
      <Modules />
    {/if}
  </div>
</div>
