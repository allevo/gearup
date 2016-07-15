'use strict';

var assert = require('assert');
var randomstring = require('randomstring');

var Server = require('../Server');
var Client = require('../Client');
var Worker = require('../Worker');
var Job = require('../Job');


function getRandomQueueName() {
  return randomstring.generate();
}

describe('behaviour', function() {
  it('submit job', function(done) {
    var s = new Server('127.0.0.1', 4730);

    s.on('connect', function() {
      var c = new Client(s);

      var job = Job.create('queueName', 'data');

      job.on('submitted', function() {
        assert.ok(job.jobHandle);

        s.disconnect(done);
      });
      c.submitJob(job);
    });
    s.connect();
  });

  it('submit job background', function(done) {
    var s = new Server('127.0.0.1', 4730);

    s.on('connect', function() {
      var c = new Client(s);

      var job = Job.create('queueName', 'data');
      job.isBackground = true;

      job.on('submitted', function() {
        assert.ok(job.jobHandle);

        s.disconnect(done);
      });
      c.submitJob(job);
    });
    s.connect();
  });

  it('submit job low', function(done) {
    var s = new Server('127.0.0.1', 4730);

    s.on('connect', function() {
      var c = new Client(s);

      var job = Job.create('queueName', 'data');
      job.priority = 'low';

      job.on('submitted', function() {
        assert.ok(job.jobHandle);

        s.disconnect(done);
      });
      c.submitJob(job);
    });
    s.connect();
  });

  it('submit job low background', function(done) {
    var s = new Server('127.0.0.1', 4730);

    s.on('connect', function() {
      var c = new Client(s);

      var job = Job.create('queueName', 'data');
      job.isBackground = true;
      job.priority = 'low';

      job.on('submitted', function() {
        assert.ok(job.jobHandle);

        s.disconnect(done);
      });
      c.submitJob(job);
    });
    s.connect();
  });

  it('submit job high', function(done) {
    var s = new Server('127.0.0.1', 4730);

    s.on('connect', function() {
      var c = new Client(s);

      var job = Job.create('queueName', 'data');
      job.priority = 'high';

      job.on('submitted', function() {
        assert.ok(job.jobHandle);

        s.disconnect(done);
      });
      c.submitJob(job);
    });
    s.connect();
  });

  it('submit job high background', function(done) {
    var s = new Server('127.0.0.1', 4730);

    s.on('connect', function() {
      var c = new Client(s);

      var job = Job.create('queueName', 'data');
      job.isBackground = true;
      job.priority = 'high';

      job.on('submitted', function() {
        assert.ok(job.jobHandle);

        s.disconnect(done);
      });
      c.submitJob(job);
    });
    s.connect();
  });

  it('submit job high background', function(done) {
    var s = new Server('127.0.0.1', 4730);

    s.on('connect', function() {
      var c = new Client(s);

      var job = Job.create('queueName', 'data');
      job.isBackground = true;
      job.priority = 'high';

      job.on('submitted', function() {
        assert.ok(job.jobHandle);

        s.disconnect(done);
      });
      c.submitJob(job);
    });
    s.connect();
  });

  it('complete flow ok', function(done) {
    var queueName = getRandomQueueName();

    var ws = new Server('127.0.0.1', 4730);
    var w = new Worker(ws);
    var cs = new Server('127.0.0.1', 4730);
    var c = new Client(cs);

    var job = Job.create(queueName, 'data');

    var hasStatus = false;
    var hasData = false;
    var hasWarning = false;
    var hasSubmitted = false;

    job.on('submitted', function() {
      assert.ok(job.jobHandle);
      hasSubmitted = true;
    });
    job.on('data', function(response) {
      assert.ok(Buffer.isBuffer(response));
      assert.equal('my data', response.toString('ascii'));
      hasData = true;
    });
    job.on('warning', function(response) {
      assert.ok(Buffer.isBuffer(response));
      assert.equal('warning data', response.toString('ascii'));
      hasWarning = true;
    });
    job.on('status', function(status) {
      assert.deepEqual(status, {
        numerator: 12,
        denominator: 15,
      });
      hasStatus = true;
    });
    job.on('complete', function(response) {
      assert.ok(Buffer.isBuffer(response));
      assert.equal('success', response.toString('ascii'));
      assert.ok(hasStatus);
      assert.ok(hasData);
      assert.ok(hasWarning);
      assert.ok(hasSubmitted);
      ws.disconnect(done);
    });

    ws.on('connect', function() {
      w.canDo(queueName, function(job) {
        assert.equal('data', job.workload.toString('ascii'));

        setTimeout(function() {
          job.status(12, 15);
        }, 20);
        setTimeout(function() {
          job.data('my data');
        }, 100);
        setTimeout(function() {
          job.warning('warning data');
        }, 200);
        setTimeout(function() {
          job.success('success');
        }, 300);
      });
      w.grab();

      cs.on('connect', function() {
        c.submitJob(job);
      });
      cs.connect();
    });
    ws.connect();
  });

  it('complete flow fail', function(done) {
    var queueName = getRandomQueueName();

    var ws = new Server('127.0.0.1', 4730);
    var w = new Worker(ws);
    var cs = new Server('127.0.0.1', 4730);
    var c = new Client(cs);

    var job = Job.create(queueName, 'data');

    var hasStatus = false;
    var hasData = false;
    var hasWarning = false;
    var hasSubmitted = false;

    job.on('submitted', function() {
      assert.ok(job.jobHandle);
      hasSubmitted = true;
    });
    job.on('data', function(response) {
      assert.ok(Buffer.isBuffer(response));
      assert.equal('my data', response.toString('ascii'));
      hasData = true;
    });
    job.on('warning', function(response) {
      assert.ok(Buffer.isBuffer(response));
      assert.equal('warning data', response.toString('ascii'));
      hasWarning = true;
    });
    job.on('status', function(status) {
      assert.deepEqual(status, {
        numerator: 12,
        denominator: 15,
      });
      hasStatus = true;
    });
    job.on('fail', function() {
      assert.ok(hasStatus);
      assert.ok(hasData);
      assert.ok(hasWarning);
      assert.ok(hasSubmitted);
      ws.disconnect(done);
    });

    ws.on('connect', function() {
      w.canDo(queueName, function(job) {
        assert.equal('data', job.workload.toString('ascii'));

        setTimeout(function() {
          job.status(12, 15);
        }, 20);
        setTimeout(function() {
          job.data('my data');
        }, 100);
        setTimeout(function() {
          job.warning('warning data');
        }, 200);
        setTimeout(function() {
          job.fail();
        }, 300);
      });
      w.grab();

      cs.on('connect', function() {
        c.submitJob(job);
      });
      cs.connect();
    });
    ws.connect();
  });

  it('complete flow exception', function(done) {
    var queueName = getRandomQueueName();

    var ws = new Server('127.0.0.1', 4730);
    var w = new Worker(ws);
    var cs = new Server('127.0.0.1', 4730);
    var c = new Client(cs);

    var job = Job.create(queueName, 'data');

    var hasStatus = false;
    var hasData = false;
    var hasWarning = false;
    var hasSubmitted = false;

    job.on('submitted', function() {
      assert.ok(job.jobHandle);
      hasSubmitted = true;
    });
    job.on('data', function(response) {
      assert.ok(Buffer.isBuffer(response));
      assert.equal('my data', response.toString('ascii'));
      hasData = true;
    });
    job.on('warning', function(response) {
      assert.ok(Buffer.isBuffer(response));
      assert.equal('warning data', response.toString('ascii'));
      hasWarning = true;
    });
    job.on('status', function(status) {
      assert.deepEqual(status, {
        numerator: 12,
        denominator: 15,
      });
      hasStatus = true;
    });
    job.on('exception', function(response) {
      assert.ok(Buffer.isBuffer(response));
      assert.equal('exception message', response.toString('ascii'));

      assert.ok(hasStatus);
      assert.ok(hasData);
      assert.ok(hasWarning);
      assert.ok(hasSubmitted);
      ws.disconnect(done);
    });

    ws.on('connect', function() {
      w.canDo(queueName, function(job) {
        assert.equal('data', job.workload.toString('ascii'));

        setTimeout(function() {
          job.status(12, 15);
        }, 20);
        setTimeout(function() {
          job.data('my data');
        }, 100);
        setTimeout(function() {
          job.warning('warning data');
        }, 200);
        setTimeout(function() {
          job.exception('exception message');
        }, 300);
      });
      w.grab();

      cs.on('connect', function() {
        cs.optionsRequest(Client.OPTION_REQUEST.EXCEPTION);
        c.submitJob(job);
      });
      cs.connect();
    });
    ws.connect();
  });
});