class SceneController {
  constructor() {
    this.elements = [];
    this.screen = "";
    var sceneController = this;
    // Main Menu UI
    this.createSprite("splash", "MainMenu", 0, 0, 1280, 800, "splash");
    this.createSprite("button-menu", "MainMenu", game.width / 2 - 120, game.height * 0.75, 246, 46, "button-menu");
    this.addEvent("button-menu", function() {
      client.joinLobby();
    }, null);
    // Lobby UI
    this.createSprite("bg", "Lobby", 0, 0, 1280, 800, "lobby");
    this.createSprite("button-ready", "Lobby", game.width / 2 - 120, game.height * 0.75, 246, 46, "button-ready");
    this.addEvent("button-ready", function() {
      client.playerReady();
      sceneController.setObjectVisibility("button-ready", false);
      sceneController.updateEntityPosition("button-ready", 0, 0);
    }, null);

    //LobbyFull UI
    this.createSprite("splash-lobby", "LobbyFull", 0, 0, 1280, 800, "splash");
    this.createText("LobbyFullText", "LobbyFull", game.width / 2 - 125, game.height * 0.65, "The lobby is full!", 36);
    this.createSprite("button-back", "LobbyFull", game.width / 2 - 120, game.height * 0.75, 246, 46, "button-back");
    this.addEvent("button-back", function() {
      sceneController.setScreen("MainMenu");
    }, null);

    // In Game UI

    // Game Over UI
    this.createText("GameOver", "GameOver", game.width / 2 - 30, 25, "GAME OVER", 60, '#c30712');
  }

  setScreen(screen) {
    this.hideAll();
    this.screen = screen;
    this.showUI(screen);
    if (screen == "InGame") {
      game.gameWorld = new GameWorld();
      client.addClientToServer();
    }
  }

  createText(name, ui, x, y, string, size, colour = '#fff') {
    var textObject = game.add.text(x, y, string, {
      font: size + 'px Arial',
      fill: colour,
      align: 'center'
    });
    this.elements.push({
      name: name,
      ui: ui,
      type: "Text",
      object: textObject
    });
  }

  setText(name, string) {
    this.elements.forEach((element) => {
      if (element.name == name) {
        element.object.text = string;
      }
    });
  }

  updateSprite(name, newSprite) {
    this.elements.forEach((element) => {
      if (element.name == name) {
        element.object.loadTexture(newSprite);
      }
    });
  }

  updateEntityPosition(name, x, y) {
    this.elements.forEach((element) => {
      if (element.name == name) {
        element.object.x = x;
        element.object.y = y;
      }
    });
  }

  setObjectVisibility(name, visible) {
    this.elements.forEach((element) => {
      if (element.name == name) {
        element.object.visible = visible;
      }
    });
  }

  createSprite(name, ui, x, y, width, height, image) {
    var sprite = game.add.sprite(x, y, image);
    sprite.width = width;
    sprite.height = height;
    this.elements.push({
      name: name,
      ui: ui,
      type: "Sprite",
      object: sprite
    });
  }

  addEvent(name, eventDown, eventUp) {
    this.elements.forEach(function(element) {
      if (element.name == name) {
        if (eventDown != null) {
          element.object.inputEnabled = true;
          element.object.events.onInputDown.add(eventDown, this);
        }
        if (eventUp != null) {
          element.object.inputEnabled = true;
          element.object.events.onInputUp.add(eventUp, this);
        }
      }
    });
  }

  showUI(uiType) {
    this.elements.forEach(function(element) {
      if (element.ui == uiType) {
        element.object.visible = true;
      }
    });
  }

  hideAll() {
    this.elements.forEach(function(element) {
      element.object.visible = false;
    });
  }

  checkObjectExists(name) {
    var exists;
    this.elements.forEach((element) => {
      exists = (element.name == name) ? true : false;
    });
    return exists;
  }

  createScoreText() {
    for (var i = 1; i <= 4; i++) {
      var space = (i % 2 === 0) ? 150 : 0;
      var width = (i <= 2) ? 0.15 : 0.65;
      this.createSprite(`player${i}_score_sprite`, "InGame", game.width * width + space + 30, 20, 32, 32, `ghost${i}`);
      this.createText(`player${i}_score`, "InGame", game.width * width + space, 55, `Player${i}: 0`, 16);
      this.createSprite(`player${i}_sprite_gameOver`, "GameOver", game.width * width + space + 30, 20, 32, 32, `ghost${i}`);
      this.createText(`player${i}_score_gameOver`, "GameOver", game.width * width + space, 55, `Player${i}: 0`, 16);
    }
  }

  createPlayersInLobby() {
    for (var i = 1; i <= 4; i++) {
      var x = (i % 2 !== 0) ? game.width * 0.7 : game.width * 0.85;
      var y = (i <= 2) ? game.height * 0.31 : game.height * 0.55;
      this.createSprite(`player${i}_lobby`, "Lobby", x, y, 48, 48, `ghost${i}`);
      this.createText(`player${i}_name`, "Lobby", x - 18, y + 85, `Player${i}`, 20);
      if (client.getID() == i) {
        this.createText('youAre', "Lobby", game.width * 0.18, game.height * 0.34, 'You Are', 16);
        this.createText('playerAssigned', "Lobby", game.width * 0.16, 420, `Player${i}`, 30);
        this.createSprite(`player${i}_assignedGhost`, "Lobby", 200, 355, 48, 48, `ghost${i}`);
        this.createSprite(`player${i}_assignedFrog`, "Lobby", 260, 350, 48, 48, `frog${i}`);
      }
    }
  }

  updateLobby(hero) {
    this.updateSprite(`player${hero.id}_lobby`, `frog${hero.id}`);
    this.setObjectVisibility(`button-bg`, false);
    this.setObjectVisibility(`LobbyReadyText`, false);
    this.addLobbyCountdown();
    var count = 5;
    this.lobbyTimer = setInterval(() => {
      count--;
      this.setText('GameStartingTimer', count);
      if (count == 0) {
        clearInterval(this.lobbyTimer);
      }
    }, 1000);
  }

  addLobbyCountdown() {
    if (this.checkObjectExists('GameStartingTimer')) {
      this.setObjectVisibility('TimerBackground', true);
      this.setObjectVisibility('GameStarting', true);
      this.setObjectVisibility('GameStartingTimer', true);
    } else {
      this.createSprite('TimerBackground', "Lobby", game.width / 2 - 128, 35, 256, 128, 'lobby-countdown-bg');
      this.createText('GameStarting', "Lobby", game.width / 2 - 50, 60, 'Game Starts in', 16);
      this.createText('GameStartingTimer', "Lobby", game.width / 2 - 15, 90, '5', 42);
    }
  }

  gameOverScreen() {
    this.setScreen("GameOver");
    this.createSprite("GameOverBg", "GameOver", 0, 0, 1280, 800, "temp-game-over");
    this.createSprite("button-again", "MainMenu", game.width / 2 - 120, game.height * 0.53, 246, 46, "button-again");
    this.addEvent("button-again", function() {
      sceneController.setScreen("Lobby");
      cleanUp();
    }, null);
  }

  cleanUpLobby() {
      this.setObjectVisibility('TimerBackground', false);
      this.setObjectVisibility('GameStarting', false);
      this.setObjectVisibility('GameStartingTimer', false);
      this.updateEntityPosition("button-ready", game.width / 2 - 120, game.height * 0.75);
  }
}
