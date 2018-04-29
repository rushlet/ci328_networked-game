class SceneController {
  constructor() {
    console.log("Constructing UI Elements")
    this.elements = [];
    this.screen = "";

    // Main Menu UI
    this.createText("SplashText", "MainMenu", game.width / 2, game.height / 2, "This is the Main Menu", 20);
    this.createText("SplashJoinLobbyText", "MainMenu", game.width / 2, game.height / 2 + 30, "Join Lobby", 20);
    this.addEvent("SplashJoinLobbyText", function() {
      client.joinLobby();
    }, null);
    // Lobby UI
    this.createText("SplashText", "Lobby", game.width / 2, game.height / 2, "This is the Lobby", 20);
    this.createText("LobbyReadyText", "Lobby", game.width / 2, game.height / 2 + 30, "Ready?", 20);
    this.addEvent("LobbyReadyText", function() {
      client.playerReady();
      // set player ready sprite
    }, null);

    //LobbyFull UI
    this.createText("LobbyFullText", "LobbyFull", game.width/2, game.height / 2, "The lobby is full!", 20);
    this.createText("LobbyFullGoBackText", "LobbyFull", game.width / 2, game.height / 2 + 30, "click here to go back", 20);
    this.addEvent("LobbyFullGoBackText", function() {
      sceneController.setScreen("MainMenu");
    }, null);

    // In Game UI
    // this.createText("ScoreText", "InGame", game.width / 4, 25, "Score: 0", 20);
    this.createText("GameTimer", "InGame", game.width/2 - 30, 25, "", 20);
    this.createScoreText();
    // Game Over UI

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
        this.showUI("InGame");
        break;
      default:
        console.log(screen + " not found");
    }
  }

  createText(name, ui, x, y, string, size) {
    var textObject = game.add.text(x, y, string, {
      font: size + 'px Arial',
      fill: '#fff'
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
    let exists = false
    this.elements.forEach((element) => {
      if (element.name == name) {
        exists = true;
      }
    });
    return exists;
  }

  createScoreText() {
    for (var i = 1; i <= 4; i++) {
      var space = (i % 2 === 0)? 150 : 0;
      var width = (i <= 2 )? 0.15 : 0.65;
      this.createSprite(`player${i}_sprite`, "InGame", game.width * width + space + 30, 10, 32, 32, `ghost${i}`);
      this.createText(`player${i}_score`, "InGame", game.width * width + space, 45, `Player${i} score: 0`, 12);
    }
  }
}
