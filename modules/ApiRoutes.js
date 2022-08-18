var fs = require('fs');
var process = require('process');
const nodemailer = require("nodemailer");

const EMAILITPROG = '/Applications/EmailIt.app/Contents/MacOS/EmailIt';

module.exports = (router, express, ScriptPad) => {
  //
  // Here, we need to setup the middleware for the router. The first
  // two are for parsing the body of a request. The third & fourth one is a 
  // security checker. We are going to allow non-API calls only from our
  // system, while API calls are limited to our sub-domain.
  //
  router.use('*', (req, res, next) => {
    //
    // We need to do some security checking on all the API calls.
    //
    var okay = true
    if (typeof req.ip !== 'undefined') {
      var requesterIP = req.ip.split('.')
      var localIP = req.connection.localAddress.split('.')
      if ((requesterIP[0] === localIP[0]) && (requesterIP[1] === localIP[1]) && (requesterIP[2] === localIP[2])) {
        //
        // Okay, the request is within our sub-domain. You can allow it.
        //
        okay = true
      } else {
        okay = false
      }
    }
    //
    // If okay is true, proceed. Otherwise, just drop out.
    //
    if (okay) {
      next()
    }
  })
  router.use(express.json({
    limit: '1mb'
  })) // for parsing application/json
  router.use(express.urlencoded({
    extended: true,
    limit: '1mb'
  })) // for parsing application/x-www-form-urlencoded

  //
  // This is an external application request for changing a note. The note
  // can be either replaced or appended to depending on the last flag (a|w).
  //
  router.route('/note/:noteID(\\d+)/:append(a|w)').get((req, res, next) => {
    res.json({
      note: ScriptPad.getNote(req.params.noteID)
    })
  }).put((req, res, next) => {
    var note = ''
    if (req.params.append === 'a') {
      note = ScriptPad.getNote(req.params.noteID)
    }
    note += req.body.note
    ScriptPad.saveNote(req.params.noteID, note)

    //
    // Tell the person that sent it that we got it okay.
    //
    res.send({ text: 'okay' })
  })

  //
  // A request for environments.
  //
  router.route('/scripts/env/list').get((req, res, next) => {
    res.json(ScriptPad.getEnvNames());
  })

  router.route('/scripts/env/Default').put((req, res, next) => {
    var defEnv = {};
    if (typeof req.body.envVar === 'undefined') {
      defEnv = ScriptPad.createDefaultEnv();
    } else {
      defEnv = req.body;
    }
    ScriptPad.addEnv(defEnv);
    res.json({
      text: 'okay'
    });
  });

  router.route('/scripts/env/:env', {
    headers: {
      "Content-type": "application/json",
    }
  }).get((req, res, next) => {
    res.json(ScriptPad.getEnv(req.params.env));
  }).put((req, res, next) => {
    ScriptPad.addEnv(req.body);
    res.json({
      text: 'okay'
    });
  }).delete((req, res, next) => {
    ScriptPad.removeEnv(req.params.env);
    res.json({
      text: 'okay'
    });
  });

  //
  // Outside application requesting names of scripts to use.
  //
  router.route('/scripts/user').get((req, res, next) => {
    res.json({
      scripts: ScriptPad.getScripts().map(item => item.name)
    });
  });

  router.route('/scripts/list').get((req, res, next) => {
    res.json({
      data: ScriptPad.getScripts().filter(value => value.termscript === false).map(value => {
        return { name: value.name, insert: value.insert }
      }).concat(ScriptPad.getSystemScripts().filter(value => value.termscript === false).map(value => {
        return { name: value.name, insert: value.insert }
      })).concat(ScriptPad.listExtScripts().filter(value => value.termscript === false).map(value => {
        return { name: value.name, insert: false }
      }))
    });
  })

  router.route('/scripts/term/list').get((req, res, next) => {
    res.json({
      data: ScriptPad.getScripts().filter(value => value.termscript === true).map(value => {
        return { name: value.name, description: value.description, help: value.help }
      }).concat(ScriptPad.getSystemScripts().filter(value => value.termscript === true).map(value => {
        return { name: value.name, description: value.description, help: value.help }
      })).concat(ScriptPad.listExtScripts().filter(value => value.termscript === true).map(value => {
        return { name: value.name, description: value.description, help: value.help }
      }))
    });
  })

  router.route('/scripts/ext/list').get((req, res, next) => {
    var list = ScriptPad.listExtScripts();
    res.json(list);
  })

  router.route('/scripts/ext/:script').get((req, res, next) => {
    var script = ScriptPad.getExtScript(req.params.script);
    res.json(script);
  }).put((req, res, next) => {
    ScriptPad.addExtScript(req.body);
    res.json({
      text: "okay"
    })
  }).delete((req, res, next) => {
    ScriptPad.removeExtScript(req.params.script);
    res.json({
      text: "okay"
    })
  });

  router.route('/scripts/:name').get((req, res, next) => {
    res.json({
      script: ScriptPad.getScripts().find(item => item.name === req.params.name)
    });
  }).put((req, res, next) => {
    ScriptPad.saveScript(req.body.script);
    res.json({
      text: 'okay'
    });
  }).delete((req, res, next) => {
    ScriptPad.deleteScript(req.params.name);
    res.json({
      text: 'okay'
    });
  });

  //
  // Outside application asking to process text with a script.
  //
  router.route('/script/run').put((req, res, next) => {
    var scriptArray = ScriptPad.getScripts();
    var script = null;
    var scriptIndex = scriptArray.find((ele) => { return ele.name === req.body.script })
    if (typeof scriptIndex !== 'undefined') {
      script = scriptIndex.script;
      if (typeof req.body.file !== 'undefined' && req.body.file.length > 0) {
        res.json({
          text: ScriptPad.runJavaScriptScriptsFile(script, req.body.file)
        });
      } else {
        res.json({
          text: ScriptPad.runJavaScriptScripts(script, req.body.text)
        });
      }
    } else {
      scriptIndex = ScriptPad.getExtScript(req.body.script);
      if (typeof scriptIndex !== 'undefined') {
        //
        // It's an external script.
        //
        res.json({
          text: ScriptPad.runExtScript(scriptIndex, req.body.text, req.body)
        })
      } else {
        //
        // Find it in the built in scripts.
        //
        scriptArray = ScriptPad.getSystemScripts();
        scriptIndex = scriptArray.find((ele) => { return ele.name === req.body.script })
        if (typeof scriptIndex !== 'undefined') {
          script = scriptIndex.script;
        } else {
          script = { script: "SP.text = 'Error: Not a Script.';" }
        }
        if (typeof req.body.file !== 'undefined' && req.body.file.length > 0) {
          res.json({
            text: ScriptPad.runJavaScriptScriptsFile(script, req.body.file)
          });
        } else {
          res.json({
            text: ScriptPad.runJavaScriptScripts(script, req.body.text)
          });
        }
      }
    }
  })

  //
  // These routes are for the template expansion.
  //
  router.route('/template/list').get((req, res, next) => {
    res.json({
      templates: ScriptPad.listTemplates().filter(item => {
        var result = true;
        if (item === 'Defaults') {
          result = false;
        }
        return result;
      })
    });
  });

  router.route('/template/user').get((req, res, next) => {
    res.json({
      templates: ScriptPad.listUserTemplates().filter(item => {
        var result = true;
        return result;
      })
    });
  });

  router.route('/template/run').put((req, res, next) => {
    var template = ScriptPad.getTemplateByName(req.body.template);
    if (template === null) {
      res.json({
        text: 'Not Defined.'
      })
    } else {
      res.json({
        text: ScriptPad.runTemplate(template.name, template.template, req.body.text)
      });
    }
  });

  router.route('/template/:template').get((req, res, next) => {
    var template = ScriptPad.getTemplateByName(req.params.template);
    if (template === null) {
      res.json({
        text: 'Not Defined.'
      })
    } else {
      res.json({
        text: template
      });
    }
  }).put((req, res, next) => {
    ScriptPad.addTemplate(req.body.template);
    res.json({
      text: "okay"
    });
  }).delete((req, res, next) => {
    ScriptPad.deleteTemplate(req.params.template);
    res.json({
      text: "okay"
    });
  });

  router.route('/nodered/var/:varname').put((req, res, next) => {
    ScriptPad.SetRedVar(req.params.varname, req.body.text);
    res.json({
      text: 'okay'
    });
  }).get((req, res, next) => {
    res.json({
      text: ScriptPad.GetRedVar(req.params.varname)
    });
  });

  router.route('/getip').get((req, res, next) => {
    //
    // Return the local IP address.
    //
    res.json({
      ip: ScriptPad.getIP()
    });
  });

  router.route('/scriptbar/config').get((req, res, next) => {
    if (fs.existsSync(ScriptPad.SCRIPTBARPREFERENCES)) {
      res.json({
        config: JSON.parse(fs.readFileSync(ScriptPad.SCRIPTBARPREFERENCES))
      });
    } else {
      res.json({
        config: []
      })
    }
  }).put((req, res, next) => {
    fs.writeFileSync(ScriptPad.SCRIPTBARPREFERENCES, JSON.stringify(req.body.config));
    res.json({
      text: 'okay'
    })
  });

  //
  // These routes are for the emailit program.
  //
  router.route('/emailit/addEmail').put((req, res, next) => {
    ScriptPad.saveNewEmail(req.body.name, req.body.email);
    res.send({ text: 'okay' });
  }).delete((req, res, error) => {
    ScriptPad.deleteNewEmail(req.body.email);
    res.send({ text: 'okay' });
  });
  router.route('/emailit/emails').get((req, res, next) => {
    res.send({
      emails: ScriptPad.getEmails()
    });
  });
  router.route('/emailit/send').put(async (req, res, next) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: req.body.acc.smtpserver,
      port: req.body.acc.port,
      secure: false, // true for 465, false for other ports
      auth: {
        user: req.body.acc.username, // generated ethereal user
        pass: req.body.acc.password, // generated ethereal password
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: req.body.from,
      to: req.body.to,
      subject: req.body.subject,
      text: req.body.text,
      html: req.body.html
    });

    ScriptPad.logger(`Message sent: ${info.messageId}`);
    res.send({ text: 'okay' });
  });

  router.route('/emailit/send/:to/:subject?/:body?').get((req, res, next) => {
    ScriptPad.commandLine("'" + EMAILITPROG + "' -m " + req.params.to);
    res.send({ text: 'okay' });
  });

  router.route('/emailit/accounts').get((req, res, next) => {
    var acc = ScriptPad.getAccounts();
    res.json(acc);
  }).put((req, res, next) => {
    var acc = req.body;
    ScriptPad.saveAccount(acc);
  }).delete((req, res, next) => {
    var acc = req.body;
    ScriptPad.deleteAccount(acc);
  })

  //
  // Route to close the server.
  //
  router.route('/quit').delete((req, res, next) => {
    ScriptPad.logger('Shutting down...');
    ScriptPad.SERVERON = false;
    res.send({ text: 'okay' });
    ScriptPad.server.close(() => {
      ScriptPad.logger('Server shutdown.');
    });
    process.exit();
  });

  //
  // Route for getting the server messages.
  //
  router.route('/messages').get((req, res, next) => {
    res.json({
      data: ScriptPad.messages
    });
  });

  //
  // Routes for Themes.
  //
  router.route('/theme').get((req, res, next) => {
    res.send({
      theme: ScriptPad.getCurrentTheme()
    })
  });

  router.route('/theme/list').get((req, res, next) => {
    //
    // This route will get a list of themes.
    //
    res.send({
      themes: ScriptPad.getThemes()
    });
  });

  router.route('/theme/:name').get((req, res, next) => {
    //
    // This is used to retrieve a particular theme.
    //
    res.send({
      theme: ScriptPad.getTheme(req.params.name)
    })
  }).put((req, res, next) => {
    //
    // This route will save/create a theme.
    //
    req.body.name = req.params.name;
    ScriptPad.saveTheme(req.params.name, req.body);
    res.send('okay');
  }).delete((req, res, next) => {
    //
    // This route is for deleting a theme.
    //
    ScriptPad.deleteTheme(req.params.name);
    res.send('okay');
  });
}
