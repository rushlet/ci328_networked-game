var tilemapper = require('./utils/tilemap-array-generator.js');
module.exports = class GameWorld {

  constructor() {
    this.tilemap = tilemapper.create2dArrayFromTilemap(0);
    this.gameOverTimer;
    this.entities = {
      players: {},
      dots: {},
      powerups: {}
    };
    this.powerups = ['halfSpeed', 'doubleSpeed', 'halfPoints', 'doublePoints'];
  }

  gamePrep(io, client) {
    this.chooseHero();
    this.generateEntity('dots', 5);
    this.generateEntity('powerups', 1);
    io.emit('drawDots', this.getArrayOfEntityType('dots'));
    io.emit('updateHero', this.getArrayOfEntityType('players'));
    io.emit('addUI', this.getArrayOfEntityType('players'), client.user.id);
    io.emit('startGame');
    this.startGameTimer(io);
    this.addPowerups(io);
  }

  chooseHero() {
    var hero = this.randomInt(1, 2);
    console.log('hero is ', hero);
    this.entities.players[hero].hero = true;
  }

  generateEntity(type, quantity) {
    for (var i = 0; i < quantity; i++) {
      var location = this.initialEntityPosition(this.tilemap);
      this.createEntity(type, i, location.worldX, location.worldY);
    }
  }

  createEntity(type, id, x, y) {
    console.log("Creating Entity: " + type + " ID: " + id);
    this.entities[type][id] = {
      id: id,
      x: x,
      y: y
    }
    if (type === "powerups") {
      this.entities[type][id]["visible"] = false;
    }
    else if (type === "players") {
      this.entities[type][id]["direction"] = "";
      this.entities[type][id]["expectedPosition"] = {
        x: x,
        y: y
      };
      this.entities[type][id]["hero"] = false;
      this.entities[type][id]["score"] = 0;
      this.entities[type][id]["powerups"] = {
        halfSpeed: false,
        doubleSpeed: false,
        halfPoints: false,
        doublePoints: false
      };
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
            } else if (type == 'players' && entities[type][id].hero && !player.hero) {
              entities[type][id].hero = false;
              entities[type][player.id].hero = true;
              entities[type][player.id].score += 3;
              io.emit('updateHero', gameWorld.getArrayOfEntityType('players'));
            } else if (type == 'players' && !entities[type][id].hero && player.hero) {
              entities[type][id].hero = true;
              entities[type][id].score += 3;
              entities[type][player.id].hero = false;
              io.emit('updateHero', gameWorld.getArrayOfEntityType('players'));
            } else if (type == "powerups" && entities.powerups[0].visible) {
              console.log('power up collision if');
              // select random powerup
              let selectedPowerup = gameWorld.powerups[gameWorld.randomInt(0, 4)];
              // add relevant boolean to player
              entities.players[player.id].powerups[selectedPowerup] = true;
              io.emit('powerupCaught', selectedPowerup);
              let powerupExpire = setTimeout(() => {
                io.emit('powerupExpire');
                clearTimeout(powerupExpire);
              }, 2000);
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
      this.stopTimers();
    }, duration);
  }

  addPowerups(io) {
    let duration = 10000;
    console.log(this.entities.powerups);
    io.emit('addPowerup', this.entities.powerups[0].x, this.entities.powerups[0].y);
    this.powerupTimer = setInterval(() => {
      if (this.entities.powerups[0].visible) {
        this.entities.powerups[0].visible = false;
        let location = this.initialEntityPosition(this.tilemap)
        this.entities.powerups[0].x = location.worldX;
        this.entities.powerups[0].y = location.worldY;
        console.log(this.entities.powerups[0]);
      } else {
        this.entities.powerups[0].visible = true;
        console.log(this.entities.powerups[0]);
      }
      io.emit('updatePowerup', this.entities.powerups[0].visible, this.entities.powerups[0].x, this.entities.powerups[0].y);
    }, duration);
  }

  stopTimers() {
    clearTimeout(gameWorld.gameOverTimer);
    clearInterval(gameWorld.powerupTimer);
  }
}
