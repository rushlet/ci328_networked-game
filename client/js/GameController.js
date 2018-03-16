
function main() {
  console.log("main()");

  const GAMEWIDTH = 1280;
  const GAMEHEIGHT = 800;

  // Initialize the phaser game window, give it a width of GAMEWIDTH and a height of GAMEHEIGHT, set the rendering context to auto and attach the window to a div with the ID "GameWindow"
  game = new Phaser.Game(GAMEWIDTH, GAMEHEIGHT, Phaser.AUTO, 'GameWindow', {
    preload: preload,
    create: create,
    update: update
  });
}

function preload() {
  game.load.image('sprite', 'assets/coin.png');
  game.load.tilemap('map1', 'assets/maps/tilemap.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.image('maze-template', 'assets/maps/maze-template.png');
}

function create() {
  game.stage.disableVisibilityChange = true;
  game.playerMap = {};
  game.gameStartTimer = 0;

  client = new Client();
  client.sendTest();

  sceneController = new SceneController();
  sceneController.setScreen("MainMenu");
}

function update() {
  if (sceneController.screen === "InGame") {
    game.gameStartTimer++;
    if (game.gameStartTimer / 60 > 3) {
      handleCursorInput();
      client.updatePlayerInput(client.direction);
    }
  }
}

function getCoordinates(pointer) {
  client.sendClick(pointer.worldX, pointer.worldY);
}

function addNewPlayer(id, x, y) {
  game.playerMap[id] = game.add.sprite(x, y, 'sprite');
}

function movePlayer(id, targetX, targetY) {

  var player = game.playerMap[id];
  var tween = game.add.tween(player);
  var duration = 320;
  tween.to({
    x: targetX,
    y: targetY
  }, duration);
  tween.start();
  tween.onComplete.add(() => {
    client.targetReached()
  });
}

function removePlayer(id) {
  game.playerMap[id].destroy();
  delete game.playerMap[id];
}

function handleCursorInput() {
  var directions = ["up", "down", "left", "right"];
  directions.forEach((direction) => {
    if (game.cursors[direction].isDown && client.direction != direction) {
      client.direction = direction;
      console.log(direction + "Detected");
    }
  });
}
