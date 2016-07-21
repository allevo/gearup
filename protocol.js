'use strict';

var REQUEST_HEADER = new Buffer([0x00, 0x52, 0x45, 0x51]);

var REQUEST_PACKET_TYPE = {
  SUBMIT_JOB_LOW_BG:    new Buffer([0x00, 0x00, 0x00, 0x22]), // 34
  SUBMIT_JOB_LOW:       new Buffer([0x00, 0x00, 0x00, 0x21]), // 33
  SUBMIT_JOB_HIGH_BG:   new Buffer([0x00, 0x00, 0x00, 0x20]), // 30
  SUBMIT_JOB_HIGH:      new Buffer([0x00, 0x00, 0x00, 0x15]), // 21
  SUBMIT_JOB:           new Buffer([0x00, 0x00, 0x00, 0x07]), // 7
  SUBMIT_JOB_BG:        new Buffer([0x00, 0x00, 0x00, 0x12]), // 18
  CAN_DO:               new Buffer([0x00, 0x00, 0x00, 0x01]), // 1
  GRAB:                 new Buffer([0x00, 0x00, 0x00, 0x09]), // 9
  WORK_COMPLETE:        new Buffer([0x00, 0x00, 0x00, 0x0d]), // 13
  PRE_SLEEP:            new Buffer([0x00, 0x00, 0x00, 0x04]), // 4
  NOOP:                 new Buffer([0x00, 0x00, 0x00, 0x06]), // 6
  WORK_STATUS:          new Buffer([0x00, 0x00, 0x00, 0x0c]), // 12
  WORK_FAIL:            new Buffer([0x00, 0x00, 0x00, 0x0e]), // 14
  ECHO:                 new Buffer([0x00, 0x00, 0x00, 0x10]), // 16
  SET_CLIENT_ID:        new Buffer([0x00, 0x00, 0x00, 0x16]), // 22
  WORK_EXCEPTION:       new Buffer([0x00, 0x00, 0x00, 0x19]), // 25
  OPTION_REQ:           new Buffer([0x00, 0x00, 0x00, 0x1a]), // 26
  WORK_DATA:            new Buffer([0x00, 0x00, 0x00, 0x1c]), // 28
  WORK_WARNING:         new Buffer([0x00, 0x00, 0x00, 0x1d]), // 29
};
Object.freeze(REQUEST_PACKET_TYPE);

var RESPONSE_PACKET_TYPE = {
  '00000008': 'JOB_CREATED',
  '0000000b': 'JOB_ASSIGN',
  '0000000a': 'NO_JOB',
  '00000006': 'NOOP',
  '0000000d': 'WORK_COMPLETE',
  '0000000c': 'WORK_STATUS',
  '0000000e': 'WORK_FAIL',
  '00000019': 'WORK_EXCEPTION',
  '00000011': 'ECHO',
  '0000001b': 'OPTION_RES',
  '0000001c': 'WORK_DATA',
  '0000001d': 'WORK_WARNING',
};
Object.freeze(RESPONSE_PACKET_TYPE);

module.exports = {
  REQUEST_HEADER: REQUEST_HEADER,
  RESPONSE_HEADER_UTF8: '\0RES',
  REQUEST_PACKET_TYPE: REQUEST_PACKET_TYPE,
  RESPONSE_PACKET_TYPE: RESPONSE_PACKET_TYPE,
  MINIMUN_PACKET_LENGTH: 4 + 4 + 4,
};
