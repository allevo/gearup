'use strict';

function log() {
  console.log.apply(console, arguments);
}

var BASE = 16 * 16;
var NullCharBuffer = new Buffer([0x00]);

function getBuffer(str, options) {
	if (Buffer.isBuffer(str)) return str;
	
	str = options && options.addNullInTheEnd ? str + '\0' : str;
  var buff = new Buffer(str, 'utf8');
  return buff;
}

function getBufferForTheLength(number, len) {
  if (!len) len = Math.ceil(Math.log(number) / Math.log(BASE));
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
  return contentLengthBuffer[0] * Math.pow(BASE, 3) + contentLengthBuffer[1] * Math.pow(BASE, 2) + contentLengthBuffer[2] * Math.pow(BASE, 1) + contentLengthBuffer[3];
}

module.exports = {
	log: log,
  NullCharBuffer: NullCharBuffer,
  getBuffer: getBuffer,
  getBufferForTheLength: getBufferForTheLength,
  getContentLengthFromBuffer: getContentLengthFromBuffer,
};
