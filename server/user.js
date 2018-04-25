var AI = require('./ai.js');
module.exports = class User {
  constructor(id){
    this.id = id;
    this.connected = true;
    this.inLobby = false;
    this.isReady = false;
    this.gameLoaded = false;
    this.AI = new AI(id);
  }
}
