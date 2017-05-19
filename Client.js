'use strict'

var BaseConnector = require('./BaseConnector')
var inherits = require('util').inherits

var utils = require('./utils')
var getBuffer = utils.getBuffer

function Client (server) {
  BaseConnector.call(this, server)
  this.server.client = this
  this.isClosing = false

  var self = this
  this.once('close', function () {
    var error = new Error('Socket closed before ending the request')
    var i
    for (i = 0; i < self.jobsWaitingForTheCreation.length; i++) {
      self.jobsWaitingForTheCreation[i].emit('error', error)
    }
    for (i in self.jobsWaitingForTheCompletion) {
      self.jobsWaitingForTheCompletion[i].emit('error', error)
    }
    if (self.server) self.server.client = null
  })

  this.server.once('socket-error', function (e) {
    this.emit('error', e)
  }.bind(this))
  this.server.once('socket-close', function (hadError) {
    if (this.server) this.server.client = null
    this.emit('close', hadError)
  }.bind(this))
  this.server.once('socket-timeout', function () {
    this.emit('timeout')
  }.bind(this))

  this.isWaitingForACreation = false
  this.jobsWaitingForTheCreation = []

  this.jobsWaitingForTheCompletion = {}
}
inherits(Client, BaseConnector)
Client.OPTION_REQUEST = BaseConnector.OPTION_REQUEST

var submitJobMap = {
  low: {
    true: 'submitlJobLowBackground',
    false: 'submitlJobLow'
  },
  high: {
    true: 'submitlJobHighBackground',
    false: 'submitlJobHigh'
  },
  normal: {
    true: 'submitlJobNormalBackground',
    false: 'submitlJobNormal'
  }
}

Client.prototype.__submitNextJob = function () {
  if (this.isWaitingForACreation) return
  if (this.jobsWaitingForTheCreation.length === 0) return

  var job = this.jobsWaitingForTheCreation[0]

  this.isWaitingForACreation = true

  var queueBuffer = getBuffer(job.queue)
  var dataBuffer = getBuffer(job.workload)

  var identifierBuffer = getBuffer(job.identifier || '')

  var priority = job.priority || 'normal'
  var isBackground = job.isBackground || false

  try {
    this.server[submitJobMap[priority][isBackground]](queueBuffer, dataBuffer, identifierBuffer)
  } catch (e) {
    utils.logger.error(e)
    job.emit('error', e)
    this.emit('error', e)
  }
}

Client.prototype.submitJob = function (job) {
  if (this.isClosing) return job.emit('error', new Error('Client is closing'))

  utils.logger.info('submit job', job)

  this.jobsWaitingForTheCreation.push(job)
  this.__submitNextJob()
}

Client.prototype.handleResponseJobCreated = function (jobHandleBuffer) {
  utils.logger.info('handleResponseJobCreated')

  var job = this.jobsWaitingForTheCreation.shift()
  if (!job) return this.emit('error', new Error('Unknwon job'))

  job.jobHandle = jobHandleBuffer.toString('ascii')

  this.isWaitingForACreation = false

  if (!job.isBackground) this.jobsWaitingForTheCompletion[job.jobHandle] = job

  job.emit('submitted')
  this.__submitNextJob()
}

Client.prototype.handleWorkComplete = function (content) {
  utils.logger.info('handleWorkComplete')

  var jobHandleBuffer = this.__emitEventWithWorkload('complete', content)
  if (!jobHandleBuffer) return
  delete this.jobsWaitingForTheCompletion[jobHandleBuffer.toString('ascii')]
}

Client.prototype.handleWorkFail = function (jobHandleBuffer) {
  utils.logger.info('handleWorkFail')

  var job = this.jobsWaitingForTheCompletion[jobHandleBuffer.toString('ascii')]
  if (!job) return this.emit('error', new Error('Unknwon job for handle ' + jobHandleBuffer.toString('ascii')))

  job.emit('fail')

  delete this.jobsWaitingForTheCompletion[jobHandleBuffer.toString('ascii')]
}

function getIntFromBuffer (buff) {
  var length = buff.length
  var num = 0
  while (length--) num += Math.pow(16, length) * buff.readUInt8(buff.length - length - 1)
  return num
}

Client.prototype.handleWorkStatus = function (content) {
  utils.logger.info('handleWorkStatus')

  var indexes = BaseConnector.findNullBufferIndexes(content, 2)
  var jobHandleEndIndex = indexes[0]
  var numeratorEndIndex = indexes[1]

  var jobHandleBuffer = content.slice(0, jobHandleEndIndex)
  var numeratorBuffer = content.slice(jobHandleEndIndex + 1, numeratorEndIndex)
  var denominatorBuffer = content.slice(numeratorEndIndex + 1)

  var job = this.jobsWaitingForTheCompletion[jobHandleBuffer.toString('ascii')]
  if (!job) return this.emit('error', new Error('Unknwon job for handle ' + jobHandleBuffer.toString('ascii')))

  job.emit('status', {
    numerator: getIntFromBuffer(numeratorBuffer),
    denominator: getIntFromBuffer(denominatorBuffer)
  })
}

Client.prototype.handleWorkException = function (content) {
  utils.logger.info('handleWorkException')
  this.__emitEventWithWorkload('exception', content)
}

Client.prototype.handleWorkData = function (content) {
  utils.logger.info('handleWorkData')
  this.__emitEventWithWorkload('data', content)
}

Client.prototype.handleWorkWarning = function (content) {
  utils.logger.info('handleWorkWarning')
  this.__emitEventWithWorkload('warning', content)
}

Client.prototype.__emitEventWithWorkload = function (eventName, content) {
  var indexes = BaseConnector.findNullBufferIndexes(content, 1)

  var jobHandleBuffer = content.slice(0, indexes[0])
  var workloadBuffer = content.slice(indexes[0] + 1)

  var job = this.jobsWaitingForTheCompletion[jobHandleBuffer.toString('ascii')]
  if (!job) {
    this.emit('error', new Error('Unknwon job for handle ' + jobHandleBuffer.toString('ascii')))
    return
  }

  job.emit(eventName, workloadBuffer)

  return jobHandleBuffer
}

Client.prototype.close = function (callback) {
  callback = callback || function () { }
  this.isClosing = true
  var self = this
  var n = this.jobsWaitingForTheCreation.length
  for (var i = 0; i < n; i++) {
    this.jobsWaitingForTheCreation[i].on('submitted', function () {
      n--
      if (n === 0) {
        callback()
        self.disconnect()
      }
    })
  }
}

module.exports = Client
