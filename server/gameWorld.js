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
    this.powerups = ['Double Speed', 'Double Points', 'Half Speed', 'Half Points'];
  }

  gamePrep(io, client) {
    var gameWorld = this;
    this.chooseHero();
    this.generateEntity('dots', 5);
    this.generateEntity('powerups', 1);
    io.emit('drawDots', this.getArrayOfEntityType('dots'));
    io.emit('updateHero', this.getArrayOfEntityType('players'));
    io.emit('addUI', this.getArrayOfEntityType('players'), client.user.id);
    io.emit('startGame');
    this.startGameTimer(io);
    this.addPowerups(io);

    Object.keys(this.entities.players).forEach(function(id) {
      var player = gameWorld.entities.players[id];
      io.emit('move', player);
    });
  }

  setPlayerStartingPosition(id){
    var playerPosition = this.initialEntityPosition(this.tilemap);
    this.entities.players[id].x = playerPosition.worldX;
    this.entities.players[id].y = playerPosition.worldY;
    this.entities.players[id].expectedPosition.x = playerPosition.worldX;
    this.entities.players[id].expectedPosition.y = playerPosition.worldY;
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
    } else if (type === "players") {
      this.entities[type][id]["direction"] = "";
      this.entities[type][id]["expectedPosition"] = {
        x: x,
        y: y
      };
      this.entities[type][id]["hero"] = false;
      this.entities[type][id]["score"] = 0;
      this.entities[type][id]["powerups"] = {
        pointMultiplier: 1,
        speedMultiplier: 1
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
    Object.keys(entities).forEach(function(type) {
      Object.keys(entities[type]).forEach(function(id) {
        if (player != entities[type][id]) {
          if (player.x === entities[type][id].x && player.y === entities[type][id].y) {
            console.log(type, "Collision");
            if (type == 'dots' && player.hero) {
              gameWorld.dotCollision(id, io, player, tilemap);
            } else if (type == 'players') {
              gameWorld.heroCollision(id, io, player);
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

  dotCollision(id, io, player, tilemap) {
    var location = this.initialEntityPosition(tilemap);
    this.entities.dots[id].x = location.worldX;
    this.entities.dots[id].y = location.worldY;
    io.emit('updateDots', this.getArrayOfEntityType('dots'));
    this.entities.players[player.id].score += 2 * player.powerups.pointMultiplier;
  }

  heroCollision(id, io, player) {
    if (this.entities.players[id].hero && !player.hero) {
      this.entities.players[id].hero = false;
      this.entities.players[player.id].hero = true;
      this.entities.players[player.id].score += 4 * player.powerups.pointMultiplier;
      io.emit('updateHero', this.getArrayOfEntityType('players'));
    } else if (!this.entities.players[id].hero && player.hero) {
      this.entities.players[id].hero = true;
      this.entities.players[id].score += 4 * player.powerups.pointMultiplier;
      this.entities.players[player.id].hero = false;
      io.emit('updateHero', this.getArrayOfEntityType('players'));
    }
  }

  powerupCollision(id, io, player) {
    var gameWorld = this;
    var random = gameWorld.randomInt(0, gameWorld.powerups.length - 1);
    let selectedPowerup = gameWorld.powerups[gameWorld.randomInt(0, gameWorld.powerups.length)];
    gameWorld.applyPowerup(selectedPowerup, player);
    io.emit('powerupCaught', selectedPowerup, player);
    let powerupExpire = setTimeout(() => {
      player.powerups.speedMultiplier = 1;
      player.powerups.pointMultiplier = 1;
      io.emit('powerupExpire');
      clearTimeout(powerupExpire);
    }, 5000);
  }

  applyPowerup(selectedPowerup, player) {
    switch (selectedPowerup) {
      case 'Double Speed':
        player.powerups.speedMultiplier = 2;
        break;
      case 'Double Points':
        player.powerups.pointMultiplier = 2;
        break;
      case 'Half Speed':
        player.powerups.speedMultiplier = 0.5;
        break;
      case 'Half Points':
        player.powerups.pointMultiplier = 0.5;
        break;
      default:
        break;
    }
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
