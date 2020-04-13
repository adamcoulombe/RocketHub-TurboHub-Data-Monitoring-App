var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'get-data-usage',
  description: 'get the current data usage',
  script: 'D:\\git\\get-data-usage\\app.js',
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.uninstall();