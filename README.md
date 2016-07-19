# GearmanLib
This library implements the gearman protocol as simple as possible.
The gearman protocol can be found here http://gearman.org/protocol/

## Installation
```
npm install gearup
```

## Example
See `client_example.js` and `worker_example.js`

## References
### Server
This class keeps the TCP connection.

```
var server = new Server('127.0.0.1', 4730);
```

### Client
This class exposes the client interface

```
var client = new Client(server);
client.submitJob(job);
```

### Worker
This class exposes the worker interface
```
var worker = new Worker(server);
worker.canDo('queue-name', function(job) {
});
worker.grab();
```

### Job
The class keeps the data shared between client and worker

Client side:
```
var job = Job.create('queue-name', payload');
job.isBackground = true; // optional
job.priority = 'high'; // optional
```
Worker side:
```
job.data('return-data');
job.status(12, 30);
job.warning('warning-message');
job.fail();
job.exception('exception-message');
```

## Why
I was looking for a library for a production application. No library implements the protocol correctly. Indeed, this does.

If you would make sure your application works correctly, use gearup.

All contributions are welcomed.
