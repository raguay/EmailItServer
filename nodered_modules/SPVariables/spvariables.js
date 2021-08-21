module.exports = function(RED) {
  function spvariables(config) {
    RED.nodes.createNode(this,config);
    var node = this;
    var variable = config.variable;
    this.on('input', function(msg, send, done) {
      var ScriptPad = node.context().global.get('ScriptPad');
      var payload = String(msg.payload);
      if(payload.localeCompare("read") === 0) {
        //
        // Get the variable and return it.
        //
        send({
          payload: ScriptPad.GetRedVar(variable)
        });
      } else {
        //
        // Default is to save the item.
        //
        ScriptPad.SetRedVar(variable, msg.payload);
        
        // Once finished, pass it on through.
        send(msg);
      } 
    });
  }

  RED.nodes.registerType("ScriptPad Variables",spvariables);
}
