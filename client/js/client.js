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
    this.addUI();
    this.updateOtherScores();
    this.startGameTimer();
    this.endGame();
    this.powerups();
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

  updateOtherScores() {
    this.socket.on('updateOtherScores', function(players) {
      // iterate over each player, update their scores on each client
      for (var i = 0; i < players.length; i++) {
        sceneController.setText(`player${players[i].id}_score`, `Player${players[i].id} score: ${players[i].score}`);
      }
    });
  }

  addUI() {
    this.socket.on('addUI', function(players) {
      // iterate over each player, add score text on each client - except for client score
      let count = 0;
      for (var i = 0; i < players.length; i++) {
        if (players[i].id !== client.ID) {
          sceneController.createText(`player${players[i].id}_score`, "InGame", game.width * 0.65 + (count * 150), 25, `Player${players[i].id} score: 0`, 12);
          count ++;
        }
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

    this.socket.on('powerupCaught', function(powerup, playerPowerupValues) {
      console.log('caught a powerup!');
      if (powerup == 'Double Speed' || powerup == 'Half Speed') {
        game.playerMap[client.ID].speedMultiplier = playerPowerupValues.speedMultiplier;
      }
      if (!sceneController.doesTextExist()) {
        sceneController.createText("PowerupText", "InGame", game.width / 2, game.height / 2, "Powerup!", 20);
      }
      sceneController.setText("PowerupText", `${powerup}!`);
      sceneController.textVisible("PowerupText", true);
      setTimeout(() => {
        sceneController.textVisible("PowerupText", false);
      }, 2000);
      game.gameWorld.updatePowerup(false, 0, 0);
    });

    this.socket.on('powerupExpire', function(visibility, x, y) {
      // game.gameWorld.updatePowerup(visibility, x, y);
      game.playerMap[client.ID].speedMultiplier = 1;
    });
  }

  startGameTimer() {
    this.socket.on('startGameTimer', function(countdown) {
      game.gameWorld.setGameTimer(countdown);
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

  setID() {
    this.socket.on('setID', function(id) {
      client.ID = id;
    });
  }

  startGame() {
    this.socket.on('startGame', function() {
      game.gameReady = true;
    });
  }

  endGame() {
    this.socket.on('endGame', function() {
      console.log("%cGAME OVER", "color: red; font-size: 32px;");
      game.gameWorld.stopTimers();
    });
  }

  loadGame() {
    this.socket.on('loadGame', function() {
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

  joinLobby() {
    this.socket.emit('joinLobby');
  }

  playerReady() {
    this.socket.emit('playerReady');
  }

  gameLoaded() {
    this.socket.emit('gameLoaded');
  }

  // checkServerTimer() {
  //   this.socket.emit('whatsTheTimeMrWolf?');
  // }

}
