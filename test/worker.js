'use strict';

var assert = require('assert');
var EventEmitter = require('events').EventEmitter;

var Worker = require('../Worker');
var Job = require('../Job');

describe('worker', function() {
  it('canDo', function() {
    var isCalledSync = false;

    var server = new EventEmitter();
    server.canDo = function(fnName) {
      assert.equal('pippo', fnName);
      isCalledSync = true;
    };

    var w = new Worker(server);

    var cbk = function() { };

    w.canDo('pippo', cbk);

    assert.ok(isCalledSync);
    assert.deepEqual(cbk, w.functions.pippo);
  });

  it('grab', function() {
    var isCalledSync = false;

    var server = new EventEmitter();
    server.grab = function() {
      isCalledSync = true;
    };

    var w = new Worker(server);
    w.grab();

    assert.ok(isCalledSync);
  });

  it('setClientId', function() {
    var isCalledSync = false;

    var server = new EventEmitter();
    server.setClientId = function() {
      isCalledSync = true;
    };

    var w = new Worker(server);
    w.setClientId('pippo');

    assert.ok(isCalledSync);
  });

  it('handleJobAssign', function() {
    var isCalledSync = false;
    // no action on server. skip mocking
    var w = new Worker(new EventEmitter());

    w.functions.queueName = function queueCallback(job) {
      assert.ok(job instanceof Job);
      assert.equal('handle', job.jobHandle);
      assert.equal('queueName', job.queue);
      assert.deepEqual(new Buffer('the content!'), job.workload);

      isCalledSync = true;
    };

    w.handleJobAssign(Buffer.concat([
      new Buffer('handle'),
      new Buffer([0x00]),
      new Buffer('queueName'),
      new Buffer([0x00]),
      new Buffer('the content!'),
    ]));

    assert.ok(isCalledSync);
  });

  it('handleNoJob', function() {
    var isCalledSync = false;

    var server = new EventEmitter();
    server.preSleep = function(){
      isCalledSync = true;
    };

    var w = new Worker(server);
    w.handleNoJob();

    assert.ok(isCalledSync);
  });

  it('handleNoOp', function() {
    var isCalledSync = false;

    var server = new EventEmitter();
    server.grab = function(){
      isCalledSync = true;
    };

    var w = new Worker(server);
    w.handleNoOp();

    assert.ok(isCalledSync);
  });

  it('preSleep', function() {
    var isCalledSync = false;

    var server = new EventEmitter();
    server.preSleep = function(){
      isCalledSync = true;
    };

    var w = new Worker(server);
    w.preSleep();

    assert.ok(isCalledSync);
  });

  it('emit error', function() {
    var w = new Worker(new EventEmitter());

    var errors = [];
    w.on('error', function(e) {
      errors.push(e);
    })

    w.canDo('Pippo', function() { });
    w.grab();
    w.setClientId('clientId');

    assert.equal(3, errors.length);
  });
});