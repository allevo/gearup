'use strict';

var EventEmitter   = require('events').EventEmitter;
var inherits = require('util').inherits;

var getBuffer = require('./utils').getBuffer;

function BaseConnector(server) {
  EventEmitter.apply(this);

  this.server = server;
  this.isSettingOption = false;
  this.isEchoing = false;
}
inherits(BaseConnector, EventEmitter);

BaseConnector.prototype.echo = function(workload) {
  this.isEchoing = true;
  this.server.echo(getBuffer(workload));
};

BaseConnector.prototype.optionsRequest = function(option) {
  this.isSettingOption = true;
  this.server.optionsRequest(getBuffer(option));
};

BaseConnector.prototype.handleEcho = function(content) {
  this.isEchoing = false;
  this.emit('echo', content);
};

BaseConnector.prototype.handleOptionResponse = function(content) {
  this.isSettingOption = false;
  this.emit('option-response', content);
};

BaseConnector.findNullBufferIndexes = function(buffer, expectedNullBufferNumber) {
  var arr = new Array(expectedNullBufferNumber);
  var current = 0;
  var i = -1;
  while(i < buffer.length) {
    i++;
    if (buffer[i] !== 0x00) continue;
    arr[current++] = i;
    expectedNullBufferNumber--;
  }
  return arr;
};

module.exports = BaseConnector;
