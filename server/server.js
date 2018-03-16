//Global Vaiables
require('console.table');
const PORT = 55000;
var server = require('http').createServer();
var io = require('socket.io')(server);
var tilemapper = require('./utils/tilemap-array-generator.js');
var lastPlayerID = 1;
var entities = {
  players: {}
};


main();

function main() {
  io.on('connection', function(client) {

    client.on('test', function() {
      console.log('test received');
    });

    var tilemap = tilemapper.create2dArrayFromTilemap(0); // number refers to which map to use, can be randomly generated when we have multiple maps

    client.on('newplayer', function() {
      playerPosition = initialPlayerPosition(tilemap);
      if (playerPosition.tileId !== 10) { //tried to make it recursive but returned wrong data, so using this check for now
        playerPosition = initialPlayerPosition(tilemap);
      }

      createEntity("players", lastPlayerID, playerPosition.worldX, playerPosition.worldY);
      client.emit('allplayers', getAllPlayers());
      client.broadcast.emit('newplayer', entities.players[lastPlayerID]);
      client.playerId = lastPlayerID;
      lastPlayerID++;

      client.on('movement', function(data) {
        var player = entities.players[data.id];
        var currentX = player.x / 32;
        var currentY = player.y / 32;
        if (player.x === player.expectedPosition.x && player.y === player.expectedPosition.y) {
          player.direction = data.direction;
          switch (data.direction) {
            case "left":
              if (tilemap[currentY][currentX - 1] === 10) {
                player.expectedPosition.x -= 32;
                io.emit('move', player);
              }
              break;
            case "right":
              if (tilemap[currentY][currentX + 1] === 10) {
                player.expectedPosition.x += 32;
                io.emit('move', player);
              }
              break;
            case "up":
              if (tilemap[currentY - 1][currentX] === 10) {
                player.expectedPosition.y -= 32;
                io.emit('move', player);
              }
              break;
            case "down":
              if (tilemap[currentY + 1][currentX] === 10) {
                player.expectedPosition.y += 32;
                io.emit('move', player);
              }
              break;
            default:
              break;
          }
        }
      });

      client.on('targetReached', function(data) {
        var player = entities.players[data.id];
        player.x = player.expectedPosition.x;
        player.y = player.expectedPosition.y;
      });

      client.on('disconnect', function() {
        io.emit('remove', client.playerId);
        delete entities.players[client.playerId];
      });
    });

  });

  server.listen(PORT, function() {
    console.log('Listening on ' + server.address().port);
  });

}

function createEntity(type, id, x, y) {
  console.log("Creating Entity: " + type + " ID: " + id);
  entities[type][id] = {
    id: id,
    x: x,
    y: y
  }
  if (type === "players") {
    entities[type][id]["direction"] = "";
    entities[type][id]["expectedPosition"] = {
      x: x,
      y: y
    };
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

function initialPlayerPosition(tilemap) {
  var y = randomInt(3, 18);
  var x = randomInt(1, 38);
  var randomTile = tilemap[y][x];
  return {
    'worldX': x * 32,
    'worldY': y * 32,
    'tileId': randomTile,
  };
}
