'use strict';

var assert = require('assert');

var Worker = require('../Worker');
var Job = require('../Job');

describe('worker', function() {
  it('canDo', function() {
    var isCalledSync = false;

    var w = new Worker({
      canDo: function(fnName) {
        assert.equal('pippo', fnName);
        isCalledSync = true;
      },
    });

    var cbk = function() { };

    w.canDo('pippo', cbk);

    assert.ok(isCalledSync);
    assert.deepEqual(cbk, w.functions.pippo);
  });

  it('grab', function() {
    var isCalledSync = false;

    var w = new Worker({
      grab: function() {
        isCalledSync = true;
      },
    });

    w.grab();

    assert.ok(isCalledSync);
  });

  it('setClientId', function() {
    var isCalledSync = false;

    var w = new Worker({
      setClientId: function() {
        isCalledSync = true;
      },
    });

    w.setClientId('pippo');

    assert.ok(isCalledSync);
  });

  it('handleJobAssign', function() {
    var isCalledSync = false;
    // no action on server. skip mocking
    var w = new Worker({});

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
    var w = new Worker({
      preSleep: function() {
        isCalledSync = true;
      },
    });

    w.handleNoJob();

    assert.ok(isCalledSync);
  });

  it('handleNoOp', function() {
    var isCalledSync = false;
    var w = new Worker({
      grab: function() {
        isCalledSync = true;
      },
    });

    w.handleNoOp();

    assert.ok(isCalledSync);
  });

  it('preSleep', function() {
    var isCalledSync = false;
    var w = new Worker({
      preSleep: function() {
        isCalledSync = true;
      },
    });

    w.preSleep();

    assert.ok(isCalledSync);
  });
});