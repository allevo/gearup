'use strict';

var assert = require('assert');
var randomstring = require('randomstring');

var Server = require('../Server');
var Client = require('../Client');
var Worker = require('../Worker');
var Job = require('../Job');

function createServer() {
  return new Server(process.env.GEARMAN_HOST, parseInt(process.env.GEARMAN_PORT, 10));
}

function getRandomQueueName() {
  return randomstring.generate();
}

describe('behaviour', function() {
  describe('client', function() {
    it('submit job', function(done) {
      var s = createServer(); // new Server('127.0.0.1', 4730);

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
      var s = createServer(); // new Server('127.0.0.1', 4730);

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
      var s = createServer(); // new Server('127.0.0.1', 4730);

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
      var s = createServer(); // new Server('127.0.0.1', 4730);

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
      var s = createServer(); // new Server('127.0.0.1', 4730);

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
      var s = createServer(); // new Server('127.0.0.1', 4730);

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
      var s = createServer(); // new Server('127.0.0.1', 4730);

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

    it('socket hung up on submitting job', function(done) {
      var server = require('net').createServer(function(c) {
        c.on('data', function() {
          c.destroy();
        });
      });
      var isJobGoneInError = false;
      server.listen(4731, function() {
        var s = new Server('127.0.0.1', 4731);

        s.on('connect', function() {
          var c = new Client(s);

          c.on('close', function(hadError) {
            assert.ok(!hadError);
            assert.ok(isJobGoneInError);
            s.disconnect(done);
          });

          var job = Job.create('queueName', 'data');
          job.on('error', function(e) {
            isJobGoneInError = true;
            assert.ok(e instanceof Error);
            assert.ok(e.message, 'Socket closed before ending the request');
          })

          c.submitJob(job);
        });
        s.connect();
      });
    });

    it('socket hung up on waiting a job result', function(done) {
      var server = require('net').createServer(function(c) {
        c.on('data', function() {
          // Return JOB_CREATED with "pippo" handle
          c.write('\0RES\0\0\0\u0008\0\0\0\u0005pippo');

          setTimeout(function() {
            c.destroy();
          }, 10);
        });
      });
      var isJobGoneInError = false;
      var isJobSubmitted = false;
      server.listen(4732, function() {
        var s = new Server('127.0.0.1', 4732);

        s.on('connect', function() {
          var c = new Client(s);

          c.on('close', function(hadError) {
            assert.ok(!hadError);
            assert.ok(isJobGoneInError);
            assert.ok(isJobSubmitted);
            s.disconnect(done);
          });

          var job = Job.create('queueName', 'data');
          job.on('submitted', function() {
            isJobSubmitted = true;
          });
          job.on('error', function(e) {
            isJobGoneInError = true;
            assert.ok(e instanceof Error);
            assert.ok(e.message, 'Socket closed before ending the request');
          });

          c.submitJob(job);
        });
        s.connect();
      });
    });
  });

  describe('worker', function() {
    before(function(done) {
      this.queueName = getRandomQueueName();

      var cs = createServer(); // new Server('192.168.99.100', 32768);
      var c = new Client(cs);

      cs.on('connect', function() {
        var n = 0;
        function submittedCallback() {
          n++;
          if (n >= 10) {
            return done();
          }
        }

        for(var i = 0; i < 10; i++) {
          var job = Job.create(this.queueName, 'data' + i);
          job.isBackground = true;
          job.on('submitted', submittedCallback);
          c.submitJob(job);
        }
      }.bind(this));
      cs.connect();
    });

    it('requeue', function(done) {
      var queueName = getRandomQueueName();

      var ws = createServer(); // new Server('192.168.99.100', 32768);
      var w = new Worker(ws);

      var cs = createServer(); // new Server('192.168.99.100', 32768);
      var c = new Client(cs);

      cs.on('connect', function() {
        ws.on('connect', function() {
          var n = 0;
          var rn = 0;
          w.canDo(this.queueName, function(job) {
            setTimeout(function() {
              assert.equal(job.workload.toString('ascii'), 'data' + n);
              n++;

              var j = Job.create(queueName, 'received:' + job.workload.toString('ascii'));
              j.isBackground = true;
              c.submitJob(j);

              job.success('');

              if (n <= 10) w.grab();
            }, 10);
          });

          w.canDo(queueName, function(job) {
            rn++;

            job.success('');

            w.grab();
            if (rn >= 10) done();
          });
          w.grab();
        }.bind(this));
        ws.connect();
      }.bind(this));
      cs.connect();
    });
  });

  describe('both', function() {
    it('complete flow ok', function(done) {
      var queueName = getRandomQueueName();

      var ws = createServer(); // new Server('127.0.0.1', 4730);
      var w = new Worker(ws);
      var cs = createServer(); // new Server('127.0.0.1', 4730);
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

      var ws = createServer(); // new Server('127.0.0.1', 4730);
      var w = new Worker(ws);
      var cs = createServer(); // new Server('127.0.0.1', 4730);
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

      var ws = createServer(); // new Server('127.0.0.1', 4730);
      var w = new Worker(ws);
      var cs = createServer(); // new Server('127.0.0.1', 4730);
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

  describe('common', function() {
    it('worker echo', function(done) {
      var ws = createServer();
      var w = new Worker(ws);

      ws.on('connect', function() {
        w.on('echo', function(data) {
          assert.ok(Buffer.isBuffer(data));
          assert.deepEqual(data.toString('ascii'), 'pippo');
          ws.disconnect(done);
        });
        w.echo('pippo');
      });
      ws.connect();
    });

    it('client echo', function(done) {
      var cs = createServer();
      var c = new Client(cs);

      cs.on('connect', function() {
        c.on('echo', function(data) {
          assert.ok(Buffer.isBuffer(data));
          assert.deepEqual(data.toString('ascii'), 'pippo');
          cs.disconnect(done);
        });
        c.echo('pippo');
      });
      cs.connect();
    });

    it('worker options', function(done) {
      var ws = createServer();
      var w = new Worker(ws);

      ws.on('connect', function() {
        w.on('option-response', function(data) {
          assert.ok(Buffer.isBuffer(data));
          assert.equal(data.toString('ascii'), 'exceptions');
          ws.disconnect(done);
        });
        w.optionsRequest('exceptions');
      });
      ws.connect();
    });

    it('client options', function(done) {
      var cs = createServer();
      var c = new Client(cs);

      cs.on('connect', function() {
        c.on('option-response', function(data) {
          assert.ok(Buffer.isBuffer(data));
          assert.equal(data.toString('ascii'), 'exceptions');
          cs.disconnect(done);
        });
        c.optionsRequest('exceptions');
      });
      cs.connect();
    });
  });

  describe('encoding', function() {
    it('check encoding: utf8', function(done) {
      var queueName = getRandomQueueName();

      var ws = createServer(); // new Server('127.0.0.1', 4730);
      var w = new Worker(ws);
      var cs = createServer(); // new Server('127.0.0.1', 4730);
      var c = new Client(cs);

      var data = '激光, 這兩個字是甚麼意思\u05D0\u04A8Ԫ\u0616۞\u07A6\u0A8A\u0BA3☃✓♜  ♞ ♝ ♛ ♚ ♝ ♞ ♜';

      var job = Job.create(queueName, data);

      job.on('complete', function(response) {
        assert.deepEqual(response.toString('utf8'), data);

        ws.disconnect(done);
      });

      ws.on('connect', function() {
        w.canDo(queueName, function(job) {
          assert.deepEqual(job.workload.toString('utf8'), data);

          job.success(data);

        });
        w.grab();

        cs.on('connect', function() {
          c.submitJob(job);
        });
        cs.connect();
      });
      ws.connect();
    });

    it('check encoding: png', function(done) {
      var queueName = getRandomQueueName();

      var ws = new Server('127.0.0.1', 4730);
      var w = new Worker(ws);
      var cs = new Server('127.0.0.1', 4730);
      var c = new Client(cs);

      var data = require('fs').readFileSync(__dirname + '/data/img.png');

      var job = Job.create(queueName, data);

      job.on('complete', function(response) {
        assert.deepEqual(response, data);

        ws.disconnect(done);
      });

      ws.on('connect', function() {
        w.canDo(queueName, function(job) {
          assert.deepEqual(job.workload, data);

          job.success(data);

        });
        w.grab();

        cs.on('connect', function() {
          c.submitJob(job);
        });
        cs.connect();
      });
      ws.connect();
    });
  });
});