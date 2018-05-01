class GameWorld {
  constructor() {
    game.cursors = game.input.keyboard.createCursorKeys();
    game.physics.startSystem(Phaser.Physics.ARCADE);
    this.gameTimer = game.time.create(true);
  }

  cleanUp(){
    this.map.visible = false;
    this.layer.visible = false;
    this.powerup.destroy();
  }

  addTileMap(id) {
    this.map = game.add.tilemap(`map${id+1}`);
    this.layer = this.map.createLayer(`map${id+1}`);
    this.map.addTilesetImage('tileset');
    this.layer.resizeWorld();
  }

  secondsToMinutes(time) {
    var minutes = Math.floor(time / 60);
    var seconds = time - minutes * 60;
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
    if(game.gameWorld.powerup != null){
    game.gameWorld.powerup.visible = visibility;
    game.gameWorld.powerup.x = x;
    game.gameWorld.powerup.y = y;
  }
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

  playSoundEffect(type) {
    game.music[type].play();
    console.log('play ', type);
  }

  switchSound() {
    if (game.music.on) {
      game.sound.mute = true;
      game.music.on = false;
      sceneController.updateSprite("sound_on", "sound_off");
    } else {
      game.sound.mute = false;
      game.music.on = true;
      sceneController.updateSprite("sound_on", "sound_on");
    }
  }
}
