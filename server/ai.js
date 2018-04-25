module.exports = class Ai {

  constructor(id) {
    var AI = this;
    this.playerID = id;
    this.active = false;
    this.actions = [{
        name: "MoveToDot",
        score: 0,
        function: (io) => {
          AI.moveToDot(io);
        }
      },
      {
        name: "MoveToHero",
        score: 0,
        function: (io) => {
          AI.moveToHero(io);
        }
      },
      {
        name: "MoveToPowerUp",
        score: 0,
        function: (io) => {
          AI.moveToPowerUp(io);
        }
      },
      {
        name: "AvoidGhost",
        score: 0,
        function: (io) => {
          AI.avoidGhost(io);
        }
      },
    ];
  }

  update(io, entities) {
    if (this.active) {
      var entity = entities.players[this.playerID];
      this.checkConditions(entity, entities);
      console.log(entity);
      this.activateAction(io);
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

  activateAction(io) {
    var activeAction;
    var highScore = 0;
    this.actions.forEach(function(action) {
      if (action.score > highScore) {
        activeAction = action;
        highScore = action.score;
      }
    });
    activeAction.function(io);
  }

  moveToDot(io) {
    // TODO:
  }

  moveToHero(io) {
    // TODO:
  }

  moveToPowerUp(io) {
    // TODO:
  }

  avoidGhost(io) {
    // TODO:
  }

}
