const PORT = 55000;

var server = require('http').createServer();
var io = require('socket.io')(server);

io.on('connection', function(client) {

  client.on('test', function() {
    console.log('test received');
  });

  client.on('newplayer', function() {
    client.player = {
      id: server.lastPlayerID++,
      x: randomInt(100, 400),
      y: randomInt(100, 400),
      direction: ""
    };
    client.emit('allplayers', getAllPlayers());
    client.broadcast.emit('newplayer', client.player);

    client.on('movement', function(data) {
      client.player.x = data.x;
      client.player.y = data.y;
      if (client.player.direction !== data.direction) {
        client.player.direction = data.direction;
        io.emit('move', client.player, data.direction);
      }
    });

    client.on('disconnect', function() {
      io.emit('remove', client.player.id);
      console.log('disconnecting: ' + client.player.id);
    });
  });

});

server.listen(PORT, function() {
  console.log('Listening on ' + server.address().port);
});

server.lastPlayerID = 0;

function getAllPlayers() {
  var players = [];
  Object.keys(io.sockets.connected).forEach(function(socketID) {
    var player = io.sockets.connected[socketID].player;
    if (player) players.push(player);
  });
  return players;
}

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}
