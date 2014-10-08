#!/usr/bin/env node

var program = require('commander');
var meta = require('../package');
var Chrome = require('../').Chrome;

program
  .version(meta.version)
  .option('-u, --user-dir [dir]');

program
  .command('list')
  //.option('-q, --quiet')
  .action(function(options){
    Chrome.getApps(function(err, apps){
      if (err) throw err;
      apps.forEach(function(app){
        var manifest = app.manifest;
        var name = manifest.name;
        console.log(name, app.id);
      });
    });
  });

program
  .command('launch <id>')
  //.alias('l')
  .description('Launch chrome apps.')
  .action(function(id, options){

    if (!id) return;
    
    Chrome.getApps(function(err, apps){
      if (err) throw err;
      
      apps.filter(function(app){
        return app.id.lastIndexOf(id, 0) === 0;
      }).forEach(function(app){
        console.log(app.manifest.name);
        app.launch();
      });

    });

  });

program.parse(process.argv);


