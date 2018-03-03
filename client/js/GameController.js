
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
  game.load.tilemap('map1', 'assets/maps/map-demo.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.image('maze-template', 'assets/maps/maze-template.png');
}

function create() {
  game.stage.disableVisibilityChange = true;
  game.playerMap = {};

  client = new Client();
  client.sendTest();

  game.cursors = game.input.keyboard.createCursorKeys();

  game.physics.startSystem(Phaser.Physics.ARCADE);

  client.askNewPlayer();

  game.map = game.add.tilemap('map1');
  game.layer = game.map.createLayer('map');
  game.map.addTilesetImage('maze-template');
  game.map.setCollisionByExclusion([10]);
  game.layer.resizeWorld();
  console.log(game.layer);
  game.input.onDown.add(getTileProperties, this);
  // game.physics.arcade.gravity.y = 100;
  // game.map.setTileIndexCallback(45, log, this);
}

function getTileProperties() {

  var x = game.layer.getTileX(game.input.activePointer.worldX);
  var y = game.layer.getTileY(game.input.activePointer.worldY);
  console.log(game.map.getTile(x, y, game.layer));
}

function update() {
  var currentKey;
  var directions = ["up", "down", "left", "right"];
  directions.forEach((direction) => {
    if (game.cursors[direction].isDown && currentKey != direction) {
      client.sendCursor(direction);
      currentKey = direction;
    }
  });
  handleCollisions();
}

function getCoordinates(pointer) {
  client.sendClick(pointer.worldX, pointer.worldY);
}

function addNewPlayer(id, x, y) {
  console.log('add player');
  game.playerMap[id] = game.add.sprite(x, y, 'sprite');
  game.physics.arcade.enable(game.playerMap[id]);
  game.playerMap[id].enableBody = true;
  game.playerMap[id].physicsBodyType = Phaser.Physics.ARCADE;
  game.playerMap[id].body.collideWorldBounds = true;
}

function movePlayer(id, x, y, direction) {
  var player = game.playerMap[id];
  var distance = Phaser.Math.distance(player.x, player.y, x, y);
  // var tween = game.add.tween(player);
  // var duration = distance * 10;
  // tween.to({
  //   x: x,
  //   y: y
  // }, duration);
  // tween.start();
  if (player.x !== x || player.y !== y) {
    switch (direction) {
      case "left":
        game.playerMap[id].body.velocity.x = -50;
        break;
      case "right":
        game.playerMap[id].body.velocity.x = 50;
        break;
      case "up":
        game.playerMap[id].body.velocity.y = -50;
        break;
      case "down":
        game.playerMap[id].body.velocity.y = 50;
        break;
      default:
        break;
    }
  }
}

function removePlayer(id) {
  game.playerMap[id].destroy();
  delete game.playerMap[id];
}

function handleCollisions() {
  let playerIds = Object.keys(game.playerMap);
  playerIds.forEach((id) => {
    game.physics.arcade.collide(game.playerMap[id], game.layer, log, null, this);
    game.debug.body(game.playerMap[id], 'blue', false);
  });
}

function log() {
  console.log("hit!");
  let playerIds = Object.keys(game.playerMap);
  playerIds.forEach((id) => {
    game.playerMap[id].body.velocity.x = 0;
    game.playerMap[id].body.velocity.y = 0;
  });
}
