module.exports = class Ai {

  constructor(id, gameWorld) {
    var AI = this;
    this.playerID = id;
    this.active = true;
    this.gameWorld = gameWorld;
    this.actions = [{
        name: "MoveToDot",
        score: 0,
        function: (io, entity) => {
          AI.moveToDot(io, entity);
        }
      },
      {
        name: "MoveToHero",
        score: 0,
        function: (io, entity) => {
          AI.moveToHero(io, entity);
        }
      },
      {
        name: "MoveToPowerUp",
        score: 0,
        function: (io, entity) => {
          AI.moveToPowerUp(io, entity);
        }
      },
      {
        name: "AvoidGhost",
        score: 0,
        function: (io, entity) => {
          AI.avoidGhost(io, entity);
        }
      },
    ];
  }

  update(io) {
    if (this.active) {
      var entity = this.gameWorld.entities.players[this.playerID];
      this.checkConditions(entity, this.gameWorld.entities);
      this.activateAction(io, entity);
      this.gameWorld.checkCollisions(entity, io);
      io.emit('move', entity);
    }
  }

  checkConditions(entity, entities) {
    var ai = this;
    this.resetScores();
    this.actions.forEach(function(action) {
      switch (action.name) {
        case "MoveToDot":
          if (entity.hero) {
            action.score++;
            //  ai.checkDistanceToEntity(entity, entities, "dots");
          }
          break;
        case "MoveToHero":
          if (!entity.hero) {
            action.score++;
          }
          break;
        case "MoveToPowerUp":
          //if (entities.powerups[0].visible === true) {
          //  action.score++;
          //}
          break;
        case "AvoidGhost":

          break;
        default:
          break;
      }
    });
  }

  resetScores() {
    this.actions.forEach(function(action) {
      action.score = 0;
    });
  }

  activateAction(io, entity) {
    var activeAction;
    var highScore = 0;
    this.actions.forEach(function(action) {
      if (action.score > highScore) {
        activeAction = action;
        highScore = action.score;
      }
    });
    activeAction.function(io, entity);
  }

  checkDistanceToEntity(entity, entities, targetType) {
    var xIndex = entity.x / 32;
    var yIndex = entity.y / 32;

    Object.keys(entities).forEach(function(type) {
      if (type === targetType) {
        Object.keys(entities).forEach(function(id) {

          console.log(xIndex + " " + yIndex);
          var targetTypeXIndex = entities[type][id].x / 32;
          var targetTypeYIndex = entities[type][id].y / 32;
          console.log(targetTypeXIndex + " " + targetTypeYIndex);
        });
      }
    });
  }

  move(direction, entity) {
    var currentX = entity.x / 32;
    var currentY = entity.y / 32;
    switch (direction) {
      case "left":
        if (this.gameWorld.tilemap[currentY][currentX - 1] === 10) {
          entity.x -= 32;
          entity.expectedPosition.x -= 32;
        }
        break;
      case "right":
        if (this.gameWorld.tilemap[currentY][currentX + 1] === 10) {
          entity.x += 32;
          entity.expectedPosition.x += 32;
        }
        break;
      case "up":
        if (this.gameWorld.tilemap[currentY - 1][currentX] === 10) {
          entity.y -= 32;
          entity.expectedPosition.y -= 32;
        }
        break;
      case "down":
        if (this.gameWorld.tilemap[currentY + 1][currentX] === 10) {
          entity.y += 32;
          entity.expectedPosition.y += 32;
        }
        break;
      default:
        break;
    }
  }

  moveToDot(io, entity) {
    this.move("right", entity);
  }

  moveToHero(io, entity) {
    this.move("left", entity);
  }

  moveToPowerUp(io, entity) {
    // TODO:
  }

  avoidGhost(io, entity) {
    // TODO:
  }

}
