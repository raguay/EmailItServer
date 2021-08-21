module.exports = function(RED) {
  function splogger(config) {
    RED.nodes.createNode(this,config);
    var node = this;
    this.on('input', function(msg, send, done) {
      var ScriptPad = node.context().global.get('ScriptPad');
      var ans = {
        timestamp: Date.now(),
        msg: JSON.stringify(msg.payload, null, 2)
      };
      ScriptPad.logger(ans);
    
      // Once finished, call 'done'.
      done();
    });
  }

  RED.nodes.registerType("ScriptPad Logger",splogger);
}
