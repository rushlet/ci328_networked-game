class Client {

  constructor() {
    this.direction;
    this.socket = io(location.hostname + ':55000');
    this.newPlayer();
    this.allPlayers();
    this.setID();
    this.startGame();
    this.loadGame();
    this.drawDots();
    this.updateDots();
    this.updateHero();
    this.updateScore();
  }

  // Client Socket On Functions
  newPlayer() {
    this.socket.on('newplayer', function(data) {
      addNewPlayer(data.id, data.x, data.y);
    });
  }

  allPlayers() {
    let client = this;
    this.socket.on('allplayers', function(data) {
      for (var i = 0; i < data.length; i++) {
        addNewPlayer(data[i].id, data[i].x, data[i].y);
      }
      client.move();
      client.remove();
    });
  }

  drawDots() {
    this.socket.on('drawDots', function(data) {
      for (var i = 0; i < data.length; i++) {
        addNewDot(data[i].id, data[i].x, data[i].y);

      }
    });
  }

  updateHero() {
    this.socket.on('updateHero', function(players) {
      for (var i = 0; i < players.length; i++) {
        updateSprites(players[i].id, players[i].hero);
      }
    });
  }

  updateDots() {
    this.socket.on('updateDots', function(data) {
      for (var i = 0; i < data.length; i++) {
        updateDots(data[i].id, data[i].x, data[i].y);
      }
    });
  }

  updateScore() {
    this.socket.on('updateScore', function(score) {
      sceneController.setText("ScoreText", `Score: ${score}`);
    });
  }

  move() {
    this.socket.on('move', function(data) {
      movePlayer(data.id, data.expectedPosition.x, data.expectedPosition.y);
    });
  }

  remove() {
    this.socket.on('remove', function(id) {
      removePlayer(id);
    });
  }

  setID(){
    this.socket.on('setID', function(id){
      client.ID = id;
    });
  }

  startGame(){
    this.socket.on('startGame', function(){
      game.gameReady = true;
    });
  }

  loadGame(){
    this.socket.on('loadGame', function(){
      sceneController.setScreen("InGame");
      client.gameLoaded();
    });
  }

  // Client Emit Functions
  sendTest() {
    this.socket.emit('test');
  }

  addClientToServer() {
    this.socket.emit('newplayer');
  }

  updatePlayerInput(direction) {
    this.socket.emit('movement', direction);
  }

  targetReached() {
    this.socket.emit('targetReached');
  }

  joinLobby(){
    this.socket.emit('joinLobby');
  }

  playerReady(){
    this.socket.emit('playerReady');
  }

  gameLoaded(){
    this.socket.emit('gameLoaded');
  }

}
