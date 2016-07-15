'use strict';

var net = require('net');
var EventEmitter   = require('events').EventEmitter;
var inherits = require('util').inherits;

var protocol = require('./protocol');

var getBufferForTheLength = require('./utils').getBufferForTheLength;
var getContentLengthFromBuffer = require('./utils').getContentLengthFromBuffer;
var nullBuffer = require('./utils').NullCharBuffer;

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
  console.log('SUBMIT_JOB_LOW_BG');
	this.__write3Args(protocol.REQUEST_PACKET_TYPE.SUBMIT_JOB_LOW_BG, queueBuffer, dataBuffer, identifierBuffer);
};
Server.prototype.submitlJobLow = function(queueBuffer, dataBuffer, identifierBuffer) {
  console.log('SUBMIT_JOB_LOW');
	this.__write3Args(protocol.REQUEST_PACKET_TYPE.SUBMIT_JOB_LOW, queueBuffer, dataBuffer, identifierBuffer);
};
Server.prototype.submitlJobHighBackground = function(queueBuffer, dataBuffer, identifierBuffer) {
  console.log('SUBMIT_JOB_HIGH_BG');
	this.__write3Args(protocol.REQUEST_PACKET_TYPE.SUBMIT_JOB_HIGH_BG, queueBuffer, dataBuffer, identifierBuffer);
};
Server.prototype.submitlJobHigh = function(queueBuffer, dataBuffer, identifierBuffer) {
  console.log('SUBMIT_JOB_HIGH');
	this.__write3Args(protocol.REQUEST_PACKET_TYPE.SUBMIT_JOB_HIGH, queueBuffer, dataBuffer, identifierBuffer);
};
Server.prototype.submitlJobNormalBackground = function(queueBuffer, dataBuffer, identifierBuffer) {
  console.log('SUBMIT_JOB_BG');
	this.__write3Args(protocol.REQUEST_PACKET_TYPE.SUBMIT_JOB_BG, queueBuffer, dataBuffer, identifierBuffer);
};
Server.prototype.submitlJobNormal = function(queueBuffer, dataBuffer, identifierBuffer) {
  console.log('SUBMIT_JOB');
	this.__write3Args(protocol.REQUEST_PACKET_TYPE.SUBMIT_JOB, queueBuffer, dataBuffer, identifierBuffer);
};
Server.prototype.canDo = function(queueBuffer) {
  console.log('CAN_DO');
	this.__write1Args(protocol.REQUEST_PACKET_TYPE.CAN_DO, queueBuffer);
};
Server.prototype.grab = function() {
  console.log('GRAB');
	this.__write0Args(protocol.REQUEST_PACKET_TYPE.GRAB);
};
Server.prototype.preSleep = function() {
  console.log('PRE_SLEEP');
	this.__write0Args(protocol.REQUEST_PACKET_TYPE.PRE_SLEEP);
};
Server.prototype.workStatus = function(jobHadleBuffer, numeratorBuffer, denominatorBuffer) {
  console.log('WORK_STATUS');
	this.__write3Args(protocol.REQUEST_PACKET_TYPE.WORK_STATUS, jobHadleBuffer, numeratorBuffer, denominatorBuffer);
};
Server.prototype.workComplete = function(jobHadleBuffer, responseBuffer) {
  console.log('WORK_COMPLETE');
	this.__write2Args(protocol.REQUEST_PACKET_TYPE.WORK_COMPLETE, jobHadleBuffer, responseBuffer);
};
Server.prototype.workFail = function(jobHadleBuffer) {
  console.log('WORK_FAIL');
	this.__write1Args(protocol.REQUEST_PACKET_TYPE.WORK_FAIL, jobHadleBuffer);
};
Server.prototype.workException = function(jobHadleBuffer, responseBuffer) {
  console.log('WORK_EXCEPTION');
	this.__write2Args(protocol.REQUEST_PACKET_TYPE.WORK_EXCEPTION, jobHadleBuffer, responseBuffer);
};
Server.prototype.workData = function(jobHadleBuffer, responseBuffer) {
  console.log('WORK_DATA');
	this.__write2Args(protocol.REQUEST_PACKET_TYPE.WORK_DATA, jobHadleBuffer, responseBuffer);
};
Server.prototype.workWarning = function(jobHadleBuffer, responseBuffer) {
  console.log('WORK_WARNING');
	this.__write2Args(protocol.REQUEST_PACKET_TYPE.WORK_WARNING, jobHadleBuffer, responseBuffer);
};
Server.prototype.echo = function(dataBuffer) {
  console.log('ECHO');
	this.__write1Args(protocol.REQUEST_PACKET_TYPE.ECHO, dataBuffer);
};
Server.prototype.setClientId = function(idBuffer) {
  console.log('SET_CLIENT_ID');
	this.__write1Args(protocol.REQUEST_PACKET_TYPE.SET_CLIENT_ID, idBuffer);
};
Server.prototype.optionsRequest = function(optionBuffer) {
  console.log('OPTION_REQ');
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

  this.socket.on('error', function(error) {
    this.emit('socket-error', error);
  }.bind(this));
  this.socket.on('close', function(hadError) {
    this.emit('socket-close', hadError);
  }.bind(this));
  this.socket.on('timeout', function(hadError) {
    this.emit('socket-timeout', hadError);
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
    console.log(responseTypeBuffer.toString('ascii'), content.toString('ascii'));
    throw new Error('Not implemented: ' + responseTypeBuffer.toString('hex'));
  }
  var responsePacketType = protocol.RESPONSE_PACKET_TYPE[hexRepresentation];

  console.log('handleResponse', responsePacketType, content);

  if (!responseTypeMap.hasOwnProperty(responsePacketType)) {
    console.log(responseTypeBuffer.toString('ascii'), content.toString('ascii'));
    throw new Error('Not implemented: ' + responseTypeBuffer.toString('hex'));
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
  this.writeToSocket(Buffer.concat([
    protocol.REQUEST_HEADER,
    packageTypeBuffer,
    getBufferForTheLength(0, 4),
  ]));
};
Server.prototype.__write1Args = function(packageTypeBuffer, firstBuffer) {
  this.writeToSocket(Buffer.concat([
    protocol.REQUEST_HEADER,
    packageTypeBuffer,
    getBufferForTheLength(firstBuffer.length, 4),
    firstBuffer,
  ]));
};
Server.prototype.__write2Args = function(packageTypeBuffer, firstBuffer, secondBuffer) {
  this.writeToSocket(Buffer.concat([
    protocol.REQUEST_HEADER,
    packageTypeBuffer,
    getBufferForTheLength(firstBuffer.length + secondBuffer.length + 1, 4),
    firstBuffer,
    nullBuffer,
    secondBuffer,
  ]));
};
Server.prototype.__write3Args = function(packageTypeBuffer, firstBuffer, secondBuffer, thirdBuffer) {
  this.writeToSocket(Buffer.concat([
    protocol.REQUEST_HEADER,
    packageTypeBuffer,
    getBufferForTheLength(firstBuffer.length + secondBuffer.length + thirdBuffer.length + 2, 4),
    firstBuffer,
    nullBuffer,
    secondBuffer,
    nullBuffer,
    thirdBuffer,
  ]));
};
Server.prototype.writeToSocket = function(buff) {
  console.log('write to socket', buff);
  if (!this.socket.writable) throw new Error('Cannot write to unwritable socket');
  this.socket.write(buff);
};

module.exports = Server;
