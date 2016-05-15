'use stict';

var Server = require('./Server');
var Client = require('./Client');
var Job = require('./Job');

var server = new Server('127.0.0.1', 4730);
var client = new Client(server);

function submitJob(i) {
  var job = Job.create('reverse', 'data' + i);

  job.on('submitted', function() {
    console.log('submitted', job.jobHandle);
  });
  job.on('status', function(status) {
    console.log('status', job.jobHandle, status);
  });
  job.on('fail', function() {
    console.log('fail', job.jobHandle);
  });
  job.on('exception', function(response) {
    console.log('exception', job.jobHandle, response);
  });
  job.on('data', function(response) {
    console.log('data', job.jobHandle, response);
  });
  job.on('warning', function(response) {
    console.log('warning', job.jobHandle, response);
  });
  job.on('complete', function(response) {
    console.log('complete', job.jobHandle, response.toString('ascii'));
  });

  client.submitJob(job);
}

server.on('socket-error', function(error) {
  console.log('socket-error', error);
});
server.on('socket-close', function(hadError) {
  console.log('socket-close', hadError);
});
server.on('connect', function() {

  client.on('option-response', function() {
    console.log(arguments);
  });
  client.optionsRequest(Client.OPTION_REQUEST.EXCEPTION);

  for (var i = 0; i < 1; i++) {
    submitJob(i);
  }

  client.once('echo', function(content) {
    console.log('QQQ', content.toString());
  });
  client.echo('pippo');
});

server.connect();