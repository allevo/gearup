'use strict'

var BaseConnector = require('./BaseConnector')
var inherits = require('util').inherits

var utils = require('./utils')
var getBuffer = utils.getBuffer
var Job = require('./Job')

function Worker (server) {
  BaseConnector.call(this, server)

  this.server.worker = this
  this.server.once('socket-error', function (e) {
    this.emit('error', e)
  }.bind(this))
  this.server.once('socket-close', function (hadError) {
    if (this.server) this.server.worker = null
    this.emit('close', hadError)
  }.bind(this))
  this.server.once('socket-timeout', function () {
    this.emit('timeout')
  }.bind(this))

  this.isClosing = false
  this.servingJobs = {}

  this.functions = {}
}
inherits(Worker, BaseConnector)
Worker.OPTION_REQUEST = BaseConnector.OPTION_REQUEST

Worker.prototype.canDo = function (queue, callback) {
  utils.logger.info('canDo', queue)

  this.functions[queue] = callback

  try {
    this.server.canDo(getBuffer(queue))
  } catch (e) {
    this.emit('error', e)
  }
}

Worker.prototype.grab = function () {
  if (this.isClosing) return this.emit('error', new Error('Worker is closing'))

  utils.logger.debug('grab')

  try {
    this.server.grab()
  } catch (e) {
    this.emit('error', e)
  }
}

Worker.prototype.setClientId = function (id) {
  utils.logger.info('setClientId', id)
  try {
    this.server.setClientId(getBuffer(id + ''))
  } catch (e) {
    this.emit('error', e)
  }
}

Worker.prototype.handleJobAssign = function (content) {
  utils.logger.info('handleJobAssign')

  var jobHandleEndIndex = -1
  var queueEndIndex = -1
  for (var i = 0; i < content.length; i++) {
    if (content[i] !== 0) continue
    if (jobHandleEndIndex === -1) jobHandleEndIndex = i
    else if (queueEndIndex === -1) queueEndIndex = i
  }

  var jobHandleBuffer = content.slice(0, jobHandleEndIndex)
  var queueBuffer = content.slice(jobHandleEndIndex + 1, queueEndIndex)
  var workloadBuffer = content.slice(queueEndIndex + 1)

  var jobHandle = jobHandleBuffer.toString('ascii')
  var queue = queueBuffer.toString('ascii')

  var callback = this.functions[queue]
  if (!callback) return this.emit('unknown-queue', queue)

  var job = Job.create(queue, workloadBuffer)
  job.jobHandle = jobHandle
  job.server = this.server

  this.servingJobs[job.jobHandle] = job
  var self = this
  job.on('ended', function () {
    delete self.servingJobs[this.jobHandle]
  })

  callback(job)
}

Worker.prototype.handleNoJob = function () {
  utils.logger.info('handleNoJob')
  this.preSleep()
}

Worker.prototype.handleNoOp = function () {
  utils.logger.info('handleNoOp')
  this.grab()
}

Worker.prototype.preSleep = function () {
  utils.logger.info('preSleep')
  try {
    this.server.preSleep()
  } catch (e) {
    this.emit('error', e)
  }
}

Worker.prototype.close = function (callback) {
  callback = callback || function () {}
  this.isClosing = true

  var keys = Object.keys(this.servingJobs)
  if (keys.length === 0) {
    this.disconnect()
    return callback()
  }
  var n = keys.length
  var self = this
  for (var i in keys) {
    var job = this.servingJobs[keys[i]]
    job.on('ended', function () {
      n--
      if (n !== 0) return
      self.disconnect()
      callback()
    })
  }
}

module.exports = Worker
