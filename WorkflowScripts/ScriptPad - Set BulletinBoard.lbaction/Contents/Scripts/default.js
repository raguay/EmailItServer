// LaunchBar Action Script

function run(argument) {
   if (argument == undefined) {
      // Inform the user that there was no argument
      LaunchBar.alert('I have to have something to put.');
   } else {
      run(argument)
   }
}

function runWithItem(item) {
   //
   // A note was sent. Save to notepad.
   //
   run(item)
}

function runWithString(msg) {
   run(msg)
}

function run(argument) {
   setScriptPadBulletinBoard(argument)
}

function setScriptPadBulletinBoard(obj) {
   if (obj != '-') {
      var url = 'http://localhost:9697/api/message/' + encodeURI(obj)
      var req = HTTP.getJSON(url)
   } else {
      var url = 'http://localhost:9697/api/message/'
      var req = HTTP.getJSON(url)
   }
}
