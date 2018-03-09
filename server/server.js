//Global Vaiables
const PORT = 55000;
var server = require('http').createServer();
var io = require('socket.io')(server);
var tilemapper = require('./utils/tilemap-array-generator.js');

var entities = {};


main();

function main() {
  io.on('connection', function(client) {

    client.on('test', function() {
      console.log('test received');
    });

    var tilemap = tilemapper.create2dArrayFromTilemap(0); // number refers to which map to use
    console.log(JSON.stringify(tilemap)); //using stringify to print to console in easy to read format, won't need to do this to use the tilemap.

    client.on('newplayer', function() {
      createEntity("players", server.lastPlayerID++, randomInt(100, 400), randomInt(100, 400));

      client.emit('allplayers', getAllPlayers());
      client.broadcast.emit('newplayer', entities.players[server.lastPlayerID]);

      client.on('movement', function(data) {
        /*client.player.x = data.x;
        client.player.y = data.y;
        if (client.player.direction !== data.direction) {
          client.player.direction = data.direction;
          io.emit('move', client.player, data.direction);
        }*/
      });

      client.on('disconnect', function() {
        //io.emit('remove', client.player.id);
        //console.log('disconnecting: ' + client.player.id);
      });
    });

  });

  server.listen(PORT, function() {
    console.log('Listening on ' + server.address().port);
  });

  server.lastPlayerID = 0;
}

function createEntity(type, id, x, y) {
  console.log("Creating Entity:" + type);
  entities[type] = {};
  entities[type][id] = {
    id: id,
    x: x,
    y: y
  }
  if (type === "players") {
    entities[type][id]["direction"] = "";
  }
}

function getAllPlayers() {
  var players = [];
  Object.keys(entities.players).forEach(function(id) {
    var player = entities.players[id];
    if (player) players.push(player);
  });
  return players;
}

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}
