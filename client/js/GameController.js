function main() {
    console.log("main()");

    const GAMEWIDTH = 800;
    const GAMEHEIGHT = 600;

    // Initialize the phaser game window, give it a width of GAMEWIDTH and a height of GAMEHEIGHT, set the rendering context to auto and attach the window to a div with the ID "GameWindow"
    game = new Phaser.Game(GAMEWIDTH, GAMEHEIGHT, Phaser.AUTO, 'GameWindow', {
        preload: preload,
        create: create
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
    var testKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);

    console.log("Creating Client");
    console.log("Sending Test");
    testKey.onDown.add(Client.sendTest, this);
    console.log("Test successful");

    game.input.onTap.add(getCoordinates, this);
    Client.askNewPlayer();
}

function getCoordinates(pointer) {
    Client.sendClick(pointer.worldX, pointer.worldY);
}

function addNewPlayer(id, x, y) {
    game.playerMap[id] = game.add.sprite(x, y, 'sprite');
}

function movePlayer(id, x, y) {
    var player = game.playerMap[id];
    var distance = Phaser.Math.distance(player.x, player.y, x, y);
    var tween = game.add.tween(player);
    var duration = distance * 10;
    tween.to({ x: x, y: y }, duration);
    tween.start();
}

function removePlayer(id) {
    game.playerMap[id].destroy();
    delete game.playerMap[id];
}
