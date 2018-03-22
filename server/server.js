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
    var tilemap = tilemapper.create2dArrayFromTilemap(0); // number refers to which map to use, can be randomly generated when we have multiple maps

    client.on('test', function() {
      console.log('test received');
    });

    client.on('joinLobby', function() {
      createEntity("players", lastPlayerID, 0, 0);
      client.playerId = lastPlayerID;
      lastPlayerID++;
      console.log("Client " + client.playerId + " joined lobby");
      io.emit('setID', client.playerId);
    });

    client.on('playerReady', function() {
      console.log("Client " + client.playerId + " is ready");
      entities.players[client.playerId].ready = true;
      if (checkAllReady() && Object.keys(entities.players).length > 1) {
        console.log("All players ready");
        client.emit('loadGame');
        client.broadcast.emit('loadGame');
      }
    });

    client.on('gameLoaded', function(){
      entities.players[client.playerId].gameReady = true;
      if (checkAllGameReady()) {
        client.emit('startGame');
        client.broadcast.emit('startGame');
      }
    });

    client.on('newplayer', function() {
      playerPosition = initialPlayerPosition(tilemap);
      if (playerPosition.tileId !== 10) { //tried to make it recursive but returned wrong data, so using this check for now
        playerPosition = initialPlayerPosition(tilemap);
      }
      entities.players[client.playerId].x = playerPosition.worldX;
      entities.players[client.playerId].y = playerPosition.worldY;
      entities.players[client.playerId].expectedPosition.x = playerPosition.worldX;
      entities.players[client.playerId].expectedPosition.y = playerPosition.worldY;
      client.emit('allplayers', getAllPlayers());
      client.broadcast.emit('newplayer', entities.players[client.playerId]);

      client.on('movement', function(direction) {
        console.log("Player " + client.playerId + " is moving " + direction);
        var player = entities.players[client.playerId ];
        var currentX = player.x / 32;
        var currentY = player.y / 32;
        if (player.x === player.expectedPosition.x && player.y === player.expectedPosition.y) {
          player.direction = direction;
          switch (direction) {
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

      client.on('targetReached', function() {
        var player = entities.players[client.playerId ];
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

function checkAllGameReady() {
  var ready = true;
  Object.keys(entities.players).forEach(function(id) {
    if (!entities.players[id].gameReady) {
      ready = false;
    }
  });
  return ready;
}

function checkAllReady() {
  var ready = true;
  Object.keys(entities.players).forEach(function(id) {
    if (!entities.players[id].ready) {
      ready = false;
    }
  });
  return ready;
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
    entities[type][id]["ready"] = false;
    entities[type][id]["gameReady"] = false;
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
