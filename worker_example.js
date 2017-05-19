/* eslint-disable no-console */
'use strict'

var Server = require('./Server')
var Worker = require('./Worker')

var worker = new Worker(new Server('127.0.0.1', 4730))

worker.on('error', function (error) {
  console.log('socket-error', error)
})
worker.on('close', function (hadError) {
  console.log('close', hadError)
  process.exit(1)
})
worker.on('timeout', function () {
  console.log('timeout')
})
worker.connect(function () {
  worker.canDo('reverse', function (job) {
    console.log('handle reverse', job.jobHandle, job.workload)

    setTimeout(function () {
      job.success('pippo')

      worker.grab()
    }, 400)
  })

  worker.grab()
})
