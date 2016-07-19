'use strict';

var net = require('net');
var EventEmitter   = require('events').EventEmitter;
var inherits = require('util').inherits;

var protocol = require('./protocol');

var utils = require('./utils');
var getBufferForTheLength = utils.getBufferForTheLength;
var getContentLengthFromBuffer = utils.getContentLengthFromBuffer;
var nullBuffer = utils.NullCharBuffer;

function Server(host, port) {
  EventEmitter.apply(this);

  this.host = host;
  this.port = port;

  this.socket = null;

  this.client = null;
  this.worker = null;
}
inherits(Server, EventEmitter);

Server.prototype.submitlJobLowBackground = function(queueBuffer, dataBuffer, identifierBuffer) {
  utils.logger.info('SUBMIT_JOB_LOW_BG');
  this.__write3Args(protocol.REQUEST_PACKET_TYPE.SUBMIT_JOB_LOW_BG, queueBuffer, identifierBuffer, dataBuffer);
};
Server.prototype.submitlJobLow = function(queueBuffer, dataBuffer, identifierBuffer) {
  utils.logger.info('SUBMIT_JOB_LOW');
  this.__write3Args(protocol.REQUEST_PACKET_TYPE.SUBMIT_JOB_LOW, queueBuffer, identifierBuffer, dataBuffer);
};
Server.prototype.submitlJobHighBackground = function(queueBuffer, dataBuffer, identifierBuffer) {
  utils.logger.info('SUBMIT_JOB_HIGH_BG');
  this.__write3Args(protocol.REQUEST_PACKET_TYPE.SUBMIT_JOB_HIGH_BG, queueBuffer, identifierBuffer, dataBuffer);
};
Server.prototype.submitlJobHigh = function(queueBuffer, dataBuffer, identifierBuffer) {
  utils.logger.info('SUBMIT_JOB_HIGH');
  this.__write3Args(protocol.REQUEST_PACKET_TYPE.SUBMIT_JOB_HIGH, queueBuffer, identifierBuffer, dataBuffer);
};
Server.prototype.submitlJobNormalBackground = function(queueBuffer, dataBuffer, identifierBuffer) {
  utils.logger.info('SUBMIT_JOB_BG');
  this.__write3Args(protocol.REQUEST_PACKET_TYPE.SUBMIT_JOB_BG, queueBuffer, identifierBuffer, dataBuffer);
};
Server.prototype.submitlJobNormal = function(queueBuffer, dataBuffer, identifierBuffer) {
  utils.logger.info('SUBMIT_JOB');
  this.__write3Args(protocol.REQUEST_PACKET_TYPE.SUBMIT_JOB, queueBuffer, identifierBuffer, dataBuffer);
};
Server.prototype.canDo = function(queueBuffer) {
  utils.logger.info('CAN_DO');
  this.__write1Args(protocol.REQUEST_PACKET_TYPE.CAN_DO, queueBuffer);
};
Server.prototype.grab = function() {
  utils.logger.info('GRAB');
  this.__write0Args(protocol.REQUEST_PACKET_TYPE.GRAB);
};
Server.prototype.preSleep = function() {
  utils.logger.info('PRE_SLEEP');
  this.__write0Args(protocol.REQUEST_PACKET_TYPE.PRE_SLEEP);
};
Server.prototype.workStatus = function(jobHadleBuffer, numeratorBuffer, denominatorBuffer) {
  utils.logger.info('WORK_STATUS');
  this.__write3Args(protocol.REQUEST_PACKET_TYPE.WORK_STATUS, jobHadleBuffer, numeratorBuffer, denominatorBuffer);
};
Server.prototype.workComplete = function(jobHadleBuffer, responseBuffer) {
  utils.logger.info('WORK_COMPLETE');
  this.__write2Args(protocol.REQUEST_PACKET_TYPE.WORK_COMPLETE, jobHadleBuffer, responseBuffer);
};
Server.prototype.workFail = function(jobHadleBuffer) {
  utils.logger.info('WORK_FAIL');
  this.__write1Args(protocol.REQUEST_PACKET_TYPE.WORK_FAIL, jobHadleBuffer);
};
Server.prototype.workException = function(jobHadleBuffer, responseBuffer) {
  utils.logger.info('WORK_EXCEPTION');
  this.__write2Args(protocol.REQUEST_PACKET_TYPE.WORK_EXCEPTION, jobHadleBuffer, responseBuffer);
};
Server.prototype.workData = function(jobHadleBuffer, responseBuffer) {
  utils.logger.info('WORK_DATA');
  this.__write2Args(protocol.REQUEST_PACKET_TYPE.WORK_DATA, jobHadleBuffer, responseBuffer);
};
Server.prototype.workWarning = function(jobHadleBuffer, responseBuffer) {
  utils.logger.info('WORK_WARNING');
  this.__write2Args(protocol.REQUEST_PACKET_TYPE.WORK_WARNING, jobHadleBuffer, responseBuffer);
};
Server.prototype.echo = function(dataBuffer) {
  utils.logger.info('ECHO');
  this.__write1Args(protocol.REQUEST_PACKET_TYPE.ECHO, dataBuffer);
};
Server.prototype.setClientId = function(idBuffer) {
  utils.logger.info('SET_CLIENT_ID');
  this.__write1Args(protocol.REQUEST_PACKET_TYPE.SET_CLIENT_ID, idBuffer);
};
Server.prototype.optionsRequest = function(optionBuffer) {
  utils.logger.info('OPTION_REQ');
  this.__write1Args(protocol.REQUEST_PACKET_TYPE.OPTION_REQ, optionBuffer);
};

