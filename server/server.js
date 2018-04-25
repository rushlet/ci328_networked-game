const PORT = 55000;
var server = require('http').createServer();
var io = require('socket.io')(server);
var Lobby = require('./lobby.js');
var GameWorld = require('./gameWorld.js');
main();

function main() {
  var lobby = new Lobby();
  var gameWorld = new GameWorld();
  io.on('connection', function(client) {

    client.on('disconnect', function() {
      lobby.users.forEach(function(user) {
        if (user === client.user) {
          console.log("disconnecting player" + client.user.id)
          user.connected = false;
          user.isReady = false;
          user.inLobby = false;
          user.AI.active = true;
        }
      });
      console.log(lobby.users);
    });

    client.on('test', function() {
      console.log('test received');
    });

    client.on('joinLobby', function() {
      lobby.addPlayer(client, gameWorld);
      client.emit('setID', client.user.id);
      console.log(lobby.users);
    });

    client.on('playerReady', function() {
      console.log("Client " + client.user.id + " is ready");
      client.user.isReady = true;
      gameWorld.setPlayerStartingPosition(client.user.id);
      if (lobby.checkAllReady() === true) {
        io.emit('loadGame');
      }
    });

    client.on('gameLoaded', function() {
      client.user.gameLoaded = true;
      if (lobby.checkGameReady())
        gameWorld.gamePrep(io, client);
        lobby.startAIUpdateTimer(io, gameWorld.entities);
    });

    client.on('newplayer', function() {
      client.emit('allplayers',gameWorld.getArrayOfEntityType('players'));

      client.on('movement', function(direction) {
        var player = gameWorld.entities.players[client.user.id];
        var currentX = player.x / 32;
        var currentY = player.y / 32;
        if (player.x === player.expectedPosition.x && player.y === player.expectedPosition.y) {
          player.direction = direction;
          switch (direction) {
            case "left":
              if (gameWorld.tilemap[currentY][currentX - 1] === 10) {
                player.expectedPosition.x -= 32;
                io.emit('move', player);
              }
              break;
            case "right":
              if (gameWorld.tilemap[currentY][currentX + 1] === 10) {
                player.expectedPosition.x += 32;
                io.emit('move', player);
              }
              break;
            case "up":
              if (gameWorld.tilemap[currentY - 1][currentX] === 10) {
                player.expectedPosition.y -= 32;
                io.emit('move', player);
              }
              break;
            case "down":
              if (gameWorld.tilemap[currentY + 1][currentX] === 10) {
                player.expectedPosition.y += 32;
                io.emit('move', player);
              }
              break;
            default:
              break;
          }
          gameWorld.checkCollisions(player, io, client);
        }
      });

      client.on('targetReached', function() {
        var player = gameWorld.entities.players[client.user.id];
        player.x = player.expectedPosition.x;
        player.y = player.expectedPosition.y;
      });
    });
  });

  server.listen(PORT, function() {
    console.log('Listening on ' + server.address().port);
  });
}
