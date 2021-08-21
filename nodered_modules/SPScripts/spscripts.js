module.exports = function(RED) {
  function spscripts(config) {
    RED.nodes.createNode(this,config);
    var node = this;
    var script = config.scriptName;
    this.on('input', function(msg, send, done) {
      var ScriptPad = node.context().global.get('ScriptPad');
      //
      // Run the script on the input.
      //
      var result = ScriptPad.runJavaScriptScripts(ScriptPad.getJavaScriptScript(script), msg.payload);
      msg.payload = result;
      send(msg);
    });
  }

  RED.nodes.registerType("spscripts",spscripts);
}
