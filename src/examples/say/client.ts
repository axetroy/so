const Socket = require('ws');

const ws = new Socket('ws://localhost:8090');

ws.on('open', function open() {
  console.log('socket open');
  ws.send(
    JSON.stringify({
      id: Math.random(),
      timestamp: parseInt(new Date().getTime() + ''),
      action: 'say.hi',
      payload: 'axetroy'
    })
  );
});

ws.on('message', function incoming(data) {
  console.log(data);
});
