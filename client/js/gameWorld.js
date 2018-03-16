class GameWorld {
  constructor() {
    this.map = game.add.tilemap('map1');
    this.layer = this.map.createLayer('map');
    this.map.addTilesetImage('maze-template');
    this.layer.resizeWorld();
    game.cursors = game.input.keyboard.createCursorKeys();
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //enable tile debugging
    game.input.onDown.add(this.getTileProperties, this);
  }

  getTileProperties() {
    var x = game.gameWorld.layer.getTileX(game.input.activePointer.worldX);
    var y = game.gameWorld.layer.getTileY(game.input.activePointer.worldY);
    console.log(game.gameWorld.map.getTile(x, y, game.gameWorld.layer));
  }

}
