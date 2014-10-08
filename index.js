
var fs   = require('fs');
var os   = require('os');
var cp   = require('child_process');
var path = require('path');
var glob = require('glob');
var async = require('async');
var basename = path.basename;
var dirname  = path.dirname;

exports = module.exports = function() {};

var Chrome = exports.Chrome = (function() {

  function Chrome() {
    this.init({});
  }

  Chrome.prototype.init = function(options) {
    (function(){
      switch(process.platform){
      case 'darwin':
        var chromePath = path.join(
          process.env.HOME, '/Library/Application\ Support/Google/Chrome/'
        );
        this.userDir = path.join(chromePath, 'Default/');
        this.bin = '/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome';
      case 'win32':
        "Todo: Win32 Path"
      default:
        "ToDo: Linux"
      }
    }).call(this);
  }

  Chrome.prototype.getExtensions = function(callback) {
    var self = this;
    callback = callback || function(){};
    var extPath = null;
    fs.readdir(extPath = path.join(this.userDir, 'Extensions'), function(err, files){
      if(err) return callback.call(self, err);

      async.map(files.map(function(dir){
        return path.join(extPath, dir);
      }), findManifest, function(err, results){
        if (err) return callback.call(self, err);
        callback.call(self, null, results.map(function(dir){
          return new ChromeApps({manifest_path: dir[dir.length - 1]});
        }));
      });
    });
  };

  Chrome.prototype.getApps = function(callback) {
   var self = this;
    callback = callback || function(){};

    this.getExtensions(function(err, apps){
      callback.call(self, err, apps.filter(function(ext){
        return ext.isApps();
      }));      
    });
  };
  
  return new Chrome;

})();

function ChromeApps(options) {

  if (!(this instanceof ChromeApps)) {
    return new ChromeApps(options);
  }

  options = options || {};

  this.manifestPath = options.manifest_path || null;
  if (this.manifestPath){
    this.manifest = require(this.manifestPath);
    this.path = dirname(this.manifestPath);
    this.id   = this.path.match(/Extensions\/([a-z]+)\//)[1] || null;
  }
  //this.id = options.id;
  //this.manifest
}

ChromeApps.prototype.isApps = function() {
  if(!(this.manifest)) return false;
  return !!(this.manifest.app);
};

ChromeApps.prototype.launch = function(options) {
  if (!this.isApps()) return;

  options = options || {};

  launchApps(this);  
};

exports.ChromeApps = ChromeApps;

function findManifest(dir, callback) {
  glob(path.join(dir, "**/manifest.json"), callback);
}

function launchApps(options) {

  options = options || {};

  var id = options.id;
  var userDir = os.tmpdir();
  var appPath = options.path.replace(/\s+/, '\\ ');

  var args = [
    '--enable-experimental-web-platform-features',
    '--enable-html-imports',
    '--no-default-browser-check',
    '--no-first-run'
  ];

  if (id) {
    args.push('--app-id=' + id);
  } else {
    if (userDir)
      args.push('--user-data-dir=' + userDir);
    if(appPath)
      args.push('--load-and-launch-app=' + appPath);
  }

  if (process.platform === 'darwin') {
    args.push('--no-startup-window');
  }

  var command = Chrome.bin + ' ' + args.join(' ');

  var env = {
    cwd: process.cwd()
  };

  // debug log
  console.log(command);

  return cp.exec(command, env, function(){});

}
