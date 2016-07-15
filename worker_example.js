'use strict';


var Server = require('./Server');
var Worker = require('./Worker');

var server = new Server('192.168.99.100', 32769);
var worker = new Worker(server);

server.on('connect', function() {

  worker.canDo('reverse', function(job) {
    console.log('handle reverse', job.jobHandle, job.workload);
    
    setTimeout(function() {
      
      job.success('pippo');

      worker.grab();
    }, 400);
  });

  worker.grab();
});
server.connect();
