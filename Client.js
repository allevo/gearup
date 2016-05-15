'use strict';

var BaseConnector   = require('./BaseConnector');
var inherits = require('util').inherits;

var getBuffer = require('./utils').getBuffer;

function Client(server) {
  BaseConnector.apply(this, server);
  this.server.client = this;

  this.isWaitingForACreation = false;
  this.jobsWaitingForTheCreation = [];

  this.jobsWaitingForTheCompletion = {};
}
inherits(Client, BaseConnector);

Client.OPTION_REQUEST = {
  EXCEPTION: 'exceptions',
};

Object.freeze(Client.OPTION_REQUEST);

var submitJobMap = {
  low: {
    true: 'submitlJobLowBackground',
    false: 'submitlJobLow',
  },
  high: {
    true: 'submitlJobHighBackground',
    false: 'submitlJobHigh',
  },
  normal: {
    true: 'submitlJobNormalBackground',
    false: 'submitlJobNormal',
  }
};

Client.prototype.__submitNextJob = function() {
  if (this.isWaitingForACreation) return;

  var job = this.jobsWaitingForTheCreation[0];
  if (!job) return;

  this.isWaitingForACreation = true;

  var queueBuffer = getBuffer(job.queue);
  var dataBuffer = getBuffer(job.workload);

  var identifierBuffer = getBuffer(job.identifier || '');

  var priority = job.priority || 'normal';
  var isBackground = job.isBackground || false;

  this.server[submitJobMap[priority][isBackground]](queueBuffer, dataBuffer, identifierBuffer);
};

Client.prototype.submitJob = function(job) {
  this.jobsWaitingForTheCreation.push(job);
  this.__submitNextJob();
};

Client.prototype.handleResponseJobCreated = function(jobHandleBuffer) {
  var job = this.jobsWaitingForTheCreation.shift();
  if (!job) throw new Error('Not possible!!');

  job.jobHandle = jobHandleBuffer.toString('ascii');

  this.isWaitingForACreation = false;

  if (!job.isBackground) this.jobsWaitingForTheCompletion[job.jobHandle] = job;

  job.emit('submitted');
  this.__submitNextJob();
};

Client.prototype.handleWorkComplete = function(content) {
	this.__emitEventWithWorkload('complete', content);
  delete this.jobsWaitingForTheCompletion[jobHandleBuffer.toString('ascii')];
};

Client.prototype.handleWorkFail = function(content) {
  var jobHandleBuffer = content.slice(0, -1);

  var job = this.jobsWaitingForTheCompletion[jobHandleBuffer.toString('ascii')];
  if (!job) throw new Error('No job found for ' + jobHandleBuffer.toString('ascii'));

  job.emit('fail');

  delete this.jobsWaitingForTheCompletion[jobHandleBuffer.toString('ascii')];
};

Client.prototype.handleWorkStatus = function(content) {
	var indexes = BaseConnector.findNullBufferIndexes(content, 2);
	var jobHandleEndIndex = indexes[0];
	var numeratorEndIndex = indexes[1];

  var jobHandleBuffer = content.slice(0, jobHandleEndIndex);
  var numeratorBuffer = content.slice(jobHandleEndIndex + 1, numeratorEndIndex);
  var denominatorBuffer = content.slice(numeratorEndIndex + 1);

  var job = this.jobsWaitingForTheCompletion[jobHandleBuffer.toString('ascii')];
  if (!job) throw new Error('No job found for ' + jobHandleBuffer.toString('ascii'));

  job.emit('status', {
    numerator: numeratorBuffer,
    denominatorBuffer: denominatorBuffer,
  });
};

Client.prototype.handleWorkException = function(content) {
	this.__emitEventWithWorkload('exception', content);
};

Client.prototype.handleWorkData = function(content) {
	this.__emitEventWithWorkload('data', content);
};

Client.prototype.handleWorkWarning = function(content) {
	this.__emitEventWithWorkload('warning', content);
};

Client.prototype.__emitEventWithWorkload = function(eventName, content) {
	var indexes = BaseConnector.findNullBufferIndexes(content, 1);

  var jobHandleBuffer = content.slice(0, indexes[0]);
  var workloadBuffer = content.slice(indexes[0] + 1);

  var job = this.jobsWaitingForTheCompletion[jobHandleBuffer.toString('ascii')];
  if (!job) throw new Error('No job found for ' + jobHandleBuffer.toString('ascii'));

  job.emit(eventName, workloadBuffer);
}

module.exports = Client;
