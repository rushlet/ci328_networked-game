const PORT = 55000;
var server = require('http').createServer();
var io = require('socket.io')(server);
var Lobby = require('./lobby.js');
var GameWorld = require('./gameWorld.js');
main();

function main() {
  var gameWorld = new GameWorld();
  var lobby = new Lobby(gameWorld);
  io.on('connection', function(client) {

    client.on('disconnect', function() {
      lobby.users.forEach(function(user) {
        if (user === client.user) {
          lobby.connectedPlayers--;
          user.connected = false;
          user.gameLoaded = true;
          user.isReady = true;
          user.AI.active = true;
          io.emit('setLobbyScreen', lobby.users);
        }
      });
      var stillPlaying = false;
      lobby.users.forEach(function(user) {
        if (user.connected === true) {
          stillPlaying = true;
        }
      });
      if (!stillPlaying) {
        gameWorld.stopTimers(lobby);
        gameWorld.resetGame(lobby);
      }
    });

    client.on('test', function() {
      console.log('test received');
    });

    client.on('joinLobby', function() {
      lobby.addPlayer(client, io);
    });

    client.on('playerReady', function() {
      if (client.user != null) {
        client.user.isReady = true;
        io.emit('playerReady', client.user.id);
        if (lobby.checkAllReady() === true) {
          if (!lobby.gameActive) {
             var hero = gameWorld.chooseHero();
           }
          io.emit('heroChosen', gameWorld.getHero());
          this.loadGameTimer = setTimeout(() => {
            io.emit('loadGame');
            clearTimeout(this.loadGameTimer);
          }, 5000);
        }
      }
    });

    client.on('gameLoaded', function() {
      if (client.user != null) {
        client.user.gameLoaded = true;
        if (lobby.checkGameReady() && !lobby.gameActive) {
          gameWorld.gamePrep(io, client, lobby);
          lobby.startAIUpdateTimer(io, gameWorld);
          lobby.gameActive = true;
        } else if (lobby.gameActive) {
          gameWorld.callGamePrepEmits(io, client);
          gameWorld.addPowerups(io);
        }
      }
    });

    client.on('newplayer', function() {
      if (client.user != null) {
        client.on('movement', function(direction) {
          gameWorld.movePlayer(direction, client.user.id, io, client);
        });

        client.on('targetReached', function(id, targetX, targetY) {
          var player = gameWorld.entities.players[id];
          if (player.expectedPosition.x == targetX && player.expectedPosition.y == targetY) {
            player.x = player.expectedPosition.x;
            player.y = player.expectedPosition.y;
          }
        });
      }
    });
  });

  server.listen(PORT, function() {
    console.log('Listening on ' + server.address().port);
  });
}
