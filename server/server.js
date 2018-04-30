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
          console.log("disconnecting player" + client.user.id)
          user.connected = false;
          user.AI.active = true;
        }
      });
    });

    client.on('test', function() {
      console.log('test received');
    });

    client.on('joinLobby', function() {
      lobby.addPlayer(client, gameWorld);
    });

    client.on('playerReady', function() {
      console.log("Client " + client.user.id + " is ready");
      client.user.isReady = true;
      console.log(lobby);
      if (lobby.checkAllReady() === true) {
        var hero = gameWorld.chooseHero();
        io.emit('heroChosen', hero);
        this.loadGameTimer = setTimeout(() => {
          io.emit('loadGame');
          clearTimeout(this.loadGameTimer);
        }, 5000);
      }
    });

    client.on('gameLoaded', function() {
      client.user.gameLoaded = true;
      if (lobby.checkGameReady() && !lobby.gameActive) {
        gameWorld.gamePrep(io, client, lobby);
        lobby.startAIUpdateTimer(io, gameWorld);
        lobby.gameActive = true;
      } else if (lobby.gameActive) {
        gameWorld.callGamePrepEmits(io, client);
        gameWorld.addPowerups(io);
      }
    });

    client.on('newplayer', function() {

      client.on('movement', function(direction) {
        gameWorld.movePlayer(direction, client.user.id, io, client);
      });

      client.on('targetReached', function(id, targetX, targetY) {
        console.log(id, " Reached Target");
        var player = gameWorld.entities.players[id];
        if(player.expectedPosition.x == targetX && player.expectedPosition.y == targetY){
          player.x = player.expectedPosition.x;
          player.y = player.expectedPosition.y;
        }
      });
    });
  });

  server.listen(PORT, function() {
    console.log('Listening on ' + server.address().port);
  });
}
