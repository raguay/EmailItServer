// LaunchBar Action Script
var store = null;

function run(argument) {
    if (argument == undefined) {
      // Inform the user that there was no argument
      LaunchBar.alert('No argument was passed to the action');
    } else {
      // Return a single item that describes the argument
      var list = "";
      if(store == null) {
        list = JSON.parse(getDialogList()).dialogs;
      }
      store = list;
      var result = [];
      for (var i = list.length - 1; i >= 0; i--) {
        result[i] = {
          title: list[i],
          action: 'runDialog',
          actionArgument: {
            dialog: list[i],
            arguments: argument
          },
          actionRunsInBackground: true
        };
      }
      return result;
    }
}

function getDialogList() { 
  return LaunchBar.execute('/Applications/ScriptPad.app/Contents/Resources/app.nw/bin/queryUser', 'list');
}

function runDialog(obj) {
  //
  // Run the dialog.
  //
  var result = LaunchBar.execute('/Applications/ScriptPad.app/Contents/Resources/app.nw/bin/queryUser', obj.dialog, ...obj.arguments.split("|"));
  if (result != undefined) {
    // Do something useful with the data (a String)
    LaunchBar.setClipboardString(result);
      LaunchBar.paste(result);
  }
}
