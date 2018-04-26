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

            if (ai.checkDistanceToEntity(entity, entities, "dots") > 2) {
              action.score++;
            }
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
    var xDirection = "";
    var yDirection = "";
    var ai = this;
    console.log("////////////////");
    Object.keys(entities).forEach(function(type) {
      if (type === targetType) {
        Object.keys(entities[type]).forEach(function(id) {


          var targetTypeXIndex = entities[type][id].x / 32;
          var targetTypeYIndex = entities[type][id].y / 32;

          var xDistance = xIndex - targetTypeXIndex;
          var yDistance = yIndex - targetTypeYIndex;

          if (xDistance < 0) {
            xDirection = "left";
            xDistance = xDistance - (xDistance * 2)
          } else {
            xDirection = "right";
          }

          if (yDistance < 0) {
            yDirection = "up";
            yDistance = yDistance - (yDistance * 2);
          } else {
            yDirection = "down";
          }
          var target = {
            yDirection: yDirection,
            xDirection: xDirection,
            xIndex: targetTypeXIndex,
            yIndex: targetTypeYIndex,
            xDistance: xDistance,
            yDistance: yDistance
          }
          ai.calculatePath(target, entity);


          console.log("xDistance: " + xDistance + " xDirection: " + xDirection + " yDistance: " + yDistance + " yDirection: " + yDirection)
        });
      }
    });

    console.log("\\\\\\\\\\\\\\");
  }

  calculatePath(target, entity) {
    // based on an introduction to A* path finding article found here : https://www.raywenderlich.com/4946/introduction-to-a-pathfinding
    var open = [];
    var closed = [];
    var tilemap = this.gameWorld.tilemap;
    var walkable = 10;
    var currentTile = {
        x: entity.x / 32,
        y: entity.y / 32,
      f: 0,
      g: 0,
      h: target.xDistance + target.yDistance,
      parent: {}
    };
    currentTile.f = currentTile.g + currentTile.h;
    var pathFound = false;

    open.push(currentTile)
    do {
    	currentTile = this.getLowestFScoreTile(open); // Get the square with the lowest F score

    	closed.push(currentTile); // add the current square to the closed list
      var indexOTile = open.indexOf(currentTile);
      open.splice(indexOTile, 1); // remove it from the open list

      closed.forEach(function(tile) { // if we added the destination to the closed list, we've found a path
        if (tile.x == target.xIndex && tile.y == target.yIndex){// PATH FOUND
          pathFound = true;
          break;
        }
      });
      if(pathFound === true){ // break the loop
        break;
      }

    	var adjacentTiles = this.getAdjacentTiles(currentTile); // Retrieve all its walkable adjacent tiles

      adjacentTiles.forEach(function(tile){
        var tileFoundInClosed = false;
        closed.forEach(function(closedTile) {
          if (closedTile.x == tile.x && closedTile.y == tile.y){
            tileFoundInClosed = true;
            break;
          }
        });
        if(tileFoundInClosed === true){ // skip the tile
          continue;
        }

        var tileFoundInOpen = false;
        open.forEach(function(openTile) {
          if (openTile.x == tile.x && openTile.y == tile.y){
            tileFoundInOpen = true;
            break;
          }
        });

        if(!tileFoundInOpen){
          // Compute score , set parent
          // add to open list
        }else{
          // if its already in the open list

      			// test if using the current G score make the aSquare F score lower, if yes update the parent because it means its a better path

        }

      });

    } while(open.length > 0); // Continue until there is no more available square in the open list (which means there is no path)

  }

  getLowestFScoreTile(open){
    var lowestScore = 100;
    var bestTile;
    open.forEach(function(tile) {
      if (tile.f < lowestScore){
        lowestScore = tile.f;
        bestTile = tile;
      }
    });
    return bestTile;
  }

  getAdjacentTiles(currentTile){
    var tiles = {};
    if (this.gameWorld.tilemap[currentTile.y][currentTile.x - 1] === 10) {
      tiles.push({
          x: currentTile.x - 1,
          y: currentTile.y
        })
    }

    if (this.gameWorld.tilemap[currentTile.y][currentTile.x + 1] === 10) {
      tiles.push({
          x: currentTile.x + 1,
          y: currentTile.y
        })
    }

    if (this.gameWorld.tilemap[currentTile.y - 1][currentTile.x] === 10) {
      tiles.push( {
          x: currentTile.x,
          y: currentTile.y - 1
        })
    }

    if (this.gameWorld.tilemap[currentTile.y + 1][currentTile.x] === 10) {
      tiles.push({
          x: currentTile.x,
          y: currentTile.y + 1
        })
    }
        return tiles;
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
