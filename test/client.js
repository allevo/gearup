'use strict';

var assert = require('assert');
var EventEmitter = require('events');

var Client = require('../Client');
var Job = require('../Job');

describe('client', function() {
  it('submitlJobNormal', function() {
    var isCalledSync = false;

    var server = new EventEmitter();
    server.submitlJobNormal = function(queueBuffer, dataBuffer, identifierBuffer) {
      assert.deepEqual(new Buffer([0x71, 0x75, 0x65, 0x75, 0x65, 0x4e, 0x61, 0x6d, 0x65]), queueBuffer);
      assert.deepEqual(new Buffer([0x74, 0x68, 0x65, 0x20, 0x63, 0x6f, 0x6e, 0x74, 0x65, 0x6e, 0x74, 0x21]), dataBuffer);
      assert.deepEqual(new Buffer([]), identifierBuffer);

      assert.equal('queueName', queueBuffer.toString('ascii'));
      assert.equal('the content!', dataBuffer.toString('ascii'));
      assert.equal('', identifierBuffer.toString('ascii'));

      isCalledSync = true;
    };

    var c = new Client(server);
    var job = Job.create('queueName', 'the content!');
    c.submitJob(job);

    assert.ok(c.isWaitingForACreation);
    assert.equal(1, c.jobsWaitingForTheCreation.length);
    assert.deepEqual(job, c.jobsWaitingForTheCreation[0]);

    assert.ok(isCalledSync);
  });

  it('submitlJobNormalBackground', function() {
    var isCalledSync = false;

    var server = new EventEmitter();
    server.submitlJobNormalBackground = function(queueBuffer, dataBuffer, identifierBuffer) {
      assert.deepEqual(new Buffer([0x71, 0x75, 0x65, 0x75, 0x65, 0x4e, 0x61, 0x6d, 0x65]), queueBuffer);
      assert.deepEqual(new Buffer([0x74, 0x68, 0x65, 0x20, 0x63, 0x6f, 0x6e, 0x74, 0x65, 0x6e, 0x74, 0x21]), dataBuffer);
      assert.deepEqual(new Buffer([]), identifierBuffer);

      assert.equal('queueName', queueBuffer.toString('ascii'));
      assert.equal('the content!', dataBuffer.toString('ascii'));
      assert.equal('', identifierBuffer.toString('ascii'));

      isCalledSync = true;
    };

    var c = new Client(server);
    var job = Job.create('queueName', 'the content!');
    job.isBackground = true;
    c.submitJob(job);

    assert.ok(c.isWaitingForACreation);
    assert.equal(1, c.jobsWaitingForTheCreation.length);
    assert.deepEqual(job, c.jobsWaitingForTheCreation[0]);

    assert.ok(isCalledSync);
  });

  it('submitlJobHigh', function() {
    var isCalledSync = false;

    var server = new EventEmitter();
    server.submitlJobHigh = function(queueBuffer, dataBuffer, identifierBuffer) {
      assert.deepEqual(new Buffer([0x71, 0x75, 0x65, 0x75, 0x65, 0x4e, 0x61, 0x6d, 0x65]), queueBuffer);
      assert.deepEqual(new Buffer([0x74, 0x68, 0x65, 0x20, 0x63, 0x6f, 0x6e, 0x74, 0x65, 0x6e, 0x74, 0x21]), dataBuffer);
      assert.deepEqual(new Buffer([]), identifierBuffer);

      assert.equal('queueName', queueBuffer.toString('ascii'));
      assert.equal('the content!', dataBuffer.toString('ascii'));
      assert.equal('', identifierBuffer.toString('ascii'));

      isCalledSync = true;
    };

    var c = new Client(server);
    var job = Job.create('queueName', 'the content!');
    job.priority = 'high';
    c.submitJob(job);

    assert.ok(c.isWaitingForACreation);
    assert.equal(1, c.jobsWaitingForTheCreation.length);
    assert.deepEqual(job, c.jobsWaitingForTheCreation[0]);

    assert.ok(isCalledSync);
  });

  it('submitlJobHighBackground', function() {
    var isCalledSync = false;

    var server = new EventEmitter();
    server.submitlJobHighBackground = function(queueBuffer, dataBuffer, identifierBuffer) {
      assert.deepEqual(new Buffer([0x71, 0x75, 0x65, 0x75, 0x65, 0x4e, 0x61, 0x6d, 0x65]), queueBuffer);
      assert.deepEqual(new Buffer([0x74, 0x68, 0x65, 0x20, 0x63, 0x6f, 0x6e, 0x74, 0x65, 0x6e, 0x74, 0x21]), dataBuffer);
      assert.deepEqual(new Buffer([]), identifierBuffer);

      assert.equal('queueName', queueBuffer.toString('ascii'));
      assert.equal('the content!', dataBuffer.toString('ascii'));
      assert.equal('', identifierBuffer.toString('ascii'));

      isCalledSync = true;
    };

    var c = new Client(server);
    var job = Job.create('queueName', 'the content!');
    job.priority = 'high';
    job.isBackground = true;
    c.submitJob(job);

    assert.ok(c.isWaitingForACreation);
    assert.equal(1, c.jobsWaitingForTheCreation.length);
    assert.deepEqual(job, c.jobsWaitingForTheCreation[0]);

    assert.ok(isCalledSync);
  });

  it('submitlJobLow', function() {
    var isCalledSync = false;

    var server = new EventEmitter();
    server.submitlJobLow = function(queueBuffer, dataBuffer, identifierBuffer) {
      assert.deepEqual(new Buffer([0x71, 0x75, 0x65, 0x75, 0x65, 0x4e, 0x61, 0x6d, 0x65]), queueBuffer);
      assert.deepEqual(new Buffer([0x74, 0x68, 0x65, 0x20, 0x63, 0x6f, 0x6e, 0x74, 0x65, 0x6e, 0x74, 0x21]), dataBuffer);
      assert.deepEqual(new Buffer([]), identifierBuffer);

      assert.equal('queueName', queueBuffer.toString('ascii'));
      assert.equal('the content!', dataBuffer.toString('ascii'));
      assert.equal('', identifierBuffer.toString('ascii'));

      isCalledSync = true;
    };

    var c = new Client(server);
    var job = Job.create('queueName', 'the content!');
    job.priority = 'low';
    c.submitJob(job);

    assert.ok(c.isWaitingForACreation);
    assert.equal(1, c.jobsWaitingForTheCreation.length);
    assert.deepEqual(job, c.jobsWaitingForTheCreation[0]);

    assert.ok(isCalledSync);
  });

  it('submitlJobLowBackground', function() {
    var isCalledSync = false;

    var server = new EventEmitter();
    server.submitlJobLowBackground = function(queueBuffer, dataBuffer, identifierBuffer) {
      assert.deepEqual(new Buffer([0x71, 0x75, 0x65, 0x75, 0x65, 0x4e, 0x61, 0x6d, 0x65]), queueBuffer);
      assert.deepEqual(new Buffer([0x74, 0x68, 0x65, 0x20, 0x63, 0x6f, 0x6e, 0x74, 0x65, 0x6e, 0x74, 0x21]), dataBuffer);
      assert.deepEqual(new Buffer([]), identifierBuffer);

      assert.equal('queueName', queueBuffer.toString('ascii'));
      assert.equal('the content!', dataBuffer.toString('ascii'));
      assert.equal('', identifierBuffer.toString('ascii'));

      isCalledSync = true;
    };

    var c = new Client(server);
    var job = Job.create('queueName', 'the content!');
    job.priority = 'low';
    job.isBackground = true;
    c.submitJob(job);

    assert.ok(c.isWaitingForACreation);
    assert.equal(1, c.jobsWaitingForTheCreation.length);
    assert.deepEqual(job, c.jobsWaitingForTheCreation[0]);

    assert.ok(isCalledSync);
  });

  it('handleResponseJobCreated', function() {
    var isCalledSync = false;

    var server = new EventEmitter();
    server.submitlJobNormal = function() { };

    var c = new Client(server);
    var job = Job.create('queueName', 'the content!');
    job.on('submitted', function() {
      assert.equal('handle', job.jobHandle);
      isCalledSync = true;
    });
    c.submitJob(job);

    c.handleResponseJobCreated(new Buffer('handle'));

    assert.equal(1, Object.keys(c.jobsWaitingForTheCompletion).length);
    assert.equal(job, c.jobsWaitingForTheCompletion.handle);
    assert.ok(isCalledSync);
  });

  it('handleResponseJobCreated background', function() {
    var isCalledSync = false;

    var server = new EventEmitter();
    server.submitlJobNormalBackground = function() { };
    var c = new Client(server);
    var job = Job.create('queueName', 'the content!');
    job.isBackground = true;
    job.on('submitted', function() {
      assert.equal('handle', job.jobHandle);
      isCalledSync = true;
    });
    c.submitJob(job);

    c.handleResponseJobCreated(new Buffer('handle'));

    assert.equal(0, Object.keys(c.jobsWaitingForTheCompletion).length);
    assert.ok(isCalledSync);
  });

  it('handleWorkComplete', function() {
    var isCalledSync = false;

    var server = new EventEmitter();
    server.submitlJobNormal = function() { };
    var c = new Client(server);
    var job = Job.create('queueName', 'the content!');
    job.on('complete', function(response) {
      assert.equal('handle', job.jobHandle);
      assert.deepEqual(new Buffer([0x74, 0x68, 0x65, 0x20, 0x72, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65]), response);
      assert.deepEqual('the response', response.toString('ascii'));
      isCalledSync = true;
    });
    c.submitJob(job);
    c.handleResponseJobCreated(new Buffer('handle'));

    c.handleWorkComplete(new Buffer('handle\0the response'));

    assert.equal(0, Object.keys(c.jobsWaitingForTheCompletion).length);
    assert.ok(isCalledSync);
  });

  it('handleWorkFail', function() {
    var isCalledSync = false;

    var server = new EventEmitter();
    server.submitlJobNormal = function() { };
    var c = new Client(server);
    var job = Job.create('queueName', 'the content!');
    job.on('fail', function() {
      assert.equal('handle', job.jobHandle);
      isCalledSync = true;
    });
    c.submitJob(job);
    c.handleResponseJobCreated(new Buffer('handle'));

    c.handleWorkFail(new Buffer('handle'));

    assert.equal(0, Object.keys(c.jobsWaitingForTheCompletion).length);
    assert.ok(isCalledSync);
  });

  it('handleWorkStatus', function() {
    var isCalledSync = false;

    var server = new EventEmitter();
    server.submitlJobNormal = function() { };
    var c = new Client(server);
    var job = Job.create('queueName', 'the content!');
    job.on('status', function(status) {
      assert.equal('handle', job.jobHandle);
      assert.equal(12, status.numerator);
      assert.equal(15, status.denominator);
      isCalledSync = true;
    });
    c.submitJob(job);
    c.handleResponseJobCreated(new Buffer('handle'));

    c.handleWorkStatus(new Buffer('handle' + '\0' + String.fromCharCode(12) + '\0' + String.fromCharCode(15)));

    assert.equal(1, Object.keys(c.jobsWaitingForTheCompletion).length);
    assert.ok(isCalledSync);
  });

  it('handleWorkException', function() {
    var isCalledSync = false;

    var server = new EventEmitter();
    server.submitlJobNormal = function() { };
    var c = new Client(server);
    var job = Job.create('queueName', 'the content!');
    job.on('exception', function(message) {
      assert.equal('handle', job.jobHandle);
      assert.equal('exception message', message);
      isCalledSync = true;
    });
    c.submitJob(job);
    c.handleResponseJobCreated(new Buffer('handle'));

    c.handleWorkException(new Buffer('handle\0exception message'));

    assert.equal(1, Object.keys(c.jobsWaitingForTheCompletion).length);
    assert.ok(isCalledSync);
  });

  it('handleWorkData', function() {
    var isCalledSync = false;

    var server = new EventEmitter();
    server.submitlJobNormal = function() { };
    var c = new Client(server);
    var job = Job.create('queueName', 'the content!');
    job.on('data', function(message) {
      assert.equal('handle', job.jobHandle);
      assert.equal('message', message);
      isCalledSync = true;
    });
    c.submitJob(job);
    c.handleResponseJobCreated(new Buffer('handle'));

    c.handleWorkData(new Buffer('handle\0message'));

    assert.equal(1, Object.keys(c.jobsWaitingForTheCompletion).length);
    assert.ok(isCalledSync);
  });

  it('handleWorkWarning', function() {
    var isCalledSync = false;

    var server = new EventEmitter();
    server.submitlJobNormal = function() { };
    var c = new Client(server);
    var job = Job.create('queueName', 'the content!');
    job.on('warning', function(message) {
      assert.equal('handle', job.jobHandle);
      assert.equal('message', message);
      isCalledSync = true;
    });
    c.submitJob(job);
    c.handleResponseJobCreated(new Buffer('handle'));

    c.handleWorkWarning(new Buffer('handle\0message'));

    assert.equal(1, Object.keys(c.jobsWaitingForTheCompletion).length);
    assert.ok(isCalledSync);
  });
});
