'use strict';

var assert = require('assert');

var Server = require('../Server');
var protocol  = require('../protocol');

describe('server', function() {
  it('submitlJobLowBackground', function() {
    var isCalledSync = false;

    var server = new Server('127.0.0.1', 4730);
    server.writeToSocket = function(buffs) {
      assert.deepEqual(buffs, [
        protocol.REQUEST_HEADER,
        protocol.REQUEST_PACKET_TYPE.SUBMIT_JOB_LOW_BG,
        new Buffer([0x00, 0x00, 0x00, 0x0b]),
        new Buffer([0x71, 0x75, 0x65, 0x75, 0x65]),
        new Buffer([0x00]),
        new Buffer([]),
        new Buffer([0x00]),
        new Buffer([0x64, 0x61, 0x74, 0x61]),
      ]);

      isCalledSync = true;
    };

    server.submitlJobLowBackground(new Buffer('queue'), new Buffer('data'), new Buffer([]));

    assert.ok(isCalledSync);
  });

  it('submitlJobLow', function() {
    var isCalledSync = false;

    var server = new Server('127.0.0.1', 4730);
    server.writeToSocket = function(buffs) {
      assert.deepEqual(buffs, [
        protocol.REQUEST_HEADER,
        protocol.REQUEST_PACKET_TYPE.SUBMIT_JOB_LOW,
        new Buffer([0x00, 0x00, 0x00, 0x0b]),
        new Buffer([0x71, 0x75, 0x65, 0x75, 0x65]),
        new Buffer([0x00]),
        new Buffer([]),
        new Buffer([0x00]),
        new Buffer([0x64, 0x61, 0x74, 0x61]),
      ]);

      isCalledSync = true;
    };

    server.submitlJobLow(new Buffer('queue'), new Buffer('data'), new Buffer([]));

    assert.ok(isCalledSync);
  });

  it('submitlJobHighBackground', function() {
    var isCalledSync = false;

    var server = new Server('127.0.0.1', 4730);
    server.writeToSocket = function(buffs) {
      assert.deepEqual(buffs, [
        protocol.REQUEST_HEADER,
        protocol.REQUEST_PACKET_TYPE.SUBMIT_JOB_HIGH_BG,
        new Buffer([0x00, 0x00, 0x00, 0x0b]),
        new Buffer([0x71, 0x75, 0x65, 0x75, 0x65]),
        new Buffer([0x00]),
        new Buffer([]),
        new Buffer([0x00]),
        new Buffer([0x64, 0x61, 0x74, 0x61]),
      ]);

      isCalledSync = true;
    };

    server.submitlJobHighBackground(new Buffer('queue'), new Buffer('data'), new Buffer([]));

    assert.ok(isCalledSync);
  });

  it('submitlJobHigh', function() {
    var isCalledSync = false;

    var server = new Server('127.0.0.1', 4730);
    server.writeToSocket = function(buffs) {
      assert.deepEqual(buffs, [
        protocol.REQUEST_HEADER,
        protocol.REQUEST_PACKET_TYPE.SUBMIT_JOB_HIGH,
        new Buffer([0x00, 0x00, 0x00, 0x0b]),
        new Buffer([0x71, 0x75, 0x65, 0x75, 0x65]),
        new Buffer([0x00]),
        new Buffer([]),
        new Buffer([0x00]),
        new Buffer([0x64, 0x61, 0x74, 0x61]),
      ]);

      isCalledSync = true;
    };

    server.submitlJobHigh(new Buffer('queue'), new Buffer('data'), new Buffer([]));

    assert.ok(isCalledSync);
  });

  it('submitlJobNormalBackground', function() {
    var isCalledSync = false;

    var server = new Server('127.0.0.1', 4730);
    server.writeToSocket = function(buffs) {
      assert.deepEqual(buffs, [
        protocol.REQUEST_HEADER,
        protocol.REQUEST_PACKET_TYPE.SUBMIT_JOB_BG,
        new Buffer([0x00, 0x00, 0x00, 0x0b]),
        new Buffer([0x71, 0x75, 0x65, 0x75, 0x65]),
        new Buffer([0x00]),
        new Buffer([]),
        new Buffer([0x00]),
        new Buffer([0x64, 0x61, 0x74, 0x61]),
      ]);

      isCalledSync = true;
    };

    server.submitlJobNormalBackground(new Buffer('queue'), new Buffer('data'), new Buffer([]));

    assert.ok(isCalledSync);
  });

  it('submitlJobNormal', function() {
    var isCalledSync = false;

    var server = new Server('127.0.0.1', 4730);
    server.writeToSocket = function(buffs) {
      assert.deepEqual(buffs, [
        protocol.REQUEST_HEADER,
        protocol.REQUEST_PACKET_TYPE.SUBMIT_JOB,
        new Buffer([0x00, 0x00, 0x00, 0x0b]),
        new Buffer([0x71, 0x75, 0x65, 0x75, 0x65]),
        new Buffer([0x00]),
        new Buffer([]),
        new Buffer([0x00]),
        new Buffer([0x64, 0x61, 0x74, 0x61]),
      ]);

      isCalledSync = true;
    };

    server.submitlJobNormal(new Buffer('queue'), new Buffer('data'), new Buffer([]));

    assert.ok(isCalledSync);
  });

  it('canDo', function() {
    var isCalledSync = false;

    var server = new Server('127.0.0.1', 4730);
    server.writeToSocket = function(buffs) {
      assert.deepEqual(buffs, [
        protocol.REQUEST_HEADER,
        protocol.REQUEST_PACKET_TYPE.CAN_DO,
        new Buffer([0x00, 0x00, 0x00, 0x05]),
        new Buffer('queue'),
      ]);

      isCalledSync = true;
    };

    server.canDo(new Buffer('queue'));

    assert.ok(isCalledSync);
  });

  it('grab', function() {
    var isCalledSync = false;

    var server = new Server('127.0.0.1', 4730);
    server.writeToSocket = function(buffs) {
      assert.deepEqual(buffs, [
        protocol.REQUEST_HEADER,
        protocol.REQUEST_PACKET_TYPE.GRAB,
        new Buffer([0x00, 0x00, 0x00, 0x00]),
      ]);

      isCalledSync = true;
    };

    server.grab();

    assert.ok(isCalledSync);
  });

  it('preSleep', function() {
    var isCalledSync = false;

    var server = new Server('127.0.0.1', 4730);
    server.writeToSocket = function(buffs) {
      assert.deepEqual(buffs, [
        protocol.REQUEST_HEADER,
        protocol.REQUEST_PACKET_TYPE.PRE_SLEEP,
        new Buffer([0x00, 0x00, 0x00, 0x00]),
      ]);

      isCalledSync = true;
    };

    server.preSleep();

    assert.ok(isCalledSync);
  });

  it('workStatus', function() {
    var isCalledSync = false;

    var server = new Server('127.0.0.1', 4730);
    server.writeToSocket = function(buffs) {
      assert.deepEqual(buffs, [
        protocol.REQUEST_HEADER,
        protocol.REQUEST_PACKET_TYPE.WORK_STATUS,
        new Buffer([0x00, 0x00, 0x00, 0x0a]),
        new Buffer([0x68, 0x61, 0x6e, 0x64, 0x6c, 0x65]),
        new Buffer([0x00]),
        new Buffer([0x0c]),
        new Buffer([0x00]),
        new Buffer([0x0f]),
      ]);

      isCalledSync = true;
    };

    server.workStatus(new Buffer('handle'), new Buffer([0x0c]), new Buffer([0x0f]));

    assert.ok(isCalledSync);
  });

  it('workComplete', function() {
    var isCalledSync = false;

    var server = new Server('127.0.0.1', 4730);
    server.writeToSocket = function(buffs) {
      assert.deepEqual(buffs, [
        protocol.REQUEST_HEADER,
        protocol.REQUEST_PACKET_TYPE.WORK_COMPLETE,
        new Buffer([0x00, 0x00, 0x00, 0x0f]),
        new Buffer('handle'),
        new Buffer([0x00]),
        new Buffer('response'),
      ]);

      isCalledSync = true;
    };

    server.workComplete(new Buffer('handle'), new Buffer('response'));

    assert.ok(isCalledSync);
  });

  it('workFail', function() {
    var isCalledSync = false;

    var server = new Server('127.0.0.1', 4730);
    server.writeToSocket = function(buffs) {
      assert.deepEqual(buffs, [
        protocol.REQUEST_HEADER,
        protocol.REQUEST_PACKET_TYPE.WORK_FAIL,
        new Buffer([0x00, 0x00, 0x00, 0x06]),
        new Buffer('handle'),
      ]);

      isCalledSync = true;
    };

    server.workFail(new Buffer('handle'));

    assert.ok(isCalledSync);
  });

  it('workException', function() {
    var isCalledSync = false;

    var server = new Server('127.0.0.1', 4730);
    server.writeToSocket = function(buffs) {
      assert.deepEqual(buffs, [
        protocol.REQUEST_HEADER,
        protocol.REQUEST_PACKET_TYPE.WORK_EXCEPTION,
        new Buffer([0x00, 0x00, 0x00, 0x0f]),
        new Buffer('handle'),
        new Buffer([0x00]),
        new Buffer('response'),
      ]);

      isCalledSync = true;
    };

    server.workException(new Buffer('handle'), new Buffer('response'));

    assert.ok(isCalledSync);
  });

  it('workData', function() {
    var isCalledSync = false;

    var server = new Server('127.0.0.1', 4730);
    server.writeToSocket = function(buffs) {
      assert.deepEqual(buffs, [
        protocol.REQUEST_HEADER,
        protocol.REQUEST_PACKET_TYPE.WORK_DATA,
        new Buffer([0x00, 0x00, 0x00, 0x0f]),
        new Buffer('handle'),
        new Buffer([0x00]),
        new Buffer('response'),
      ]);

      isCalledSync = true;
    };

    server.workData(new Buffer('handle'), new Buffer('response'));

    assert.ok(isCalledSync);
  });

  it('workWarning', function() {
    var isCalledSync = false;

    var server = new Server('127.0.0.1', 4730);
    server.writeToSocket = function(buffs) {
      assert.deepEqual(buffs, [
        protocol.REQUEST_HEADER,
        protocol.REQUEST_PACKET_TYPE.WORK_WARNING,
        new Buffer([0x00, 0x00, 0x00, 0x0f]),
        new Buffer('handle'),
        new Buffer([0x00]),
        new Buffer('response'),
      ]);

      isCalledSync = true;
    };

    server.workWarning(new Buffer('handle'), new Buffer('response'));

    assert.ok(isCalledSync);
  });

  it('echo', function() {
    var isCalledSync = false;

    var server = new Server('127.0.0.1', 4730);
    server.writeToSocket = function(buffs) {
      assert.deepEqual(buffs, [
        protocol.REQUEST_HEADER,
        protocol.REQUEST_PACKET_TYPE.ECHO,
        new Buffer([0x00, 0x00, 0x00, 0x09]),
        new Buffer('data echo'),
      ]);

      isCalledSync = true;
    };

    server.echo(new Buffer('data echo'));

    assert.ok(isCalledSync);
  });
});