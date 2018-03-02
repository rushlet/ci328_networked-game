class GameWorld {
  constructor() {
    this.map = game.add.tilemap('map1');
    this.map.addTilesetImage('maze-template');
    this.map.setCollision([0, 1, 2, 6, 9, 14, 17, 41, 42, 57, 64]);
    this.layer = this.map.createLayer('Tile Layer 1');
    this.layer.resizeWorld();
  }
}
