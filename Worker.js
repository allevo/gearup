'use strict';

var BaseConnector   = require('./BaseConnector');
var inherits = require('util').inherits;


var utils = require('./utils');
var getBuffer = utils.getBuffer;
var Job = require('./Job');

function Worker(server) {
  BaseConnector.call(this, server);

  this.server.worker = this;

  this.functions = {};
}
inherits(Worker, BaseConnector);

Worker.OPTION_REQUEST = {
  EXCEPTION: 'exceptions',
};
Object.freeze(Worker.OPTION_REQUEST);

Worker.prototype.canDo = function(queue, callback) {
  utils.logger.info('canDo', queue);

  this.functions[queue] = callback;

  this.server.canDo(getBuffer(queue));
};

Worker.prototype.grab = function() {
  utils.logger.debug('grab');
  this.server.grab();
};

Worker.prototype.setClientId = function(id) {
  utils.logger.info('setClientId', id);
  this.server.setClientId(getBuffer(id + ''));
};

Worker.prototype.handleJobAssign = function(content) {
  utils.logger.info('handleJobAssign');

  var jobHandleEndIndex = -1;
  var queueEndIndex = -1;
  for (var i = 0; i < content.length; i++) {
    if (content[i] !== 0) continue;
    if (jobHandleEndIndex === -1) jobHandleEndIndex = i;
    else queueEndIndex = i;
  }

  var jobHandleBuffer = content.slice(0, jobHandleEndIndex);
  var queueBuffer = content.slice(jobHandleEndIndex + 1, queueEndIndex);
  var workloadBuffer = content.slice(queueEndIndex + 1);

  var jobHandle = jobHandleBuffer.toString('ascii');
  var queue = queueBuffer.toString('ascii');

  var callback = this.functions[queue];
  if (!callback) return this.emit('unknown-queue', queue);

  var job = Job.create(queue, workloadBuffer);
  job.jobHandle = jobHandle;
  job.server = this.server;

  callback(job);
};

Worker.prototype.handleNoJob = function() {
  utils.logger.info('handleNoJob');
  this.preSleep();
};

Worker.prototype.handleNoOp = function() {
  utils.logger.info('handleNoOp');
  this.grab();
};

Worker.prototype.preSleep = function() {
  utils.logger.info('preSleep');
  this.server.preSleep();
};

module.exports = Worker;
