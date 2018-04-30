var tilemapper = require('./utils/tilemap-array-generator.js');
var Lobby = require('./lobby.js');
module.exports = class GameWorld {

  constructor() {
    this.gameOverTimer;
    this.entities = {
      players: {},
      dots: {},
      powerups: {}
    };
    this.powerups = ['Double Speed', 'Double Points', 'Half Speed', 'Half Points'];
  }

  chooseTileMap() {
    this.tileMapSelection = this.randomInt(1, 5) - 1;
    this.tilemap = tilemapper.create2dArrayFromTilemap(this.tileMapSelection)
    this.walkableTile = 1;
  }

  gamePrep(io, client, lobby) {
    this.chooseTileMap();
    this.setPlayerStartingPositions();
    this.generateEntity('dots', 20);
    this.generateEntity('powerups', 1);
    this.callGamePrepEmits(io);
    this.startGameTimer(io, lobby);
    this.addPowerups(io);
  }

  callGamePrepEmits(io, client) {
    if (client == null) {
      io.emit('tilemapChosen', this.tileMapSelection);
      io.emit('allplayers', this.getArrayOfEntityType('players'));
      io.emit('drawDots', this.getArrayOfEntityType('dots'));
    } else {
      client.emit('tilemapChosen', this.tileMapSelection);
      client.emit('allplayers', this.getArrayOfEntityType('players'));
      client.emit('drawDots', this.getArrayOfEntityType('dots'));
    }
    io.emit('startGame');
    var gameWorld = this;
    Object.keys(this.entities.players).forEach(function(id) {
      var player = gameWorld.entities.players[id];
      io.emit('move', player);
    });
    io.emit('updateHero', this.getArrayOfEntityType('players'));
  }

  setPlayerStartingPositions() {
    var gameWorld = this;
    Object.keys(this.entities.players).forEach(function(id) {
      var playerPosition = gameWorld.initialEntityPosition(gameWorld.tilemap);
      gameWorld.updateEntityPosition("players", id)
    });
  }

  movePlayer(direction, id, io, client) {
    var player = this.entities.players[id];
    var currentX = player.x / 32;
    var currentY = player.y / 32;
    if (player.x === player.expectedPosition.x && player.y === player.expectedPosition.y) {
      player.direction = direction;
      switch (direction) {
        case "left":
          if (this.tilemap[currentY][currentX - 1] === this.walkableTile) {
            player.expectedPosition.x -= 32;
            io.emit('move', player);
          }
          break;
        case "right":
          if (this.tilemap[currentY][currentX + 1] === this.walkableTile) {
            player.expectedPosition.x += 32;
            io.emit('move', player);
          }
          break;
        case "up":
          if (this.tilemap[currentY - 1][currentX] === this.walkableTile) {
            player.expectedPosition.y -= 32;
            io.emit('move', player);
          }
          break;
        case "down":
          if (this.tilemap[currentY + 1][currentX] === this.walkableTile) {
            player.expectedPosition.y += 32;
            io.emit('move', player);
          }
          break;
        default:
          break;
      }
      this.checkCollisions(player, io, client);
    }
  };

  chooseHero() {
    var hero = this.randomInt(1, 4);
    console.log('hero is ', hero);
    this.entities.players[hero].hero = true;
    return this.entities.players[hero];
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
      y: y,
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
            if (type == 'dots' && player.hero) {
              gameWorld.dotCollision(id, io, player, tilemap);
            } else if (type == 'players') {
              gameWorld.heroCollision(id, io, player);
            } else if (type == "powerups" && entities.powerups[0].visible) {
              gameWorld.powerupCollision(id, io, player)
            }
            io.emit('updateScores', gameWorld.getArrayOfEntityType('players'));
          }
        }
      });
    });
  }

  dotCollision(id, io, player, tilemap) {
    var location = this.initialEntityPosition(tilemap);
    this.updateEntityPosition("dots", id);
    io.emit('updateDots', this.getArrayOfEntityType('dots'));
    this.entities.players[player.id].score += 2 * player.powerups.pointMultiplier;
  }

  heroCollision(id, io, player) {
    if (this.entities.players[id].hero && !player.hero) {
      this.entities.players[id].hero = false;
      this.entities.players[player.id].hero = true;
      this.entities.players[player.id].score += 4 * player.powerups.pointMultiplier;
      this.updateEntityPosition("players", id)
      io.emit('move', this.entities.players[id]);
      io.emit('updateHero', this.getArrayOfEntityType('players'));
    } else if (!this.entities.players[id].hero && player.hero) {
      this.entities.players[id].hero = true;
      this.entities.players[id].score += 4 * player.powerups.pointMultiplier;
      this.entities.players[player.id].hero = false;
      io.emit('updateHero', this.getArrayOfEntityType('players'));
    }
  }

  powerupCollision(id, io, player) {
    this.entities.powerups[0].visible = false;
    var random = this.randomInt(0, this.powerups.length - 1);
    let selectedPowerup = this.powerups[this.randomInt(0, this.powerups.length)];
    this.applyPowerup(selectedPowerup, player);
    io.emit('powerupCaught', selectedPowerup, player);
    let powerupExpire = setTimeout(() => {
      player.powerups.speedMultiplier = 1;
      player.powerups.pointMultiplier = 1;
      io.emit('powerupExpire', player.id);
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
    var randomTile = this.tilemap[y][x];
    if (randomTile != this.walkableTile) {
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

  startGameTimer(io, lobby) {
    let duration = 150000;
    io.emit('startGameTimer', duration);
    this.gameOverTimer = setTimeout(() => {
      io.emit('endGame', duration);
      this.stopTimers(lobby);
      this.resetGame(lobby, io);
    }, duration);
  }

  resetGame(lobby) {
    lobby.gameActive = false;
    lobby.gameReady = false;
    var gameWorld = this;
    this.entities = {
      players: {},
      dots: {},
      powerups: {}
    };
    lobby.users.forEach(function(user) {
      if (user.connected === true) {
        user.gameLoaded = false;
        user.isReady = false;
        user.AI.active = false;
      }
      gameWorld.createEntity("players", user.id, 0, 0);
    });

  }

  addPowerups(io) {
    let duration = this.randomInt(5000, 15000);
    io.emit('addPowerup', this.entities.powerups[0].x, this.entities.powerups[0].y);
    this.powerupTimer = setInterval(() => {
      this.updateEntityPosition("powerups", 0);
      if (this.entities.powerups[0].visible) {
        this.entities.powerups[0].visible = false;
      } else {
        this.entities.powerups[0].visible = true;
      }
      io.emit('updatePowerup', this.entities.powerups[0].visible, this.entities.powerups[0].x, this.entities.powerups[0].y);
    }, duration);
  }

  updateEntityPosition(entityType, id) {
    let location = this.initialEntityPosition(this.tilemap)
    this.entities[entityType][id].x = location.worldX;
    this.entities[entityType][id].y = location.worldY;
    if (entityType === "players") {
      this.entities.players[id].expectedPosition.x = location.worldX;
      this.entities.players[id].expectedPosition.y = location.worldY;
    }
  }

  stopTimers(lobby) {
    clearTimeout(this.gameOverTimer);
    clearInterval(this.powerupTimer);
    clearInterval(lobby.AIUpdateTimer);
  }
}
