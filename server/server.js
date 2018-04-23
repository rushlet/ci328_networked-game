//Global Vaiables
const PORT = 55000;
var server = require('http').createServer();
var io = require('socket.io')(server);
var tilemapper = require('./utils/tilemap-array-generator.js');
var lastPlayerID = 1;
var entities = {
  players: {},
  dots: {},
  powerups: {}
};
var gameReady = false;
var tilemap;

main();

function main() {
  io.on('connection', function(client) {
    tilemap = tilemapper.create2dArrayFromTilemap(0); // number refers to which map to use, can be randomly generated when we have multiple maps

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
      if (checkAllReady('ready') && Object.keys(entities.players).length > 1) {
        console.log("All players ready");
        client.emit('loadGame');
        client.broadcast.emit('loadGame');
      }
    });

    client.on('gameLoaded', function() {
      entities.players[client.playerId].gameReady = true;
      if (checkAllReady('gameReady')) {
        gameReady = true;
        gamePrep();
        client.emit('drawDots', getAllEntitiesOfType('dots'));
        client.broadcast.emit('drawDots', getAllEntitiesOfType('dots'));
        client.emit('startGame');
        client.broadcast.emit('startGame');
      }
    });

    client.on('newplayer', function() {
      playerPosition = initialEntityPosition(tilemap);
      entities.players[client.playerId].x = playerPosition.worldX;
      entities.players[client.playerId].y = playerPosition.worldY;
      entities.players[client.playerId].expectedPosition.x = playerPosition.worldX;
      entities.players[client.playerId].expectedPosition.y = playerPosition.worldY;
      client.emit('allplayers', getAllEntitiesOfType('players'));
      client.broadcast.emit('newplayer', entities.players[client.playerId]);

      client.on('movement', function(direction) {
        var player = entities.players[client.playerId];
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

          switch (checkCollisions(player)) {
            case "dot":
              client.emit('updateDots', getAllEntitiesOfType('dots'));
              client.broadcast.emit('updateDots', getAllEntitiesOfType('dots'));
              break;
            case "player":
              // TO DO
              break;
            default:
              break;
          }
        }
      });

      client.on('targetReached', function() {
        var player = entities.players[client.playerId];
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

function gamePrep() {
  console.log('in game loop');
  /*var countdown = 120000;
  setInterval(function() {
    countdown--;
    io.sockets.emit('timer', {
      countdown: countdown
    });
  }, 120000);*/
  chooseHero();
  generateDots();
}

function chooseHero() {
  var hero = randomInt(1, 2);
  console.log(hero);
  entities.players[hero].hero = true;
  console.log(entities.players);
}

function generateDots() {
  // generate 5 dots
  for (var i = 0; i < 5; i++) {
    var location = initialEntityPosition(tilemap);
    createEntity('dots', i, location.worldX, location.worldY);
  }
}

function checkCollisions(player) {
  var collision = "false";
  Object.keys(entities).forEach(function(type) {
    Object.keys(entities[type]).forEach(function(id) {
      if (player != entities[type][id]) {
        if (player.x === entities[type][id].x && player.y === entities[type][id].y) {
          console.log(type, "Collision");
          if (type == 'dots' && player.hero) {
            console.log('collided!! update dot position');
            var location = initialEntityPosition(tilemap);
            entities[type][id].x = location.worldX;
            entities[type][id].y = location.worldY;
            collision = "dot";
          }
          if (type == 'player' && player.hero) {
            console.log('player collision');
            // switch hero status
            entities[type][id].hero = true;
            player.hero = false;
            collision = "player";
          }
        }
      }
    });
  });
  return collision;
}

function checkAllReady(state) {
  var ready = true;
  Object.keys(entities.players).forEach(function(id) {
    if (!entities.players[id][state]) {
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
    entities[type][id]["hero"] = false;
  }
}

function getAllEntitiesOfType(type) {
  var output = [];
  Object.keys(entities[type]).forEach(function(id) {
    var entity = entities[type][id];
    if (entity) output.push(entity);
  });
  return output;
}

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

function initialEntityPosition(tilemap) {
  var y = randomInt(3, 18);
  var x = randomInt(1, 38);
  var randomTile = tilemap[y][x];
  console.log(randomTile);
  if (randomTile != 10) {
    return initialEntityPosition(tilemap);
  } else {
    Object.keys(entities).forEach(function(entityType) {
      Object.keys(entities[entityType]).forEach(function(id) {
        var entity = entities[entityType][id];
        if (entity.x == x && entity.y == y) {
          return initialEntityPosition(tilemap);
        }
      });
    });
  }
  return {
    'worldX': x * 32,
    'worldY': y * 32,
    'tileId': randomTile,
  };
}
