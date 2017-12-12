const Socket = require('ws');

const ws = new Socket('ws://localhost:8091');

ws.on('open', function open() {
  console.log('socket open');
  ws.send(
    JSON.stringify({
      id: Math.random(),
      timestamp: parseInt(new Date().getTime() + ''),
      action: 'user.updateUsername',
      payload: {
        token: 'asdasdasd',
        username: 'no-one'
      }
    })
  );
});

ws.on('message', function incoming(data) {
  console.log(data);
});
