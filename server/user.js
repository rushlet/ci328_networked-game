var AI = require('./ai.js');
module.exports = class User {
  constructor(id, gameWorld) {
    this.id = id;
    this.connected = false;
    this.inLobby = true;
    this.isReady = true;
    this.gameLoaded = true;
    this.AI = new AI(id, gameWorld);
  }
}
