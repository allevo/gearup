'use strict';

var GearmanServer = require('./Server');
var Task = require('./Task');
var Worker = require('./Worker');

var log = require('./utils').log;

var Pool = require('./Pool');

var s = new GearmanServer('127.0.0.1', 4730);
var pool = new Pool();
pool.addServer(s);

var i = 0;
pool.on('connect', function() {
  log('connected');

  var worker = new Worker();
  worker.registerFunction('reverse', function(job) {
    i ++;

    if (i % 1000 === 0) console.log('---', i);

    job.success(job.jobHandle);
  });
  pool.canDo(worker);

  pool.preSleep();
});

pool.connect();