Server.prototype.connect = function() {
  this.socket = net.createConnection({
    port: this.port,
    host: this.host,
  });
  this.socket.ref();

  this.socket.setKeepAlive(true);
  this.socket.once('connect', function() {
    this.emit('connect');
  }.bind(this));

  this.socket.once('error', function(error) {
    this.emit('socket-error', error);
  }.bind(this));
  this.socket.once('close', function(hadError) {
    this.emit('socket-close', hadError);
  }.bind(this));
  this.socket.on('timeout', function() {
    this.emit('socket-timeout');
  }.bind(this));

  var pre = new Buffer(0);
  function readData(buff) {
    if (buff) pre = Buffer.concat([pre, buff]);
    // no enough data
    if (pre.length < protocol.MINIMUN_PACKET_LENGTH) return;

    var responseHeader = pre.slice(0, 4);
    // Invalid response!!
    if (responseHeader.toString('utf8') !== protocol.RESPONSE_HEADER_UTF8) throw new Error('Invalid header');

    var responseTypeBuffer = pre.slice(4, 8);
    var contentLengthBuffer = pre.slice(8, 12);
    var contentLength = getContentLengthFromBuffer(contentLengthBuffer);

    // no enough data
    if (pre.length < 12 + contentLength) return;

    this.handleResponse(responseTypeBuffer, pre.slice(12, 12 + contentLength));

    pre = pre.slice(12 + contentLength);
    // multiple response
    if (pre.length > 0) {
      readDataBinded();
    }
  }
  var readDataBinded = readData.bind(this);
  this.socket.on('data', readDataBinded);
};

Server.prototype.disconnect = function(callback) {
  // already disconnected
  if (!this.socket) return callback();

  var cleanup = function() {
    this.socket.destroy();

    this.worker = null;
    this.client = null;
    this.socket = null;

    callback();
  }.bind(this);

  if (this.socket.destroyed || !this.socket._handle) return cleanup();

  this.socket.once('end', cleanup);
  this.socket.end();
};

