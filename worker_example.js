'use strict';


var Server = require('./Server');
var Worker = require('./Worker');

var server = new Server('127.0.0.1', 4730);
var worker = new Worker(server);

server.on('connect', function() {

  worker.canDo('reverse', function(job) {
    console.log('handle reverse');
    //job.status(0, 2);

    setTimeout(function() {
      console.log('send data');
      job.warning('pippo');
    }, 200);

    setTimeout(function() {
      job.status(2, 2);
      job.exception('pippo');
    }, 400);
  });

  worker.preSleep();

  worker.on('option-response', function() {
    console.log(arguments);
  });
  worker.optionsRequest(Worker.OPTION_REQUEST.EXCEPTION);



  /*
  worker.once('echo', function(content) {
    console.log('QQQ', content.toString());
  });
  worker.echo('pippo');
  */

  //worker.setClientId(22);
});
server.connect();
