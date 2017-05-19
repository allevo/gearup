'use strict'

var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits

var getBuffer = require('./utils').getBuffer
var getBufferForTheLength = require('./utils').getBufferForTheLength

function Job (queue, workload) {
  EventEmitter.apply(this)

  this.queue = queue
  this.workload = workload

  this.jobHandle = undefined

  this.server = undefined
}
inherits(Job, EventEmitter)

Job.prototype.success = function (response) {
  try {
    this.server.workComplete(getBuffer(this.jobHandle), new Buffer(response, 'utf8'))
  } catch (e) {
    return this.emit('error', e)
  }
  this.emit('ended')
}
Job.prototype.fail = function () {
  try {
    this.server.workFail(getBuffer(this.jobHandle))
  } catch (e) {
    return this.emit('error', e)
  }
  this.emit('ended')
}
Job.prototype.exception = function (response) {
  try {
    this.server.workException(getBuffer(this.jobHandle), new Buffer(response, 'utf8'))
  } catch (e) {
    this.emit('error', e)
  }
}
Job.prototype.data = function (response) {
  try {
    this.server.workData(getBuffer(this.jobHandle), new Buffer(response, 'utf8'))
  } catch (e) {
    this.emit('error', e)
  }
}
Job.prototype.warning = function (response) {
  try {
    this.server.workWarning(getBuffer(this.jobHandle), new Buffer(response, 'utf8'))
  } catch (e) {
    this.emit('error', e)
  }
}

Job.prototype.status = function (numerator, denominator) {
  try {
    this.server.workStatus(
      getBuffer(this.jobHandle),
      getBufferForTheLength(numerator),
      getBufferForTheLength(denominator)
    )
  } catch (e) {
    this.emit('error', e)
  }
}

Job.create = function (queue, workload) {
  return new Job(queue, workload)
}

module.exports = Job
