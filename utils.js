'use strict';

/* istanbul ignore next */
function setLogger(logger) {
  module.exports.logger = logger;
}

var BASE = 16 * 16;
var LOG_BASE = Math.log(BASE);
var POW_3_BASE = Math.pow(BASE, 3);
var POW_2_BASE = Math.pow(BASE, 2);
var POW_1_BASE = Math.pow(BASE, 1);

var NullCharBuffer = new Buffer([0x00]);

function getBuffer(str, options) {
  if (Buffer.isBuffer(str)) return str;

  str = options && options.addNullInTheEnd ? str + '\0' : str;
  var buff = new Buffer(str, 'utf8');
  return buff;
}

function getBufferForTheLength(number, len) {
  if (!len) len = Math.ceil(Math.log(number) / LOG_BASE);
  // -Infinity
  if (len < 0) len = 0;

  var buff = new Buffer(len);
  while(len--) {
    buff[len] = number % BASE;
    number = Math.floor(number / BASE);
  }
  if (number > BASE) throw new Error('Body to large!');

  return buff;
}

function getContentLengthFromBuffer(contentLengthBuffer) {
  return contentLengthBuffer[0] * POW_3_BASE + contentLengthBuffer[1] * POW_2_BASE + contentLengthBuffer[2] * POW_1_BASE + contentLengthBuffer[3];
}

var nullFunction = function() {};
module.exports = {
  logger: {
    debug: nullFunction,
    info: nullFunction,
    error: nullFunction,
  },
  setLogger: setLogger,
  NullCharBuffer: NullCharBuffer,
  getBuffer: getBuffer,
  getBufferForTheLength: getBufferForTheLength,
  getContentLengthFromBuffer: getContentLengthFromBuffer,
};
