var express = require('express');
var ApiRoutes = require('./modules/ApiRoutes.js');
var PublicRoutes = require('./modules/PublicRoutes.js');
var http = require('http');
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
var apiRouter = express.Router()
var pubServerRouter = express.Router()

//
// Setup the routes.
//
apiRouter.use(cors({
  origin: '*'
}));
apiRouter.use(function(req, res, next) {
  res.header("Origin", "*");
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

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
ScriptPad.httpServer = http.createServer(ScriptPad.app, {
        log: false,
        agent: false,
        origins: '*'
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
