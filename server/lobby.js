var User = require('./user.js');
module.exports = class Lobby {
  constructor(gameWorld) {
    this.users = [];
    this.connectedPlayers = 0;
    this.minimumPlayers = 1;
    this.maximumPlayers = 4;
    this.gameReady = false;

    for (var i = 0; i < this.maximumPlayers; i++) {
      var user = new User(this.users.length + 1);
      this.users.push(user);
      gameWorld.createEntity("players", user.id, 0, 0);
    }
    gameWorld.setPlayerStartingPositions();
  }

  addPlayer(client) {
    console.log("adding player to Lobby");
    var connectedPlayers = this.connectedPlayers;
    if (this.checkSlotAvailable() === true) {
      this.users.forEach(function(user) {
        if (user.connected === false && client.user == null) {
          user.connected = true;
          user.gameLoaded = false;
          user.isReady = false;
          user.AI.active = false;
          client.user = user;
          connectedPlayers ++;
        }
      });
    } else{
      console.log("All slots full");
    }
  }

  checkAllReady() {
    var ready = true;

    if(this.connectedPlayers <= 2){
      this.users.forEach(function(user) {
        if (user.isReady === false) {
          ready = false;
        }
      });
    }else {
      ready = false;
    }

    console.log("Checking Ready : " + ready);
    return ready;
  }

  checkGameReady() {
    var lobby = this;
    this.gameReady = true;
    this.users.forEach(function(playerInLobby) {
      if (playerInLobby.gameLoaded === false) {
        lobby.gameReady = false;
      }
    });
    return this.gameReady;
  }

  checkSlotAvailable() {
    console.log(this.users);
    var available = false;
    this.users.forEach(function(user) {
      if (user.connected === false) {
        available = true;
      }
    });
    return available;
  }

  startAIUpdateTimer(io, entities) {
    var lobby = this;
    let duration = 1000;
    io.emit('startGameTimer', duration);
    this.AIUpdateTimer = setInterval(() => {
      console.log("AITimer");
      lobby.users.forEach(function(user) {
          user.AI.update(io , entities);
      });
    }, duration);
  }

}
