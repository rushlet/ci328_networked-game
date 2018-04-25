
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
  game.load.image('dot', 'assets/img/dot.png');
  game.load.image('ghost', 'assets/img/ghost.png');
  game.load.image('powerup', 'assets/img/star.png');
  game.load.tilemap('map1', 'assets/maps/tilemap.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.image('maze-template', 'assets/maps/maze-template.png');
}

function create() {
  game.stage.disableVisibilityChange = true;
  game.playerMap = {};
  game.dotMap = {};
  game.gameReady = false;

  client = new Client();
  client.sendTest();

  sceneController = new SceneController();
  sceneController.setScreen("MainMenu");
}

function update() {
  // if everyone ready
  if (game.gameReady) {
    handleCursorInput();
    client.updatePlayerInput(client.direction);
  }
}

function getCoordinates(pointer) {
  client.sendClick(pointer.worldX, pointer.worldY);
}

function addNewPlayer(id, x, y) {
  game.playerMap[id] = game.add.sprite(x, y, 'sprite');
  game.playerMap[id].speedMultiplier = 1;
}

function addNewDot(id, x, y) {
  console.log('add new dot', id, x, y);
  game.dotMap[id] = game.add.sprite(x, y, 'dot');
}

function updateDots(id, x, y) {
  game.dotMap[id].x = x;
  game.dotMap[id].y = y;
}

function updateSprites(id, hero) {
  if (hero) {
    game.playerMap[id].loadTexture('sprite');
  } else {
    game.playerMap[id].loadTexture('ghost');
  }
}

function movePlayer(id, targetX, targetY) {
  var player = game.playerMap[id];
  var tween = game.add.tween(player);
  var duration = 320 / player.speedMultiplier;
  tween.to({
    x: targetX,
    y: targetY
  }, duration);
  tween.start();
  tween.onComplete.add(() => {
    if (id === client.ID) {
      client.targetReached();
    }
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
