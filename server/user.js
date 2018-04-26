var AI = require('./ai.js');
module.exports = class User {
  constructor(id){
    this.id = id;
    this.connected = false;
    this.inLobby = true;
    this.isReady = true;
    this.gameLoaded = true;
    this.AI = new AI(id);
  }
}
