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
    this.powerups = ['doubleSpeed', 'doubleSpeed', 'doublePoints', 'doublePoints'];
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
        doubleSpeed: false,
        halfSpeed: false,
        doublePoints: false,
        halfPoints: false
      };
    }
  }

  randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
  }

  checkCollisions(player, io, client) {
    var gameWorld = this;
    var entities = this.entities;
    var tilemap = this.tilemap;
    let collision = "false";
    let dotScore;
    let heroScore;
    Object.keys(entities).forEach(function(type) {
      Object.keys(entities[type]).forEach(function(id) {
        if (player != entities[type][id]) {
          if (player.x === entities[type][id].x && player.y === entities[type][id].y) {
            console.log(type, "Collision");
            !player.powerups['doublePoints'] ? (dotScore = 1, heroScore = 3) : (dotScore = 2, heroScore = 6);
            if (type == 'dots' && player.hero) {
              gameWorld.dotCollision(id, io, player.id, dotScore, tilemap);
            } else if (type == 'players') {
              gameWorld.heroCollision(id, io, player, heroScore);
            } else if (type == "powerups" && entities.powerups[0].visible) {
              gameWorld.powerupCollision(id, io, player)
            }
            client.emit('updateScore', player.score);
            io.emit('updateOtherScores', gameWorld.getArrayOfEntityType('players'));
          }
        }
      });
    });
  }

  dotCollision(id, io, playerID, dotScore, tilemap) {
    var location = this.initialEntityPosition(tilemap);
    this.entities.dots[id].x = location.worldX;
    this.entities.dots[id].y = location.worldY;
    io.emit('updateDots', this.getArrayOfEntityType('dots'));
    this.entities.players[playerID].score += dotScore;
  }

  heroCollision(id, io, player, heroScore) {
    if (this.entities.players[id].hero && !player.hero) {
      this.entities.players[id].hero = false;
      this.entities.players[player.id].hero = true;
      this.entities.players[player.id].score += heroScore;
      io.emit('updateHero', this.getArrayOfEntityType('players'));
    } else if (!this.entities.players[id].hero && player.hero) {
      this.entities.players[id].hero = true;
      this.entities.players[id].score += heroScore;
      this.entities.players[player.id].hero = false;
      io.emit('updateHero', this.getArrayOfEntityType('players'));
    }
  }

  powerupCollision(id, io, player) {
    var gameWorld = this;
    let selectedPowerup = gameWorld.powerups[gameWorld.randomInt(0, 3)];
    this.entities.players[player.id].powerups[selectedPowerup] = true;
    io.emit('powerupCaught', selectedPowerup);
    let powerupExpire = setTimeout(() => {
      gameWorld.entities.players[player.id].powerups[selectedPowerup] = false;
      io.emit('powerupExpire');
      clearTimeout(powerupExpire);
    }, 5000);
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
    clearTimeout(this.gameOverTimer);
    clearInterval(this.powerupTimer);
  }
}
