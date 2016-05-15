'use strict';


var EventEmitter   = require('events').EventEmitter;
var inherits = require('util').inherits;

var getBuffer = require('./utils').getBuffer;
var getBufferForTheLength = require('./utils').getBufferForTheLength;

function Job(queue, workload) {
  EventEmitter.apply(this);

  this.queue = queue;
  this.workload = workload;

  this.jobHandle = undefined;

  this.server = undefined;
}
inherits(Job, EventEmitter);


Job.prototype.success = function(response) {
  this.server.workComplete(getBuffer(this.jobHandle, {addNullInTheEnd: true}), new Buffer(response, 'ascii'));
};
Job.prototype.fail = function() {
  this.server.workFail(getBuffer(this.jobHandle, {addNullInTheEnd: true}));
};
Job.prototype.exception = function(response) {
  this.server.workException(getBuffer(this.jobHandle, {addNullInTheEnd: true}), new Buffer(response, 'ascii'));
};
Job.prototype.data = function(response) {
  this.server.workData(getBuffer(this.jobHandle, {addNullInTheEnd: true}), new Buffer(response, 'ascii'));
};
Job.prototype.warning = function(response) {
  this.server.workWarning(getBuffer(this.jobHandle, {addNullInTheEnd: true}), new Buffer(response, 'ascii'));
};

Job.prototype.status = function(numerator, denominator) {
  this.server.workStatus(
    getBuffer(this.jobHandle, {addNullInTheEnd: true}),
    Buffer.concat([getBufferForTheLength(numerator), new Buffer([0x00])]),
    getBufferForTheLength(denominator)
  );
};

Job.create = function(queue, workload) {
  return new Job(queue, workload);
};

module.exports = Job;
