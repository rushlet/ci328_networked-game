var tilemapper = require('./utils/tilemap-array-generator.js');
module.exports = class gameWorld {

  constructor() {
    this.tilemap = tilemapper.create2dArrayFromTilemap(0);
    this.gameOverTimer;
    this.entities = {
      players: {},
      dots: {},
      powerups: {}
    };
  }

  gamePrep(io, client) {
    this.chooseHero();
    this.generateDots();
    io.emit('drawDots', this.getArrayOfEntityType('dots'));
    io.emit('updateHero', this.getArrayOfEntityType('players'));
    io.emit('addUI', this.getArrayOfEntityType('players'), client.user.id);
    io.emit('startGame');
    this.startGameTimer(io);
  }

  chooseHero() {
    var hero = this.randomInt(1, 2);
    console.log('hero is ', hero);
    this.entities.players[hero].hero = true;
  }

  generateDots() {
    for (var i = 0; i < 5; i++) {
      var location = this.initialEntityPosition(this.tilemap);
      this.createEntity('dots', i, location.worldX, location.worldY);
    }
  }

  createEntity(type, id, x, y) {
    console.log("Creating Entity: " + type + " ID: " + id);
    this.entities[type][id] = {
      id: id,
      x: x,
      y: y
    }
    if (type === "players") {
      this.entities[type][id]["direction"] = "";
      this.entities[type][id]["expectedPosition"] = {
        x: x,
        y: y
      };
      this.entities[type][id]["hero"] = false;
      this.entities[type][id]["score"] = 0;
    }
  }
  randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
  }

  checkCollisions(player, io, client) {
    var gameWorld = this;
    var entities = this.entities;
    var collision = "false";
    var tilemap = this.tilemap
    Object.keys(entities).forEach(function(type) {
      Object.keys(entities[type]).forEach(function(id) {
        if (player != entities[type][id]) {
          if (player.x === entities[type][id].x && player.y === entities[type][id].y) {
            console.log(type, "Collision");
            if (type == 'dots' && player.hero) {
              var location = gameWorld.initialEntityPosition(tilemap);
              entities[type][id].x = location.worldX;
              entities[type][id].y = location.worldY;
              io.emit('updateDots', gameWorld.getArrayOfEntityType('dots'));
              entities.players[player.id].score += 1;
            } else if (entities[type][id].hero && !player.hero) {
              entities[type][id].hero = false;
              entities[type][player.id].hero = true;
              entities[type][player.id].score += 3;
              io.emit('updateHero', gameWorld.getArrayOfEntityType('players'));
            } else if (!entities[type][id].hero && player.hero) {
              entities[type][id].hero = true;
              entities[type][id].score += 3;
              entities[type][player.id].hero = false;
              io.emit('updateHero', gameWorld.getArrayOfEntityType('players'));
            }
            client.emit('updateScore', player.score);
            io.emit('updateOtherScores', gameWorld.getArrayOfEntityType('players'));
          }
        }
      });
    });
  }

  initialEntityPosition(tilemap) {
    var entities = this.entities;
    var y = this.randomInt(3, 18);
    var x = this.randomInt(1, 38);
    var randomTile = tilemap[y][x];
    console.log(randomTile);
    if (randomTile != 10) {
      return this.initialEntityPosition(tilemap);
    } else {
      Object.keys(entities).forEach(function(entityType) {
        Object.keys(entities[entityType]).forEach(function(id) {
          var entity = entities[entityType][id];
          if (entity.x == x && entity.y == y) {
            return this.initialEntityPosition(tilemap);
          }
        });
      });
    }
    return {
      'worldX': x * 32,
      'worldY': y * 32,
      'tileId': randomTile,
    };
  }

  getArrayOfEntityType(type) {
    var entities = this.entities;
    var output = [];
    Object.keys(entities[type]).forEach(function(id) {
      var entity = entities[type][id];
      if (entity) output.push(entity);
    });
    return output;
  }

  startGameTimer(io) {
    let duration = 150000;
    io.emit('startGameTimer', duration);
    this.gameOverTimer = setTimeout(() => {
      io.emit('endGame', duration);
      clearTimeout(this.gameOverTimer);
    }, duration);
  }
}
