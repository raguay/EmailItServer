import ScriptLauncher from './ScriptLauncher.svelte';

var scriptList = [
  {
    name: "Open fman",
    description: "Open a copy of the fman program.",
    script: "",
    args: [],
    color: "lightgreen",
    textColor: "darkgreen"
  },
  {
    name: "Create Todos",
    description: "Create the todo list.",
    script: "createtodo",
    args: [],
    color: "lightpink",
    textColor: "blue"
  },
  {
    name: "Compile ScriptPad",
    description: "Do a full compile job on ScriptPad.",
    script: "compileSP",
    args: [],
    color: "yellow",
    textColor: "black"
  }
]

var styles = {
  backgroundColor: "lightblue",
  textColor: "black"
}

var preferences = {
}

//
// Create the application.
//
const app = new ScriptLauncher({
	target: document.body,
	props: {
    list: scriptList,
    pref: preferences,
    style: styles
	}
});

//
// Save a global copy for debugging.
// 
window.app = app;

export default app;
