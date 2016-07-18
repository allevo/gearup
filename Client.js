'use strict';

var BaseConnector   = require('./BaseConnector');
var inherits = require('util').inherits;

var utils = require('./utils');
var getBuffer = utils.getBuffer;

function Client(server) {
  BaseConnector.call(this, server);
  this.server.client = this;

  this.server.once('socket-error', function(e) {
    var i;
    for(i = 0; i < this.jobsWaitingForTheCreation.length; i++) {
      this.jobsWaitingForTheCreation[i].emit('error', e);
    }
    for(i in this.jobsWaitingForTheCompletion) {
      this.jobsWaitingForTheCompletion[i].emit('error', e);
    }
    this.server.client = null;
    this.emit('error', e);
  }.bind(this));
  this.server.once('socket-close', function(hadError) {
    this.server.worker = null;
    this.emit('close', hadError);
  }.bind(this));
  this.server.on('socket-timeout', function() {
    this.emit('timeout');
  }.bind(this));

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
  },
};

Client.prototype.__submitNextJob = function() {
  if (this.isWaitingForACreation) return;
  if (this.jobsWaitingForTheCreation.length === 0) return;

  var job = this.jobsWaitingForTheCreation[0];

  this.isWaitingForACreation = true;

  var queueBuffer = getBuffer(job.queue);
  var dataBuffer = getBuffer(job.workload);

  var identifierBuffer = getBuffer(job.identifier || '');

  var priority = job.priority || 'normal';
  var isBackground = job.isBackground || false;

  try {
    this.server[submitJobMap[priority][isBackground]](queueBuffer, dataBuffer, identifierBuffer);
  } catch(e) {
    utils.logger.error(e);
    job.emit('error', e);
    this.emit('error', e);
  }
};

Client.prototype.submitJob = function(job) {
  utils.logger.info('submit job', job);

  this.jobsWaitingForTheCreation.push(job);
  this.__submitNextJob();
};

Client.prototype.handleResponseJobCreated = function(jobHandleBuffer) {
  utils.logger.info('handleResponseJobCreated');

  var job = this.jobsWaitingForTheCreation.shift();
  if (!job) throw new Error('Not possible!!');

  job.jobHandle = jobHandleBuffer.toString('ascii');

  this.isWaitingForACreation = false;

  if (!job.isBackground) this.jobsWaitingForTheCompletion[job.jobHandle] = job;


  job.emit('submitted');
  this.__submitNextJob();
};

Client.prototype.handleWorkComplete = function(content) {
  utils.logger.info('handleWorkComplete');

	var jobHandleBuffer = this.__emitEventWithWorkload('complete', content);
  delete this.jobsWaitingForTheCompletion[jobHandleBuffer.toString('ascii')];
};

Client.prototype.handleWorkFail = function(jobHandleBuffer) {
  utils.logger.info('handleWorkFail');

  var job = this.jobsWaitingForTheCompletion[jobHandleBuffer.toString('ascii')];
  if (!job) throw new Error('No job found for ' + jobHandleBuffer.toString('ascii'));

  job.emit('fail');

  delete this.jobsWaitingForTheCompletion[jobHandleBuffer.toString('ascii')];
};

function getIntFromBuffer(buff) {
  var length = buff.length;
  var num = 0;
  while (length--) num += Math.pow(16, length) * buff.readUInt8(buff.length - length - 1);
  return num;
}

Client.prototype.handleWorkStatus = function(content) {
  utils.logger.info('handleWorkStatus');

	var indexes = BaseConnector.findNullBufferIndexes(content, 2);
	var jobHandleEndIndex = indexes[0];
	var numeratorEndIndex = indexes[1];

  var jobHandleBuffer = content.slice(0, jobHandleEndIndex);
  var numeratorBuffer = content.slice(jobHandleEndIndex + 1, numeratorEndIndex);
  var denominatorBuffer = content.slice(numeratorEndIndex + 1);

  var job = this.jobsWaitingForTheCompletion[jobHandleBuffer.toString('ascii')];
  if (!job) throw new Error('No job found for ' + jobHandleBuffer.toString('ascii'));

  job.emit('status', {
    numerator: getIntFromBuffer(numeratorBuffer),
    denominator: getIntFromBuffer(denominatorBuffer),
  });
};

Client.prototype.handleWorkException = function(content) {
  utils.logger.info('handleWorkException');
	this.__emitEventWithWorkload('exception', content);
};

Client.prototype.handleWorkData = function(content) {
  utils.logger.info('handleWorkData');
	this.__emitEventWithWorkload('data', content);
};

Client.prototype.handleWorkWarning = function(content) {
  utils.logger.info('handleWorkWarning');
	this.__emitEventWithWorkload('warning', content);
};

Client.prototype.__emitEventWithWorkload = function(eventName, content) {
	var indexes = BaseConnector.findNullBufferIndexes(content, 1);

  var jobHandleBuffer = content.slice(0, indexes[0]);
  var workloadBuffer = content.slice(indexes[0] + 1);

  var job = this.jobsWaitingForTheCompletion[jobHandleBuffer.toString('ascii')];
  if (!job) throw new Error('No job found for ' + jobHandleBuffer.toString('ascii'));

  job.emit(eventName, workloadBuffer);

  return jobHandleBuffer;
};

module.exports = Client;
