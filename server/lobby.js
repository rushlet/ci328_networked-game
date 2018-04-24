var User = require('./user.js');
module.exports = class lobby {
  constructor() {
    this.users = [];
    this.maximumPlayers = 2;
    this.gameReady = false;
  }

  addPlayer(client, gameWorld) {
    console.log("adding player to Lobby");
    if (this.checkDisconnected() === true) {
      this.users.forEach(function(user) {
        if (user.connected === false) {
          user.connected = true;
          client.user = user;
          user.inLobby = true;
        }
      });
    } else if (this.users.length != this.maximumPlayers) {
      client.user = new User(this.users.length + 1);
      client.user.inLobby = true;
      gameWorld.createEntity("players", client.user.id, 0, 0);
      this.users.push(client.user);
    }
  }

  checkAllReady() {
    var ready = true;
    if (this.users.length === this.maximumPlayers) {
      this.users.forEach(function(playerInLobby) {
        if (playerInLobby.isReady === false) {
          ready = false;
        }
      });
    } else {
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

  checkDisconnected() {
    var disconnected = false;
    this.users.forEach(function(player) {
      if (player.connected === false) {
        disconnected = true;
      }
    });
    return disconnected;
  }

}
