class SceneController {
  constructor() {
    console.log("Constructing UI Elements")
    this.elements = [];
    this.screen = "";
    // Main Menu UI
    this.createSprite("splash", "MainMenu", 0, 0, 1280, 800, "splash");
    this.createSprite("button-bg", "MainMenu", game.width / 2 - 120, game.height * 0.75, 246, 46, "button");
    // this.createText("SplashText", "MainMenu", game.width / 2, game.height / 2, "This is the Main Menu", 20);
    this.createText("SplashJoinLobbyText", "MainMenu", game.width / 2 - 50, game.height * 0.75 + 6.5, "Join Lobby", 24);
    this.addEvent("SplashJoinLobbyText", function() {
      client.joinLobby();
    }, null);
    // Lobby UI
    this.createSprite("bg", "Lobby", 0, 0, 1280, 800, "lobby");
    // this.createText("SplashText", "Lobby", game.width / 2, game.height / 2, "This is the Lobby", 20);
    this.createSprite("button-bg", "Lobby", game.width / 2 - 75, game.height * 0.75, 150, 46, "button");
    this.createText("LobbyReadyText", "Lobby", game.width / 2 - 35, game.height * 0.75 + 6.5, "Ready", 24);
    this.addEvent("LobbyReadyText", function() {
      client.playerReady();
    }, null);

    //LobbyFull UI
    this.createText("LobbyFullText", "LobbyFull", game.width/2, game.height / 2, "The lobby is full!", 20);
    this.createText("LobbyFullGoBackText", "LobbyFull", game.width / 2, game.height / 2 + 30, "click here to go back", 20);
    this.addEvent("LobbyFullGoBackText", function() {
      sceneController.setScreen("MainMenu");
    }, null);

    // In Game UI
    this.createText("GameTimer", "InGame", game.width / 2 - 30, 35, "", 24);
    this.createScoreText();
    // Game Over UI
    this.createText("GameOver", "GameOver", game.width / 2 - 30, 25, "GAME OVER", 60, '#c30712');
  }

  setScreen(screen) {
    console.log("Changing Screen to: " + screen);
    this.hideAll();
    this.screen = screen;
    switch (screen) {
      case "MainMenu":
        this.showUI("MainMenu");
        break;
      case "Lobby":
        this.showUI("Lobby");
        break;
      case "LobbyFull":
        this.showUI("LobbyFull");
        break;
      case "InGame":
        this.showUI("InGame");
        game.gameWorld = new GameWorld();
        client.addClientToServer();
        break;
      case "GameOver":
        this.showUI("GameOver");
        break;
      default:
        console.log(screen + " not found");
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
      this.createText(`player${i}_score`, "InGame", game.width * width + space, 55, `Player${i} score: 0`, 12);
    }
  }

  createPlayersInLobby() {
    for (var i = 1; i <= 4; i++) {
      var x = (i % 2 !== 0) ? game.width * 0.7 : game.width * 0.85;
      var y = (i <= 2) ? game.height * 0.31 : game.height * 0.55;
      this.createSprite(`player${i}_lobby`, "Lobby", x, y, 48, 48, `ghost${i}`);
      this.createText(`player${i}_name`, "Lobby", x - 18, y + 85, `Player${i}`, 20);
      if (client.getID() == i) {
        this.createText('you_are', "Lobby", game.width * 0.19, game.height * 0.42, 'You Are', 16);
        this.createText('playerAssigned', "Lobby", game.width * 0.185, game.height * 0.475, `Player${i}`, 24);
      }
    }
  }
}
