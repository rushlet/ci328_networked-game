
function main() {
  console.log("main()");

  const GAMEWIDTH = 1280;
  const GAMEHEIGHT = 800;

  // Initialize the phaser game window, give it a width of GAMEWIDTH and a height of GAMEHEIGHT, set the rendering context to auto and attach the window to a div with the ID "GameWindow"
  game = new Phaser.Game(GAMEWIDTH, GAMEHEIGHT, Phaser.AUTO, 'gameWindow', {
    preload: preload,
    create: create,
    update: update
  });
}

function preload() {
  // game.load.image('dot', 'assets/img/dot.png');
  game.load.spritesheet('frog', 'assets/img/spritesheets/frog.png', 32, 32, 6);
  game.load.spritesheet('ghost1', 'assets/img/spritesheets/ghost.png', 32, 32, 6);
  game.load.spritesheet('ghost2', 'assets/img/spritesheets/ghost2.png', 32, 32, 6);
  game.load.spritesheet('ghost3', 'assets/img/spritesheets/ghost3.png', 32, 32, 6);
  game.load.spritesheet('ghost4', 'assets/img/spritesheets/ghost4.png', 32, 32, 6);
  // game.load.spritesheet('powerup2', 'assets/img/spritesheets/bat-thing2.png', 24, 24, 3);
  game.load.spritesheet('coin', 'assets/img/spritesheets/coin.png', 30, 30, 6);
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
  console.log('id', id);
  game.playerMap[id] = game.add.sprite(x, y, `ghost${id}`);
  game.playerMap[id].speedMultiplier = 1;
}

function addNewDot(id, x, y) {
  console.log('add new dot', id, x, y);
  game.dotMap[id] = game.add.sprite(x, y, 'coin');
  game.dotMap[id].animations.add('spin');
  game.dotMap[id].animations.play('spin', 6, true);
}

function updateDots(id, x, y) {
  game.dotMap[id].x = x;
  game.dotMap[id].y = y;
}

function updateSprites(id, hero) {
  if (hero) {
    game.playerMap[id].loadTexture('frog');
  } else {
    game.playerMap[id].loadTexture(`ghost${id}`);
  }
  game.playerMap[id].animations.add('right', [0,1,2], true);
  game.playerMap[id].animations.add('left', [3,4,5], true);
}

function movePlayer(id, targetX, targetY, direction) {
  var player = game.playerMap[id];
  console.log(direction);
  if (direction == "left") {
    game.playerMap[id].animations.play('left', 3);
  } else {
    game.playerMap[id].animations.play('right', 3);
  }
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
      //flip sprite
    }
  });
}
