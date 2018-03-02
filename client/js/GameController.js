
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
  game.load.tilemap('map1', 'assets/maps/map-template.json', null, Phaser.Tilemap.TILED_JSON);
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

  gameWorld = new GameWorld;
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

function movePlayer(id, x, y) {
  var player = game.playerMap[id];
  var distance = Phaser.Math.distance(player.x, player.y, x, y);
  var tween = game.add.tween(player);
  var duration = distance * 10;
  tween.to({
    x: x,
    y: y
  }, duration);
  tween.start();
}

function removePlayer(id) {
  game.playerMap[id].destroy();
  delete game.playerMap[id];
}

function handleCollisions() {
  let playerIds = Object.keys(game.playerMap);
  playerIds.forEach((id) => {
    game.physics.arcade.collide(game.playerMap[id], gameWorld.layer);
  });
}
