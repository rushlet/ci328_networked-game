class GameWorld {
  constructor() {
    game.cursors = game.input.keyboard.createCursorKeys();
    game.physics.startSystem(Phaser.Physics.ARCADE);
    this.gameTimer = game.time.create(true);
    game.input.onDown.add(this.getTileProperties, this); //enable tile debugging
  }

  cleanUp(){
    this.map.visible = false;
    this.layer.visible = false;
  }

  addTileMap(id) {
    // var image = (id == 0) ? 'maze-template' : 'tileset';
    this.map = game.add.tilemap(`map${id+1}`);
    this.layer = this.map.createLayer(`map${id+1}`);
    // this.map.addTilesetImage('maze-template');
    this.map.addTilesetImage('tileset');
    this.layer.resizeWorld();
  }

  getTileProperties() {
    var x = game.gameWorld.layer.getTileX(game.input.activePointer.worldX);
    var y = game.gameWorld.layer.getTileY(game.input.activePointer.worldY);
    console.log(game.gameWorld.map.getTile(x, y, game.gameWorld.layer));
  }

  setGameTimer(duration) {
    let countdown = duration
    sceneController.setText("GameTimer", this.millisecondsToMinutes(countdown));
    game.gameWorld.gameTimer.loop(1000, () => {
      countdown -= 1000;
      sceneController.setText("GameTimer", this.millisecondsToMinutes(countdown));
    }, this);
    game.gameWorld.gameTimer.start();
  }

  stopTimers() {
    game.gameWorld.gameTimer.destroy();
  }

  millisecondsToMinutes(ms) {
    var seconds = ms / 1000;
    var minutes = ('0' + (parseInt(seconds / 60))).slice(-2);
    seconds = ('0' + (seconds % 60)).slice(-2);
    return `${minutes}:${seconds}`;
  }

  addPowerupToGame(x, y) {
    game.gameWorld.powerup = game.add.sprite(x, y, 'powerup');
    game.gameWorld.powerup.visible = false;
    game.gameWorld.powerup.animations.add('spin');
    game.gameWorld.powerup.animations.play('spin', 8, true);
  }

  updatePowerup(visibility, x, y) {
    game.gameWorld.powerup.visible = visibility;
    game.gameWorld.powerup.x = x;
    game.gameWorld.powerup.y = y;
  }

  powerupText(powerup) {
    if (!sceneController.checkObjectExists()) {
      sceneController.createText("PowerupText", "InGame", game.width / 2, game.height / 2, "Powerup!", 20);
    }
    sceneController.setText("PowerupText", `${powerup}!`);
    sceneController.setObjectVisibility("PowerupText", true);
    setTimeout(() => {
      sceneController.setObjectVisibility("PowerupText", false);
    }, 2000);
  }
}
