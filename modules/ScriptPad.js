const moment = require('moment');
const Handlebars = require("handlebars");
const ip = require('ip');
const SystemScripts = require('./SystemScripts');
const SystemTemplates = require('./SystemTemplates');
const nodered = require('node-red');
const os = require('os');
const path = require('path');
const mathjs = require('mathjs');
const fs = require('fs');
const fsex = require('fs-extra');
const childProcess = require('child_process');
const clipboardy = require('clipboardy');

//
// Add math library extensions.
//
//mathjs.import(require('mathjs-simple-integral'));
//mathjs.import(require('../math.diff.js/math.diff.js'));

module.exports = {
  //
  // ScriptPad variables below:
  //
  messages: [],
  showLog: true,
  app: null,
  httpServer: null,
  server: null,
  HOME: os.homedir(),
  NOTES: null,
  CONFIGDIR: os.homedir() + '/.config/scriptserver',
  SCRIPTS: null,
  REGEXP: null,
  REDAuto: true,
  REDDashboard: false,
  RedSecret: "jesus-is-lord",
  SERVERLOCATION: path.dirname(__dirname),
  TEMPLATES: null,
  HOSTNAME: 'localhost',
  PORTNUMBER: 9978,
  CONNECTED: false,
  moment: moment,
  math: mathjs,
  Handlebars: Handlebars,
  NOTESDIR: '',
  NOTESFILELOC: '',
  SCRIPTSFILELOC: '',
  REGEXPFILELOC: '',
  USERTEMPLATESFILE: '',
  SCRIPTBARPREFERENCES: '',
  SERVERLISTPATH: '',
  REDSTARTED: false,    // Whether or not Node-Red has been started
  RED: null,            // Reference to the Node-Red object
  REDVARS: {},          // Node-Red Variables
  scriptEnv: null,
  ENVIRONMENTVARIABLESFILELOC: '',
  extScripts: null,
  EXTSCRIPTSFILELOC: '',
  EMAILACCOUNTSFILELOC: '',
  EMAILADDRESSFILELOC: '',
  SERVERON: true,

  //
  // All the system scripts and templates.
  //
  SYSTEMSCRIPTS: SystemScripts,
  SYSTEMTEMPLATES: SystemTemplates,

  // 
  // Variable for the Web Socket IO.
  //
  ioClients: [],

  //
  // All functions below:
  //
  logger: function (msg) {
    //
    // Make sure the messages buffer is defined.
    //
    if(typeof this.messages === 'undefined') this.messages = [];

    //
    // Format the time string and message.
    //
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'};
    if(typeof msg.timestamp !== 'undefined') {
      const time = new Date(msg.timestamp).toLocaleTimeString('en-US', options);
      msg = `[${time}] ${msg.msg}`
    } else {
      const time = new Date().toLocaleTimeString('en-US', options);
      msg = `[${time}] ${msg}`
    }

    //
    // Add it to the queue.
    //
    this.messages.push(msg);

    //
    // Keep it within the queue length.
    //
    while(this.messages.length > 1000) {
      this.messages.pop();
    }

    //
    // If showLog is true, log it to the command line.
    //
    if(this.showLog) {
      console.log(msg);
    }
  },
  init: function() {
    //
    // Make sure the config directory exists.
    //
    if(!fs.existsSync(this.CONFIGDIR)) {
      fs.mkdirSync(this.CONFIGDIR);
    }
    this.ioClients = [];
    this.NOTESDIR = this.CONFIGDIR;
    this.NOTESFILELOC = this.CONFIGDIR + '/notes.json';
    this.SCRIPTSFILELOC = this.CONFIGDIR + '/scripts.json';
    this.USERTEMPLATESFILE = this.CONFIGDIR + '/templates.json';
    this.SCRIPTBARPREFERENCES = this.CONFIGDIR + '/scriptbar.json';
    this.SERVERLISTPATH = this.CONFIGDIR + '/clipboardservers.json';
    this.EXTSCRIPTSFILELOC = this.CONFIGDIR + '/extscripts.json';
    this.ENVIRONMENTVARIABLESFILELOC = this.CONFIGDIR + '/environments.json';
    this.EMAILACCOUNTSFILELOC = this.CONFIGDIR + '/emailaccounts.json';
    this.EMAILADDRESSFILELOC = this.CONFIGDIR + '/emails.json';

    this.setupHandlebarHelpers();
  },

  //
  // Function:         getScripts
  //
  // Description:      This is for getting the user defined
  //                   scripts from the file and passing them on.
  //
  getScripts: function() {
    if (this.SCRIPTS === null) {
      //
      // Read the scripts file.
      //
      if (fs.existsSync(this.SCRIPTSFILELOC)) {
        this.SCRIPTS = JSON.parse(fs.readFileSync(this.SCRIPTSFILELOC, 'utf8'))
      } else {
        if (!fs.existsSync(this.NOTESDIR)) {
          //
          // Make the directory.
          //
          fs.mkdirSync(this.NOTESDIR)
        }
        this.SCRIPTS = []
        this.putScripts(this.SCRIPTS)
      }
    }
    return (this.SCRIPTS)
  },

  saveScript: function(scrpt) {
    var scripts = this.getScripts();
    scripts = scripts.filter(item => item.name !== scrpt.name);
    scripts.push(scrpt);
    this.putScripts(scripts);
  },

  deleteScript: function(scrpt) {
    var scripts = this.getScripts();
    scripts = scripts.filter(item => item.name !== scrpt);
    this.putScripts(scripts);
  },

  getSystemScripts: function() {
    return (this.SYSTEMSCRIPTS)
  },

  getSystemTemplates: function() {
    return(this.SYSTEMTEMPLATES)
  },
  getUserTemplates: function() {
     if (this.TEMPLATES === null) {
      //
      // Read the scripts file.
      //
      if (fs.existsSync(this.USERTEMPLATESFILE)) {
        this.TEMPLATES = JSON.parse(fs.readFileSync(this.USERTEMPLATESFILE, 'utf8'))
      } else {
        if (!fs.existsSync(this.NOTESDIR)) {
          //
          // Make the directory.
          //
          fs.mkdirSync(this.NOTESDIR)
        }
        this.TEMPLATES = []
        this.saveUserTemplates(this.TEMPLATES)
      }
    }
    return (this.TEMPLATES)
  },
  saveUserTemplates: function(templates) {
     if ((templates === null) || ((typeof templates) === 'undefined')) {
      templates = []
    }
    this.TEMPLATES = templates

    fs.writeFileSync(this.USERTEMPLATESFILE, JSON.stringify(this.TEMPLATES), 'utf-8', 0o666, 'w+')
  },
  //
  // Function:         getJavaScriptScript
  //
  // Description:      This will returned the named script.
  //
  // Inputs:
  //                   script          The name of the script.
  //
  getJavaScriptScript: function(script) {
    var scriptObj = this.getScripts().find(value => value.name == script)
    if (scriptObj === undefined) {
      scriptObj = this.getSystemScripts().find(value => value.name == script)
    }
    return scriptObj.script
  },

  //
  // Function:         runJavaScriptScripts
  //
  // Description:      This will run some given text with a script.
  //
  // Inputs:
  //                   script          The script.
  //                   text            The text to process.
  //
  runJavaScriptScripts: function(script, text) {
    var originalText = text;
    var that = this;
    var SP = {
      text: text,
      moment: moment,
      mathjs: mathjs,
      mathParser: mathjs.parser(),
      that: that,
      Handlebars: Handlebars,
      ProcessMathSelection: function(txt) {
        var result = this.mathParser.evaluate(txt)
        return result
      },
      ProcessMathNotes: function(Note) {
        var result = ''
        this.mathParser.clear()
        let lines = Note.match(/^.*((\\r\\n|\\n|\\r)|$)/gm)
        let numLines = lines.length
        for (let i=0;i<lines.length;i++) {
          var line = lines[i];
          var lineResult = ''
          line = line.trim()
          if (line.indexOf('>') === 0) {
            line = line.substr(2)
            var inx = line.indexOf('|')
            if (inx !== -1) {
              line = line.substr(0, inx-1)
              line = line.trim()
            }
            lineResult = this.mathParser.evaluate(line)
            if ((typeof lineResult) === 'function') {
              lineResult = 'Definition'
            }
            var whiteSP = 32 - (line.length + 3);
            if(whiteSP < 1) {
              whiteSP = 1;
            }
            result += '> ' + line + this.insertCharacters(whiteSP, ' ') + ' | ' + lineResult
          } else {
            result += line
          }
          if (--numLines !== 0) result += '\n'
        }
        return result
      },
      runScript: function(script, text) {
        return that.runJavaScriptScripts(that.getJavaScriptScript(script), text)
      },
      returnNote: function(id) {
        var result = '';
        id = id - 1;
        if((id >= 0) && (id <= 9)) result = that.NOTES[id];
        return result;
      },
      insertCharacters: function(num, ichar) {
        var result = ''
        if (num < 0) return result
        for (var i = 0; i < num; i++) {
          result += ichar
        }
        return result
      }
    };

    //
    // Try to evaluate the expression.
    //
    try {
      var scriptFunction = new Function('SP', `${script} ; return SP;`);
      SP = scriptFunction(SP);
    } catch (error) {
      this.logger(error);
      SP.text = originalText;
    }
    //
    // Make sure we have a string and not an array or object.
    //
    if(typeof SP.text != 'string') {
      SP.text = SP.text.toString();
    }
    return (SP.text);
  },

  //
  // Function:         putScripts
  //
  // Description:      This is for saving the user defined scripts.
  //
  // Inputs:
  //                   scripts         An array of script objects.
  //
  putScripts: function(scripts) {
    if ((scripts === null) || ((typeof scripts) === 'undefined')) {
      scripts = []
    }
    this.SCRIPTS = scripts

    fs.writeFileSync(this.SCRIPTSFILELOC, JSON.stringify(this.SCRIPTS), 'utf-8', 0o666, 'w+')
  },

  //
  // Function:         getNote
  //
  // Description:      This get the specified note from the
  //                   global variable making sure that it was read
  //                   from disk as well.
  //
  // Inputs:
  //                   noteid      The id of the note to get.
  //
  getNote: function(noteid) {
    if((noteid >= 0)&&(noteid <=9)) {
      this.readNotesFile()
      return (this.NOTES[noteid])
    }
  },

  //
  // Function:         saveNote
  //
  // Description:      This saves the note to the harddrive.
  //
  // Inputs:
  //                   noteid        The id of the note to save
  //                   body          The body of the note.
  //
  saveNote: function(noteid, body) {
    if ((body === null) || (typeof body === 'undefined')) {
      body = ""
    }
    if((noteid >= 0)&&(noteid <=8)) {
      this.readNotesFile()
      this.NOTES[noteid] = body
      this.writeNotesFile()
    }
  },
  //
  // Function:         writeNotesFile
  //
  // Description:      This actually writes the notes to the file.
  //
  writeNotesFile: function() {
    fs.writeFileSync(this.NOTESFILELOC, JSON.stringify(this.NOTES), 'utf-8', 0o666, 'w+')
  },

  //
  // Function:         readNotesFile
  //
  // Description:      This reads the notes file and gets all the notes.
  //
  readNotesFile: function() {
    if (this.NOTES === null) {
      if (fs.existsSync(this.NOTESFILELOC)) {
        this.NOTES = JSON.parse(fs.readFileSync(this.NOTESFILELOC, 'utf8'))
      } else {
        if (!fs.existsSync(this.NOTESDIR)) {
          //
          // Make the directory.
          //
          fs.mkdirSync(this.NOTESDIR)
        }
        this.NOTES = []
        this.NOTES[0] = ""
        this.NOTES[1] = ""
        this.NOTES[2] = ""
        this.NOTES[3] = ""
        this.NOTES[4] = ""
        this.NOTES[5] = ""
        this.NOTES[6] = ""
        this.NOTES[7] = ""
        this.NOTES[8] = ""
        this.NOTES[9] = ""
        this.writeNotesFile()
      }
    }
  },
  //
  // This is the installation for Alfred.
  //
  installAlfred: function() {
    let stdout = childProcess.execSync('cd "' + this.SERVERLOCATION + '/WorkflowScripts"; /usr/bin/open ScriptPadWorkflow.alfredworkflow');
  },
  //
  // This is the installation for Keyboard Maestro.
  //
  installKeyboardMaestro: function() {
    let stdout = childProcess.execSync('cd "' + this.SERVERLOCATION + '/WorkflowScripts"; /usr/bin/open ScriptPadMacros.kmlibrary');
  },
  //
  // This is the installation for Dropzone.
  //
  installDropzone: function() {
    let stdout = childProcess.execSync('cd "' + this.SERVERLOCATION + '/WorkflowScripts"; /usr/bin/open ScriptPad.dzbundle');
    stdout += childProcess.execSync('cd "' + this.SERVERLOCATION + '/WorkflowScripts"; /usr/bin/open "ScriptPad Run Script.dzbundle"');
  },
  //
  // This is the installation for PopClip.
  //
  installPopClip: function() {
    let stdout = childProcess.execSync('cd "' + this.SERVERLOCATION + '/WorkflowScripts"; /usr/bin/open ScriptPad.popclipext');
  },
  //
  // This is the installation for LaunchBar.
  //
  installLaunchBar: function() {
    let stdout = childProcess.execSync('cd "' + this.SERVERLOCATION + '/WorkflowScripts"; /usr/bin/open "ScriptPad - Set Note.lbaction"; /usr/bin/open "ScriptPad - Paste Note.lbaction"; /usr/bin/open "ScriptPad - Set BulletinBoard.lbaction";/usr/bin/open "ScriptPad - Append BulletinBoard.lbaction"; /usr/bin/open "ScriptPad - Run Script.lbaction"; /usr/bin/open "ScriptPad - Run Template.lbaction";');
  },

  //
  // This is for launching the help page.
  //
  showHelp: function() {
    var that = this;
    this.showURL('http://localhost:9978/docs', 'helpWin', (win) => {
    })
  },
  
  //
  // this function allows for the launching of an arbitrary website.
  // #TODO:
  showURL: function(url, ID, callback) {
  },

  //
  // These routes are for integration with TeaCode.
  //
  //
  //
  TeaCodeExpand: function(text, ext) {
    //
    // Get the expander to query and escape the quotes.
    //
    var expander = text.replace(new RegExp("\"", "g"), "\\\"");

    //
    // Query TeaCode with osascript.
    //
    let stdout = childProcess.execSync('/usr/bin/osascript -l JavaScript -e "Application(\'TeaCode\').expandAsJson(\'' + expander + '\', { \'extension\': \'' + ext + '\' })"');

    //
    // Return TeaCode's JSON return to the user.
    //
    return (JSON.parse(stdout.toString('utf8')))
  },
  quit: async function() {
    //
    // Close Node-Red
    //
    if(this.REDSTARTED) {
      this.RED.stop();
    }

    //
    // Close the server.
    //
    this.server.close();

    //
    // Close the Bulletinboard.
    //
    try {
      await fetch('http://localhost:9697/api/quit');
    } catch (error) {
      console.error(error);
    }
  },
  setupHandlebarHelpers: function() {
    //
    // Get a reference to the this of the current object.
    //
    var that = this;

    //
    // Create the helpers functions for Handlebars.
    //
    this.Handlebars.registerHelper('env', function(name) {
      return process.env[name];
    });

    this.Handlebars.registerHelper('save', function(name, text) {
      that.Handlebars.registerHelper(name, function() {
        return text;
      });
      return text;
    });

    this.Handlebars.registerHelper('clipboard', function() {
      return clipboardy.readSync();
    });

    this.Handlebars.registerHelper('date', function(dFormat) {
      return that.moment().format(dFormat);
    });

    this.Handlebars.registerHelper('cdate', function(cTime, dFormat) {
      return that.moment(cTime).format(dFormat);
    });

    this.Handlebars.registerHelper('last', function(weeks, dow, fmat) {
      return that.moment().add(-7 * weeks, 'd').day(dow).format(fmat);
    });

    this.Handlebars.registerHelper('next', function(weeks, dow, fmat) {
      return that.moment().add(7 * weeks, 'd').day(dow).format(fmat);
    });

    this.Handlebars.registerHelper('userfillin', function(ques, defA = "") {
      return that.getFeedback(ques, defA);
    });

    this.Handlebars.registerHelper('copyclip', function(name) {
      return that.getCopyClip(name);
    });
  },
  getFeedback: function( Question, Default ) {
    return this.getAnswer(Question, Default);
  },
  listTemplates: function() {
    var result = this.getSystemTemplates().map(item => { return item.name; });
    result = result.concat(this.getUserTemplates().map(item => { return item.name; }));
    return result;
  },
  listUserTemplates: function() {
    var result = this.getUserTemplates().map(item => { return item.name; });
    return result;
  },
  getTemplateByName: function(name) {
    var result = this.getUserTemplates().find(item => item.name === name);
    if(typeof result === 'undefined') {
      result = this.getSystemTemplates().find(item => item.name === name);
    } else if (typeof result === 'undefined') {
      result = null;
    }
    return(result);
  },
  addTemplate: function(temp) {
    var templates = this.getUserTemplates();
    templates = templates.filter(item => item.name !== temp.name);
    templates.push(temp);
    this.saveUserTemplates(templates);
  },
  deleteTemplate: function(temp) {
    var templates = this.getUserTemplates();
    templates = templates.filter(item => item.name !== temp);
    this.saveUserTemplates(templates);
  },
  runTemplate: function(templateName, template, text) { 
    var result = '';
    try {
      //
      // Create various default targets for the templater. These have
      // to be created since they are various types of time/date stamps.
      //
      var data = [];
      data["cDateMDY"] = this.moment().format("MMMM DD, YYYY");
      data["cDateDMY"] = this.moment().format("DD MMMM YYYY");
      data["cDateDOWDMY"] = this.moment().format("dddd, DD MMMM YYYY");
      data["cDateDOWMDY"] = this.moment().format("dddd MMMM DD, YYYY");
      data["cDay"] = this.moment().format("DD");
      data["cMonth"] = this.moment().format("MMMM");
      data["cYear"] = this.moment().format("YYYY");
      data["cMonthShort"] = this.moment().format("MMM");
      data["cYearShort"] = this.moment().format("YY");
      data["cDOW"] = this.moment().format("dddd");
      data["cMDthYShort"] = this.moment().format("MMM Do YY");
      data["cMDthY"] = this.moment().format("MMMM Do YYYY");
      data["cHMSampm"] = this.moment().format("h:mm:ss a");
      data["cHMampm"] = this.moment().format("h:mm a");
      data["cHMS24"] = this.moment().format("H:mm:ss");
      data["cHM24"] = this.moment().format("H:mm");
      data["Templatename"] = templateName;
      data["text"] = text;

      //
      // Get the User's default data.
      //
      var defaultData = this.getTemplateByName('Defaults');
      if(defaultData !== undefined) {
        data = this.MergeRecursive(data, JSON.parse(defaultData.template));
      }
      //
      // Parse the Template
      //
      var tpTemplate = Handlebars.compile(template);

      //
      // Run the template with the data.
      //
      result = tpTemplate(data);
      
      //
      // Make sure we have a string and not an array or object.
      //
      if(typeof result != 'String') {
        result = result.toString();
      }

    } catch (error) {
        this.logger("Handlebars Error: " + error);
        result = "There was an error.";
    }
    return(result);
  },
  //
  //  Function:        MergeRecursive
  //
  //  Description:     Recursively merge properties of two objects
  //
  //  Inputs:
  //                   obj1    The first object to merge
  //                   obj2    The second object to merge
  //
  MergeRecursive: function(obj1, obj2) {
    for (var p in obj2) {
      try {
        // Property in destination object set; update its value.
        if (obj2[p].constructor == Object) {
          obj1[p] = MergeRecursive(obj1[p], obj2[p]);
        } else {
          obj1[p] = obj2[p];
        }
      } catch (e) {
        // Property in destination object not set; create it and set its value.
        obj1[p] = obj2[p];
      }
    }
    return obj1;
  },

  //
  //  Function:        MergeRenameRecursive
  //
  //  Description:     Recursively merge properties of two objects
  //
  //  Inputs:
  //                   obj1    The first object to merge
  //                   obj2    The second object to merge
  //                   tadd    A string to add to the title.
  //
  MergeRenameRecursive: function(obj1, obj2, tadd) {
    for (var p in obj2) {
      try {
        // Property in destination object set; update its value.
        if (obj2[p].constructor == Object) {
          obj1[p + tadd] = MergeRecursive(obj1[p], obj2[p]);
        } else {
          obj1[p + tadd] = obj2[p];
        }
      } catch (e) {
        // Property in destination object not set; create it and set its value.
        obj1[p + tadd] = obj2[p];
      }
    }
    return obj1;
  },
  //
  // The following functions are for getting information from the Alfred
  // workflow CopyClips. 
  //
  //
  getAlfredDir: function() {
    var result = '';
    const firstPick = os.homedir() + "/Library/Application Support/Alfred/Workflow Data";
    const secondPick = os.homedir() + "/Library/Application Support/Alfred 2/Workflow Data";
    const thirdPick = os.homedir() + "/Library/Application Support/Alfred 3/Workflow Data";
    if(fs.existsSync(firstPick)) {
      result = firstPick;
    } else if(fs.existsSync(secondPick)) {
      result = secondPick;
    } else if(fs.existsSync(thirdPick)) {
      result = thirdPick;
    }
    return(result);
  },
  copyClipFileBeg: "/com.customct.CopyClips/copyclips/copy-",
  getCopyClip: function(clipNum) {
    if(this.getAlfredDir !== '') {
      return fs.readFileSync(this.getAlfredDir() + this.copyClipFileBeg + clipNum + ".txt")
    } else {
      return 'Alfred CopyClip workflow not installed.'
    }
  },
  saveCopyClip: function(clipNum, clipText) {
    //
    // Save the clip to the clip number.
    //
    if(this.getAlfredDir !== '') {
      fs.writeFileSync(this.getAlfredDir() + this.copyClipFileBeg + clipNum + ".txt", clipText, 'utf8');
    }
  },
  getAnswer: function( Question, Default ) {
    return this.queryUserDialog('question', Question, Default);
  },
  queryUserDialog: function( dialog, ...options ) {
    var ans = '';
    var everything = '"' + dialog + '" "' + options.join('" "') + '"';
    ans = childProcess.execSync('bin/queryUser ' + everything);
    return(ans);
  },
  getIP: function() {
    return ip.address();
  },
  //
  // Some Node-Red specific items.
  //
  startRed: function(callback) {
    if((typeof this.RED !== 'undefined') && (this.RED !== null) && (!this.REDSTARTED)) {
      this.RED.start().then(() => {
        this.REDSTARTED = true;
        callback();
      });
    }
  },
  stopRed: function(callback) {
    if(this.REDSTARTED) {
      this.REDSTARTED = false;
      this.RED.stop();
      callback();
    }
  },
  copyRecursiveSync: function(src, dest) {
    var that = this;
    fsex.copySync(src, dest);
    fs.readdirSync(src)
      .map((name) => name)
      .filter((dir) => fs.lstatSync(path.join(src, dir)).isDirectory())
      .forEach((dir) => {
        that.copyRecursiveSync(path.join(src, dir), path.join(dest, dir));
      });
  },
  initNodeRed: function(logger) {
    //
    // Get the location of the Red preferences.
    //
    this.logger = logger;
    this.NodeRedHome = this.CONFIGDIR + "/nodered-scriptpad/";

    //
    // Check for directory structure present and properly initialized.
    //
    if(!fs.existsSync(this.NodeRedHome)) {
      //
      // Create the Node-Red home.
      //
      fs.mkdirSync(this.NodeRedHome);
    }
    if(!fs.existsSync(this.NodeRedHome + "node_modules/")) {
      //
      // Create and populate the node modules directories and files.
      //
      fs.mkdirSync(this.NodeRedHome + "node_modules");

      //
      // Copy the modules for working with Node-Red and ScriptPad.
      //
      this.copyRecursiveSync(this.SERVERLOCATION + "/nodered_modules/",this.NodeRedHome + "node_modules");
    }

    //
    // Initialize the system.
    //
    this.RED = nodered;
    if((typeof this.RED !== 'undefined') && (this.RED !== null)) {
      // Create the settings object - see default settings.js file for other options
      var that = this;
      var settings = {
        httpAdminRoot: "/red/admin",
        httpNodeRoot: "/red/api",
        userDir: this.NodeRedHome,
        nodesDir: this.NodeRedHome + 'nodes/',
        credentialSecret: this.RedSecret,
        flowFile: "scriptpad-nodered.json",
        editorTheme: {
          projects: {
            enabled: false
          }
        }, 
        logging: {
          // Console logging
          console: {
            level: "off",
            metrics: false,
            audit: false
          },
          // Custom logger
          myCustomLogger: {
            level: "info",
            metrics: false,
            audit: false,
            handler: function(settings) {
              // Called when the logger is initialised
              // Return the logging function
              return function(msg) {
                that.logger(msg);
              };
            }
          }
        },
        functionGlobalContext: {
          ScriptPad: that
        }    // enables global context
      };

      // Initialise the runtime with a server and settings
      this.RED.init(this.httpServer,settings);

      // Serve the editor UI from /red
      this.app.use(settings.httpAdminRoot,this.RED.httpAdmin);

      // Serve the http nodes UI from /api
      this.app.use(settings.httpNodeRoot,this.RED.httpNode);
    }
  },
  //
  // Set a Node-Red Variable
  //
  SetRedVar: function(name,val) {
    this.REDVARS[name] = val;

    //
    // Send it to anyone needing the information on 
    // Websockets.
    //
    if(typeof this.io !== 'undefined') {
      if(typeof val !== 'undefined') {
        this.logger(`Set Red Var (name, value): ${name}, ${JSON.stringify(val, null, 2)}.`);
        this.io.emit('varchanged', {
          variable: name,
          value: val
        });
        this.io.emit(name, val);
      } else {
        this.logger(`Set Red Var (name, value): ${name}, undefined.`);
      }
    }
  },
  //
  // Get a Node-Red Variable
  //
  GetRedVar: function(name) {
    var result = null;
    if(typeof this.REDVARS[name] !== 'undefined') {
      this.logger(`Get Red Var (name, value): ${name}, ${JSON.stringify(this.REDVARS[name], null, 2)}.`);
      result = this.REDVARS[name];
    }
    return(result);
  },
  //
  // Get the array of Node-Red variables.
  //
  GetRedVarArray: function() {
    return(this.REDVARS);
  },
  //
  // This section is for working with the script environments
  //
  // scriptEnv {
  //    name    - Name of the environment
  //    envVar  - key,value array of environment variables
  //}
  //
  createDefaultEnv: function() {
    var newEnv = {
      name: 'Default',
      envVar: process.env
    }
    return(newEnv);
  },
  getEnvNames: function() {
    if(this.scriptEnv === null) {
      this.scriptEnv = this.loadEnv();
    }
    return(this.scriptEnv.map((item) => item.name));
  },
  addEnv: function(env) {
    if(this.scriptEnv === null) {
      this.scriptEnv = this.loadEnv();
    }
    var newScriptEnv = this.scriptEnv.find(item => item.name === env.name);
    if(typeof newScriptEnv === 'undefined') {
      this.scriptEnv.push(env);
    } else {
      this.scriptEnv = this.scriptEnv.map(item => {
        if(item.name === env.name) item = env;
        return(item);
      });
    }
    this.saveEnv();
  },
  removeEnv: function(oldEnv) {
    if(this.scriptEnv === null) {
      this.scriptEnv = this.loadEnv();
    }
    this.scriptEnv = this.scriptEnv.filter(env => env.name !== oldEnv);
    this.saveEnv();
  },
  loadEnv: function() {
    if (fs.existsSync(this.ENVIRONMENTVARIABLESFILELOC)) {
      //
      // There are preferences already. Load them.
      //
      this.scriptEnv = JSON.parse(fs.readFileSync(this.ENVIRONMENTVARIABLESFILELOC, 'utf8'));
    } else {
      //
      // Create the preferences file using the default preferences.
      //
      this.scriptEnv = [];
      this.saveEnv();
    }
    return(this.scriptEnv)
  },
  saveEnv: function() {
    if(this.scriptEnv === null) {
      this.scriptEnv = this.loadEnv();
    }
    fs.writeFileSync(this.ENVIRONMENTVARIABLESFILELOC, JSON.stringify(this.scriptEnv));
  },
  getEnv: function(name) {
    //
    // Make sure name is a string.
    //
    if(typeof name !== 'string') name = new String(name);

    //
    // See if it have a lowercase for default.
    //
    if(name.includes('default')) name = "Default";

    //
    // Make sure the environments are loaded.
    //
    if(this.scriptEnv === null) {
      this.scriptEnv = this.loadEnv();
    }

    //
    // If it doens't find the envionment, return an empty env.
    //
    var tmpEnv = this.scriptEnv.find((env) => env.name === name);
    if(typeof tmpEnv === 'undefined') tmpEnv = [];
    return(tmpEnv);
  },
  //
  // This section is for external script control.
  //
  // extScripts {
  //    name     - User given name for the script
  //    script   - File name of the script
  //    path     - directory of the script
  //    env      - name of the environment
  // }
  //
  listExtScripts: function() {
    if(this.extScripts === null) {
      this.extScripts = this.loadExtScripts();
    }
    return(this.extScripts.map((es) => es.name));
  },
  addExtScript: function(newScript) {
    if(this.extScripts === null) {
      this.extScripts = this.loadExtScripts();
    }
    var extScript = this.extScripts.find(item => item.name === newScript.name);
    if(typeof extScript === 'undefined') {
      this.extScripts.push(newScript);
    } else {
      this.extScripts = this.extScripts.map(item => {
        if(item.name === newScript.name) item = newScript;
        return(item);
      });
    }
    this.saveExtScripts();
  },
  getExtScript: function(scriptName) {
    if(this.extScripts === null) {
      this.extScripts = this.loadExtScripts();
    }
    return this.extScripts.find((es) => es.name === scriptName);
  },
  saveExtScripts: function() {
    if(this.extScripts === null) {
      this.extScripts = this.loadExtScripts();
    }
    fs.writeFileSync(this.EXTSCRIPTSFILELOC, JSON.stringify(this.extScripts));
  },
  loadExtScripts: function() {
    if (fs.existsSync(this.EXTSCRIPTSFILELOC)) {
      //
      // There are preferences already. Load them.
      //
      this.extScripts = JSON.parse(fs.readFileSync(this.EXTSCRIPTSFILELOC, 'utf8'));
    } else {
      //
      // Create the preferences file using the default preferences.
      //
      this.extScripts = [];
      this.saveExtScripts();
    }
    return(this.extScripts)
  },
  removeExtScript: function(info) {
    if(this.extScripts === null) {
      this.extScripts = this.loadExtScripts();
    }
    this.extScripts = this.extScripts.filter(item => { return item.name !== info; });
    this.saveExtScripts();
  },
  commandLine: function(command) {
    var result = '';
    var env = {};

    //
    // Get the environment.
    //
    env = this.getEnv('Default');
    if(env !== 'undefined') {
      env = env.envVar;
    } else {
      env = {};
    }
   
    //
    // Add any new environment variables.
    //
    try {
      this.logger('Run command...');
      this.logger(command + " &");
      childProcess.exec(command + " &", {
          env: env,
          cwd: this.HOME
        }, (err, stdin, stdout) => {
        result = stdin;
        if(err) {
          this.logger(err.toString());
        }
      });
    } catch(e) {
      result = "Error: " + e.message;
      this.logger(e.message);
    }
    return(result);
  },
  runExtScript: function(extScript, info) {
    //
    // info.script    - Name of the script - a string
    // info.env       - Environment name to run the script - 'default' : Environment defined by the script.
    // info.envVar    - Additional environment variables - key, value pairs
    // info.commandLine - Command line for the script - a string
    //
    // extScript.name     - File name of the script
    // extScript.script   - User name for the script
    // extScript.path     - directory of the script
    // extScript.env      - name of the environment
    //
    var result = '';
    var env = {};

    if(this.extScripts === null) {
      this.extScripts = this.loadExtScripts();
    }

    //
    // Get the environment.
    //
    if(info.env !== '') {
      env = this.getEnv(info.env);
      if(env !== 'undefined') {
        env = env.envVar;
      } else {
        env = {};
      }
    } else if(extScript.env !== '') {
      env = this.getEnv(extScript.env);
      if(env !== 'undefined') {
        env = env.envVar;
      } else {
        env = {};
      }
    }
   
    //
    // Add any new environment variables.
    //
    env = {...env, ...info.envVar};
    try {
      if((info.commandLine !== null)&&(typeof info.commandLine !== 'undefined')) {
        result = childProcess.execFileSync(extScript.script, info.commandLine.split(' '), {
          env: env,
          cwd: extScript.path,
          shell: '/bin/sh',
          encoding: 'utf8'
        });
      } else {
        result = childProcess.execFileSync(extScript.script, [], {
          env: env,
          cwd: extScript.path,
          shell: '/bin/sh',
          encoding: 'utf8'
        });
      }
      if(typeof result === 'object') result = result.toString();
    } catch(e) {
      result = "Error: " + e.message;
    }
    return(result);
  },
  //
  // These functions are for handling accounts for the EmailIt
  // program.
  //
  saveAccounts: function(acc) {
    acc = fs.writeFileSync(this.EMAILACCOUNTSFILELOC, JSON.stringify(acc));
  },
  getAccounts: function() {
    var acc = [];
    if(fs.existsSync(this.EMAILACCOUNTSFILELOC)) {
      acc = JSON.parse(fs.readFileSync(this.EMAILACCOUNTSFILELOC));
    }
    return acc;
  },
  saveAccount: function(acc) {
    var accounts = this.getAccounts();
    var orig = accounts.filter(item => (item.name === acc.name));
    if(orig.length > 0) {
      this.deleteAccount(acc);
      accounts = this.getAccounts();
    }
    accounts.push(acc);
    this.saveAccounts(accounts);
  },
  deleteAccount: function(acc) {
    var accounts = this.getAccounts();
    accounts = accounts.filter(item => item.name !== acc.name);
    this.saveAccounts(accounts);
  },
  saveNewEmail: function(name, email) {
    var emails;
    if(fs.existsSync(this.EMAILADDRESSFILELOC)) {
      emails = JSON.parse(fs.readFileSync(this.EMAILADDRESSFILELOC));
      emails = emails.filter(item => item.email !== email);
    } else {
      emails = [];
    }
    emails.push({
      name: name,
      email: email
    });
    fs.writeFileSync(this.EMAILADDRESSFILELOC, JSON.stringify(emails));
  },
  getEmails: function() {
    var emails;
    if(fs.existsSync(this.EMAILADDRESSFILELOC)) {
      emails = JSON.parse(fs.readFileSync(this.EMAILADDRESSFILELOC));
    } else {
      emails = [];
    }
    return(emails);
  }
}
