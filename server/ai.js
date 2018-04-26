module.exports = class Ai {

  constructor(id) {
    var AI = this;
    this.playerID = id;
    this.active = true;
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

  update(io, entities) {
    if (this.active) {
      var entity = entities.players[this.playerID];
      this.checkConditions(entity, entities);
      this.activateAction(io, entity);
    }
  }

  checkConditions(entity, entities) {
    this.resetScores();
    this.actions.forEach(function(action) {
      switch (action.name) {
        case "MoveToDot":
          if (entity.hero) {
            action.score++;

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

  moveToDot(io, entity) {
    console.log("entity: " + entity.id + " moveToDot");
    entity.expectedPosition.x -= 32;
    io.emit('move', entity);
  }

  moveToHero(io, entity) {
    console.log("entity: " + entity.id + " moveToHero");
    entity.expectedPosition.x -= 32;
    io.emit('move', entity);
  }

  moveToPowerUp(io, entity) {
    // TODO:
  }

  avoidGhost(io, entity) {
    // TODO:
  }

}
