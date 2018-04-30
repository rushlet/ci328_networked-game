class Client {

  constructor() {
    this.direction;
    this.socket = io(location.hostname + ':55000');
    this.allPlayers();
    this.setID();
    this.startGame();
    this.loadGame();
    this.updateGame();
    this.endGame();
    this.powerups();
    this.lobbyFull();
    this.setLobbyScreen();
  }

  // Client Socket On Functions
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

  updateGame() {
    this.socket.on('updateHero', function(players) {
      for (var i = 0; i < players.length; i++) {
        updateSprites(players[i].id, players[i].hero);
      }
    });

    this.socket.on('updateDots', function(data) {
      for (var i = 0; i < data.length; i++) {
        updateDots(data[i].id, data[i].x, data[i].y);
      }
    });

    this.socket.on('updateScores', function(players) {
      for (var i = 0; i < players.length; i++) {
        sceneController.setText(`player${players[i].id}_score`, `Player${players[i].id}: ${players[i].score}`);
        sceneController.setText(`player${players[i].id}_score_gameOver`, `Player${players[i].id}: ${players[i].score}`);
      }
    });
  }

  powerups() {
    this.socket.on('addPowerup', function(x, y) {
      game.gameWorld.addPowerupToGame(x, y);
    });

    this.socket.on('updatePowerup', function(visibility, x, y) {
      game.gameWorld.updatePowerup(visibility, x, y);
    });

    this.socket.on('powerupCaught', function(powerup, player) {
      game.gameWorld.updatePowerup(false, 0, 0);
      if (powerup == 'Double Speed' || powerup == 'Half Speed') {
        game.playerMap[player.id].speedMultiplier = player.powerups.speedMultiplier;
      }
      if (client.ID == player.id) {
        game.gameWorld.powerupText(powerup);
      }
    });

    this.socket.on('powerupExpire', function(id) {
      game.playerMap[id].speedMultiplier = 1;
    });
  }

  move() {
    this.socket.on('move', function(data) {
      movePlayer(data.id, data.expectedPosition.x, data.expectedPosition.y, data.direction);
    });
  }

  remove() {
    this.socket.on('remove', function(id) {
      removePlayer(id);
    });
  }

  setID() {
    this.socket.on('setID', function(id) {
      client.ID = id;
      sceneController.createPlayersInLobby();
    });
  }

  startGame() {

    this.socket.on('heroChosen', function(player){
      sceneController.updateLobby(player);
    });

    this.socket.on('startGame', function() {
      game.gameReady = true;
      sceneController.createText("GameTimer", "InGame", game.width / 2 - 30, 35, "", 24);
      sceneController.createScoreText();
    });

    this.socket.on('startGameTimer', function(countdown) {
      game.gameWorld.setGameTimer(countdown);
    });

    this.socket.on('drawDots', function(data) {
      for (var i = 0; i < data.length; i++) {
        addNewDot(data[i].id, data[i].x, data[i].y);
      }
    });

    this.socket.on('tilemapChosen', function(id) {
      console.log('calling tile map', id);
      game.gameWorld.addTileMap(id);
    });
  }

  endGame() {
    this.socket.on('endGame', function() {
      game.gameReady = false;
      game.gameWorld.stopTimers();
      console.log("%cGAME OVER", "color: red; font-size: 32px;");
      sceneController.gameOverScreen();
    });
  }

  loadGame() {
    this.socket.on('loadGame', function() {
      sceneController.setScreen("InGame");
      client.gameLoaded();
    });
  }

  lobbyFull(){
      this.socket.on('lobbyFull', function(){
        sceneController.setScreen("LobbyFull");
      })
  }

  setLobbyScreen(){
      this.socket.on('setLobbyScreen', function(){
        sceneController.setScreen("Lobby");
      })
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

  joinLobby() {
    this.socket.emit('joinLobby');
  }

  playerReady() {
    this.socket.emit('playerReady');
  }

  gameLoaded() {
    this.socket.emit('gameLoaded');
  }

  // other
  getID() {
    return client.ID;
  }

}
