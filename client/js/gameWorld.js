class GameWorld {
  constructor() {
    this.map = game.add.tilemap('map1');
    this.layer = this.map.createLayer('map');
    this.map.addTilesetImage('maze-template');
    this.map.setCollisionByExclusion([10]);
    this.layer.resizeWorld();
  }
}
