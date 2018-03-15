
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

  client = new Client();
  client.sendTest();
  client.askNewPlayer();
  game.gameWorld = new GameWorld();

  game.cursors = game.input.keyboard.createCursorKeys();
  game.physics.startSystem(Phaser.Physics.ARCADE);


  //enable tile debugging
  game.input.onDown.add(getTileProperties, this);
}

function getTileProperties() {
  var x = game.gameWorld.layer.getTileX(game.input.activePointer.worldX);
  var y = game.gameWorld.layer.getTileY(game.input.activePointer.worldY);
  console.log(game.gameWorld.map.getTile(x, y, game.gameWorld.layer));
}

function update() {
  handleCursorInput();
  if (game.playerMap[client.ID]) {
    client.updatePlayerInput(client.ID, client.currentKey, game.playerMap[client.ID].x, game.playerMap[client.ID].y);
  }
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

function movePlayer(id, direction, x, y, targetX, targetY) {
  console.log("Moving " + direction);
  var player = game.playerMap[id];
  var tween = game.add.tween(player);
  var duration = 320;
  console.log(id, direction, x, y, targetX, targetY);
  tween.to({ x: targetX, y: targetY }, duration);
  tween.start();
}

function removePlayer(id) {
  game.playerMap[id].destroy();
  delete game.playerMap[id];
}

function handleCursorInput() {
  var directions = ["up", "down", "left", "right"];
  directions.forEach((direction) => {
    if (game.cursors[direction].isDown && client.currentKey != direction) {
      client.currentKey = direction;
      // movePlayer(client.ID, client.currentKey, client.x, client.y);
    }
  });
}

function handleCollisions() {
  let playerIds = Object.keys(game.playerMap);
  playerIds.forEach((id) => {
    game.physics.arcade.collide(game.playerMap[id], game.gameWorld.layer, () => {
      playerWallCollision(game.playerMap[id])
    }, null, this);
    game.debug.body(game.playerMap[id], 'blue', false);
  });
}

function playerWallCollision(player) {
  console.log("hit!");
  player.body.velocity.x = 0;
  player.body.velocity.y = 0;
  //client.updatePlayerInput( client.direction, game.playerMap[client.ID].body.x, game.playerMap[client.ID].body.y);
}
