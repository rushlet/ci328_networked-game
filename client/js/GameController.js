
function main() {
  console.log("main()");

  const GAMEWIDTH = 800;
  const GAMEHEIGHT = 600;

  // Initialize the phaser game window, give it a width of GAMEWIDTH and a height of GAMEHEIGHT, set the rendering context to auto and attach the window to a div with the ID "GameWindow"
  game = new Phaser.Game(GAMEWIDTH, GAMEHEIGHT, Phaser.AUTO, 'GameWindow', {
    preload: preload,
    create: create,
    update: update
  });
}

function preload() {
  console.log("preload()");
  game.load.image('sprite', 'assets/coin.png');
}

function create() {
  console.log("create()");

  game.stage.disableVisibilityChange = true;
  game.playerMap = {};

  console.log("Creating Client Object");
  client = new Client();
  console.log("Testing Server Connection");
  client.sendTest();

  game.cursors = game.input.keyboard.createCursorKeys();

  client.askNewPlayer();
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
}

function getCoordinates(pointer) {
  client.sendClick(pointer.worldX, pointer.worldY);
}

function addNewPlayer(id, x, y) {
  game.playerMap[id] = game.add.sprite(x, y, 'sprite');
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
