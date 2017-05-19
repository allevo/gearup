/* eslint-disable no-console */

'use stict'

var Server = require('./Server')
var Client = require('./Client')
var Job = require('./Job')

var client = new Client(new Server('127.0.0.1', 4730))

function submitJob (i) {
  var job = Job.create('reverse', 'data' + i)
  // job.isBackground = true;
  // job.priority = 'low';

  job.on('submitted', function () {
    console.log('submitted', job.jobHandle)
  })
  job.on('status', function (status) {
    console.log('status', job.jobHandle, status)
  })
  job.on('fail', function () {
    console.log('fail', job.jobHandle)
  })
  job.on('exception', function (response) {
    console.log('exception', job.jobHandle, response)
  })
  job.on('data', function (response) {
    console.log('data', job.jobHandle, response)
  })
  job.on('warning', function (response) {
    console.log('warning', job.jobHandle, response)
  })
  job.on('complete', function (response) {
    console.log('complete', job.jobHandle, response.toString('ascii'))
  })
  job.on('error', function (e) {
    console.log('JOB ERROR HANDLER', e)
  })

  client.submitJob(job)
}

client.on('error', function (error) {
  console.log('socket-error', error)
})
client.on('close', function (hadError) {
  console.log('close', hadError)
  process.exit(1)
})
client.on('timeout', function () {
  console.log('timeout')
})

client.connect(function () {
  submitJob(1)
})
