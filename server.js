var express = require('express');
var ApiRoutes = require('./modules/ApiRoutes.js');
var PublicRoutes = require('./modules/PublicRoutes.js');
var http = require('http');
var socketio = require('socket.io');
var ScriptPad = require('./modules/ScriptPad.js');
var cors = require('cors');

//
// Initialize the ScriptPad object.
//
ScriptPad.init();

//
// Create the main Express application.
//
ScriptPad.app = express()

//
// Create the router.
//
ScriptPad.app.use(cors());
var apiRouter = express.Router()
var pubServerRouter = express.Router()

//
// Setup the routes.
//
ApiRoutes(apiRouter, express, ScriptPad);
PublicRoutes(pubServerRouter, express);

//
// Add the different routers.
//
ScriptPad.app.use('/api', apiRouter)
ScriptPad.app.use('/', pubServerRouter)

//
// Create the server.
//
ScriptPad.httpServer = http.createServer(ScriptPad.app);

//
// Create the websocket connection.
//
ScriptPad.io = socketio(ScriptPad.httpServer);

ScriptPad.io.on('connection',(client) => {
  ScriptPad.logger('Client connected...');
  ScriptPad.ioClients.push(client);
});
ScriptPad.io.on('disconnect', (client) => {
  ScriptPad.logger('Client disconnected...');
  ScriptPad.logger(client);
  ScriptPad.ioClients = ScriptPad.ioClients.find(item => item !== client);
});

//
// Initialize Node-Red
//
ScriptPad.initNodeRed(ScriptPad.logger);
ScriptPad.startRed(()=>{ ScriptPad.logger("Node Red Started...")});

//
// Run the server:
//
try {
  ScriptPad.logger(`connecting to port: ${ScriptPad.PORTNUMBER}`)
  ScriptPad.server = ScriptPad.httpServer.listen(ScriptPad.PORTNUMBER)
} catch (e) {
  ScriptPad.logger(e);
}
