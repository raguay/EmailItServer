// LaunchBar Action Script

function run(argument) {
    if (argument == undefined) {
        // Inform the user that there was no argument
        LaunchBar.alert('No argument was passed to the action');
    } else {
        // Return a single item that describes the argument
        var list = getScriptList();
        var result = [];
        for (var i = list.length - 1; i >= 0; i--) {
           result[i] = {
               title: list[i],
               action: 'runScript',
               actionArgument: {
                  script: list[i],
                  text: argument
               },
               actionRunsInBackground: true
            };
         }
         return result;
    }
}

function getScriptList() { 
   return HTTP.getJSON("http://localhost:9978/api/scripts/list").data
}

function runScript(obj) {
   var result = HTTP.loadRequest(HTTP.createRequest("http://localhost:9978/api/script/run", {
      method: "PUT",
      body: obj,
      bodyType: "json",
      resultType: "json"
   }))
   if (result.data != undefined) {
      // Do something useful with the data (a String)
      LaunchBar.paste(result.data.text);
   } else if (result.timedOut) {
      LaunchBar.alert('Unable to load the LaunchBar page due to a timeout');
   } else if (result.error != undefined) {
      LaunchBar.alert('Unable to load the LaunchBar page', result.error);
   }
}
