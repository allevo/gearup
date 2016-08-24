'use strict';

var assert = require('assert');
var EventEmitter = require('events').EventEmitter;

var Job = require('../Job');

describe('job', function() {
  it('success', function() {
    var isCalledSync = false;

    var job = Job.create('queueName', 'data');
    job.jobHandle = 'handle';
    job.server = new EventEmitter();

    job.server.workComplete = function(jobHandle, response) {
      assert.deepEqual(new Buffer([0x68, 0x61, 0x6e, 0x64, 0x6c, 0x65]), jobHandle);
      assert.deepEqual('handle', jobHandle.toString('ascii'));

      assert.deepEqual(new Buffer([0x64, 0x61, 0x74, 0x61]), response);
      assert.deepEqual('data', response.toString('ascii'));

      isCalledSync = true;
    };

    job.success('data');

    assert.ok(isCalledSync);
  });

  it('fail', function() {
    var isCalledSync = false;

    var job = Job.create('queueName', 'data');
    job.jobHandle = 'handle';
    job.server = new EventEmitter();

    job.server.workFail = function(jobHandle) {
      assert.deepEqual(new Buffer([0x68, 0x61, 0x6e, 0x64, 0x6c, 0x65]), jobHandle);
      assert.deepEqual('handle', jobHandle.toString('ascii'));

      isCalledSync = true;
    };

    job.fail();

    assert.ok(isCalledSync);
  });

  it('exception', function() {
    var isCalledSync = false;

    var job = Job.create('queueName', 'data');
    job.jobHandle = 'handle';
    job.server = new EventEmitter();

    job.server.workException = function(jobHandle, response) {
      assert.deepEqual(new Buffer([0x68, 0x61, 0x6e, 0x64, 0x6c, 0x65]), jobHandle);
      assert.deepEqual('handle', jobHandle.toString('ascii'));

      assert.deepEqual(new Buffer([0x65, 0x78, 0x63, 0x65, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x20, 0x6d, 0x65, 0x73, 0x73, 0x61, 0x67, 0x65]), response);
      assert.deepEqual('exception message', response.toString('ascii'));

      isCalledSync = true;
    };

    job.exception('exception message');

    assert.ok(isCalledSync);
  });

  it('data', function() {
    var isCalledSync = false;

    var job = Job.create('queueName', 'data');
    job.jobHandle = 'handle';
    job.server = new EventEmitter();

    job.server.workData = function(jobHandle, response) {
      assert.deepEqual(new Buffer([0x68, 0x61, 0x6e, 0x64, 0x6c, 0x65]), jobHandle);
      assert.deepEqual('handle', jobHandle.toString('ascii'));

      assert.deepEqual(new Buffer([0x64, 0x61, 0x74, 0x61, 0x20, 0x6d, 0x65, 0x73, 0x73, 0x61, 0x67, 0x65]), response);
      assert.deepEqual('data message', response.toString('ascii'));

      isCalledSync = true;
    };

    job.data('data message');

    assert.ok(isCalledSync);
  });

  it('warning', function() {
    var isCalledSync = false;

    var job = Job.create('queueName', 'data');
    job.jobHandle = 'handle';
    job.server = new EventEmitter();

    job.server.workWarning = function(jobHandle, response) {
      assert.deepEqual(new Buffer([0x68, 0x61, 0x6e, 0x64, 0x6c, 0x65]), jobHandle);
      assert.deepEqual('handle', jobHandle.toString('ascii'));

      assert.deepEqual(new Buffer([0x77, 0x61, 0x72, 0x6e, 0x69, 0x6e, 0x67, 0x20, 0x6d, 0x65, 0x73, 0x73, 0x61, 0x67, 0x65]), response);
      assert.deepEqual('warning message', response.toString('ascii'));

      isCalledSync = true;
    };

    job.warning('warning message');

    assert.ok(isCalledSync);
  });

  it('status', function() {
    var isCalledSync = false;

    var job = Job.create('queueName', 'data');
    job.jobHandle = 'handle';
    job.server = new EventEmitter();

    job.server.workStatus = function(jobHandle, numeratorBuff, denominatorBuff) {
      assert.deepEqual(new Buffer([0x68, 0x61, 0x6e, 0x64, 0x6c, 0x65]), jobHandle);
      assert.deepEqual('handle', jobHandle.toString('ascii'));

      assert.deepEqual(new Buffer([0x0c]), numeratorBuff);
      assert.deepEqual(12, numeratorBuff[0]);
      assert.deepEqual(new Buffer([0x0f]), denominatorBuff);
      assert.deepEqual(15, denominatorBuff[0]);

      isCalledSync = true;
    };

    job.status(12, 15);

    assert.ok(isCalledSync);
  });

  it('emit error', function() {
    var job = Job.create('queueName', 'data');
    job.jobHandle = 'handle';
    job.server = new EventEmitter();

    var errors = [];
    job.on('error', function(e) {
      errors.push(e);
    })

    job.success('data');
    job.fail('data');
    job.exception('data');
    job.data('data');
    job.warning('data');
    job.status('data');

    assert.equal(6, errors.length);
  })
});