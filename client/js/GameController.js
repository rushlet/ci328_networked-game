
function main() {
  const GAMEWIDTH = 1280;
  const GAMEHEIGHT = 800;
  game = new Phaser.Game(GAMEWIDTH, GAMEHEIGHT, Phaser.AUTO, 'gameWindow', {
    preload: preload,
    create: create,
    update: update
  });
}

function preload() {
  game.load.spritesheet('frog1', 'assets/img/spritesheets/frog1.png', 32, 32, 6);
  game.load.spritesheet('frog2', 'assets/img/spritesheets/frog2.png', 32, 32, 6);
  game.load.spritesheet('frog3', 'assets/img/spritesheets/frog3.png', 32, 32, 6);
  game.load.spritesheet('frog4', 'assets/img/spritesheets/frog4.png', 32, 32, 6);
  game.load.spritesheet('ghost1', 'assets/img/spritesheets/ghost.png', 32, 32, 6);
  game.load.spritesheet('ghost2', 'assets/img/spritesheets/ghost2.png', 32, 32, 6);
  game.load.spritesheet('ghost3', 'assets/img/spritesheets/ghost3.png', 32, 32, 6);
  game.load.spritesheet('ghost4', 'assets/img/spritesheets/ghost4.png', 32, 32, 6);
  game.load.spritesheet('coin', 'assets/img/spritesheets/coin.png', 30, 30, 6);
  game.load.spritesheet('powerup', 'assets/img/spritesheets/gem.png', 32, 32, 8);
  game.load.tilemap('map1', 'assets/maps/tilemap.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.tilemap('map2', 'assets/maps/tilemap_another.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.tilemap('map3', 'assets/maps/tilemap_croaked.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.tilemap('map4', 'assets/maps/tilemap5.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.image('maze-template', 'assets/maps/maze-template.png');
  game.load.image('tileset', 'assets/maps/base_landscape.png');
  game.load.image('splash', 'assets/img/splash.png');
  game.load.image('lobby', 'assets/img/lobby1.png');
  game.load.image('temp-game-over', 'assets/img/temp-game-over.png');
  game.load.image('lobby-countdown-bg', 'assets/img/timer-bg.png');
  // buttons
  game.load.image('button-menu', 'assets/img/buttons/button-menu.png');
  game.load.image('button-ready', 'assets/img/buttons/button-ready.png');
  game.load.image('button-again', 'assets/img/buttons/button-again.png');
  game.load.image('button-back', 'assets/img/buttons/button-lobby-full.png');
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

function cleanUp() {
  game.gameReady = false;
  game.gameWorld.cleanUp();
  Object.keys(game.playerMap).forEach(function(id) {
    game.playerMap[id].destroy();
  });
  Object.keys(game.dotMap).forEach(function(id) {
    game.dotMap[id].destroy();
  });
  game.dotMap = {};
  game.playerMap = {};
  console.log("cleanup finished");
}

function addNewPlayer(id, x, y) {
  game.playerMap[id] = game.add.sprite(x, y, `ghost${id}`);
  game.playerMap[id].speedMultiplier = 1;
}

function addNewDot(id, x, y) {
  game.dotMap[id] = game.add.sprite(x, y, 'coin');
  game.dotMap[id].animations.add('spin');
  game.dotMap[id].animations.play('spin', 6, true);
}

function updateDots(id, x, y) {
  if (game.dotMap[id] != null) {
    game.dotMap[id].x = x;
    game.dotMap[id].y = y;
  }
}

function updateSprites(id, hero) {
  if (game.playerMap[id] != null) {
    (hero) ? game.playerMap[id].loadTexture(`frog${id}`): game.playerMap[id].loadTexture(`ghost${id}`);
    game.playerMap[id].animations.add('right', [0, 1, 2], true);
    game.playerMap[id].animations.add('left', [3, 4, 5], true);
  }
}

function movePlayer(id, targetX, targetY, direction) {
  var player = game.playerMap[id];
  (direction == "left") ? game.playerMap[id].animations.play('left', 3): game.playerMap[id].animations.play('right', 3);
  var tween = game.add.tween(player);
  var duration = 320 / player.speedMultiplier;
  tween.to({
    x: targetX,
    y: targetY
  }, duration);
  tween.start();
  tween.onComplete.add(() => {
    client.targetReached(id, targetX, targetY);
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
    }
  });
}