var responseTypeMap = {
  JOB_CREATED: 'handleResponseJobCreated',
  JOB_ASSIGN: 'handleJobAssign',
  NO_JOB: 'handleNoJob',
  NOOP: 'handleNoOp',
  WORK_COMPLETE: 'handleWorkComplete',
  WORK_STATUS: 'handleWorkStatus',
  WORK_FAIL: 'handleWorkFail',
  WORK_EXCEPTION: 'handleWorkException',
  WORK_DATA: 'handleWorkData',
  WORK_WARNING: 'handleWorkWarning',
  ECHO: 'handleEcho',
  OPTION_RES: 'handleOptionResponse',
};
Server.prototype.handleResponse = function(responseTypeBuffer, content) {
  var hexRepresentation = responseTypeBuffer.toString('hex');
  if (!protocol.RESPONSE_PACKET_TYPE.hasOwnProperty(hexRepresentation)) {
    utils.logger.error(responseTypeBuffer, content);
    return this.emit('not-implemented', responseTypeBuffer);
  }
  var responsePacketType = protocol.RESPONSE_PACKET_TYPE[hexRepresentation];

  utils.logger.info('handleResponse', responsePacketType, content);

  if (!responseTypeMap.hasOwnProperty(responsePacketType)) {
    utils.logger.error('Not implemented', responseTypeBuffer, content);
    return this.emit('not-implemented', responseTypeBuffer);
  }
  this[responseTypeMap[responsePacketType]](content);
};

Server.prototype.handleResponseJobCreated = function(content) {
  this.client.handleResponseJobCreated(content);
};
Server.prototype.handleJobAssign = function(content) {
  this.worker.handleJobAssign(content);
};
Server.prototype.handleNoJob = function() {
  this.worker.handleNoJob();
};
Server.prototype.handleNoOp = function() {
  this.worker.handleNoOp();
};
Server.prototype.handleWorkComplete = function(content) {
  this.client.handleWorkComplete(content);
};
Server.prototype.handleWorkStatus = function(content) {
  this.client.handleWorkStatus(content);
};
Server.prototype.handleWorkFail = function(content) {
  this.client.handleWorkFail(content);
};
Server.prototype.handleWorkException = function(content) {
  this.client.handleWorkException(content);
};
Server.prototype.handleWorkData = function(content) {
  this.client.handleWorkData(content);
};
Server.prototype.handleWorkWarning = function(content) {
  this.client.handleWorkWarning(content);
};
Server.prototype.handleEcho = function(content) {
  if (content[0] === 0x01) {
    this.client.handleEcho(content.slice(1));
  } else {
    this.worker.handleEcho(content.slice(1));
  }
};
Server.prototype.handleOptionResponse = function(content) {
  if (this.client && this.client.isSettingOption) {
    this.client.handleOptionResponse(content);
  } else if(this.worker && this.worker.isSettingOption) {
    this.worker.handleOptionResponse(content);
  }
};

Server.prototype.__write0Args = function(packageTypeBuffer) {
  this.writeToSocket([
    protocol.REQUEST_HEADER,
    packageTypeBuffer,
    getBufferForTheLength(0, 4),
  ]);
};
Server.prototype.__write1Args = function(packageTypeBuffer, firstBuffer) {
  this.writeToSocket([
    protocol.REQUEST_HEADER,
    packageTypeBuffer,
    getBufferForTheLength(firstBuffer.length, 4),
    firstBuffer,
  ]);
};
Server.prototype.__write2Args = function(packageTypeBuffer, firstBuffer, secondBuffer) {
  this.writeToSocket([
    protocol.REQUEST_HEADER,
    packageTypeBuffer,
    getBufferForTheLength(firstBuffer.length + secondBuffer.length + 1, 4),
    firstBuffer,
    nullBuffer,
    secondBuffer,
  ]);
};
Server.prototype.__write3Args = function(packageTypeBuffer, firstBuffer, secondBuffer, thirdBuffer) {
  this.writeToSocket([
    protocol.REQUEST_HEADER,
    packageTypeBuffer,
    getBufferForTheLength(firstBuffer.length + secondBuffer.length + thirdBuffer.length + 2, 4),
    firstBuffer,
    nullBuffer,
    secondBuffer,
    nullBuffer,
    thirdBuffer,
  ]);
};
Server.prototype.writeToSocket = function(buffs) {
  utils.logger.debug('write to socket', buffs);

  if (!this.socket || !this.socket.writable) throw new Error('Cannot write to unwritable socket');

  while(buffs.length) {
    this.socket.write(buffs.shift());
  }
};

module.exports = Server;
