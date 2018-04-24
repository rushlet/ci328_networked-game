class GameWorld {
  constructor() {
    this.map = game.add.tilemap('map1');
    this.layer = this.map.createLayer('map');
    this.map.addTilesetImage('maze-template');
    this.layer.resizeWorld();
    game.cursors = game.input.keyboard.createCursorKeys();
    game.physics.startSystem(Phaser.Physics.ARCADE);
    this.gameTimer = game.time.create(true);
    game.input.onDown.add(this.getTileProperties, this); //enable tile debugging
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
    game.gameWorld.gameTimer.loop(30000, () => {
      // check if server has same time
      // request current time from server
      // checkServerTimer();
      // if current time +/- 1000 from client time all good
      // otherwise, update time (in correct format) to match
      // sceneController.setText("GameTimer", this.millisecondsToMinutes(countdown));
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
}
