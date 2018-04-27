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

  getClosestEntity(entity, entities, targetType) {
    var ai = this;
    var target = {
      x: 0,
      y: 0,
      distance: 999
    };
    Object.keys(entities).forEach(function(type) {
      if (type === targetType) {
        Object.keys(entities[type]).forEach(function(id) {
          var targetXIndex = entities[type][id].x / 32;
          var targetYIndex = entities[type][id].y / 32;


          var targetDistance = ai.calculateDistance(entity.x / 32, entity.y / 32, targetXIndex, targetYIndex);
          if (target.distance > targetDistance) {
            target.x = targetXIndex;
            target.y = targetYIndex;
            target.distance = targetDistance;
          }
        });
      }
    });
    return target;
  }

  getHero(entity){
    var target = {
      x : 0,
      y : 0
    }
    var ai = this;
    Object.keys(ai.gameWorld.entities.players).forEach(function(id) {
      if(ai.gameWorld.entities.players[id].hero){
          target.x = ai.gameWorld.entities.players[id].x / 32;;
          target.y = ai.gameWorld.entities.players[id].y / 32;;
        }
      });
      return target;
  }

  calculatePath(target, entity) {
    // based on an introduction to A* path finding article found here : https://www.raywenderlich.com/4946/introduction-to-a-pathfinding
    var ai = this;
    var open = [];
    var closed = [];
    var tilemap = this.gameWorld.tilemap;
    var walkable = 10;
    var currentTile = {
      x: entity.x / 32,
      y: entity.y / 32,
      f: 0, // overall Score g + h
      g: 0, // distance from starting tile
      h: ai.calculateDistance(entity.x / 32, entity.y / 32, target.x, target.y), // distance to target
      direction: "",
      parent: {}
    };

    currentTile.f = currentTile.g + currentTile.h;
    var pathFound = false;
    var path = {};

    open.push(currentTile)
    do {
      currentTile = this.getLowestFScoreTile(open); // Get the square with the lowest F score

      closed.push(currentTile); // add the current square to the closed list
      var indexOTile = open.indexOf(currentTile);
      open.splice(indexOTile, 1); // remove it from the open list
      closed.forEach(function(tile) { // if we added the destination to the closed list, we've found a path
        if (tile.x == target.x && tile.y == target.y) { // PATH FOUND
          pathFound = true;
          path = tile;
        }
      });
      if (pathFound === true) { // break the loop
        break;
      }

      var adjacentTiles = this.getAdjacentTiles(currentTile); // Retrieve all its walkable adjacent tiles

      adjacentTiles.forEach(function(tile) {
        var tileFoundInClosed = false;
        closed.forEach(function(closedTile) {
          if (closedTile.x == tile.x && closedTile.y == tile.y) {
            tileFoundInClosed = true;
          }
        });
        if (tileFoundInClosed === true) { // skip the tile
          return;
        }

        var tileFoundInOpen = false;
        open.forEach(function(openTile) {
          if (openTile.x == tile.x && openTile.y == tile.y) {
            tileFoundInOpen = true;
          }
        });

        if (!tileFoundInOpen) {
          open.push({
            x: tile.x,
            y: tile.y,
            f: (currentTile.g + 1) + ai.calculateDistance(tile.x, tile.y, target.x, target.y), // overall Score g + h
            g: currentTile.g + 1, // distance from starting tile
            h: ai.calculateDistance(tile.x, tile.y, target), // distance to target
            direction: tile.direction,
            parent: currentTile
          })
        } else {
          // if its already in the open list
          // test if using the current G score make the aSquare F score lower, if yes update the parent because it means its a better path
          open.forEach(function(openTile) {
            if (openTile.x == tile.x && openTile.y == tile.y) {
              if (openTile.f > ((currentTile.g + 1) + ai.calculateDistance(tile.x, tile.y, target.x, target.y))) {
                openTile.parent = currentTile;
              }
            }
          });
        }
      });
    } while (open.length > 0); // Continue until there is no more available tiles in the open list (which means there is no path)
    if (path != null) {
      return this.processPath(path);
    } else {
      console.log("Path Not Found");
    }
  }

  processPath(path){
    var directions = [];
    var child = path;
    var gScore = child.g;
    var parent = child.parent;
    directions.push(child.direction);

    while (gScore != 0) {
      child = parent;
      parent = child.parent;
      if(child.direction != ""){
          directions.push(child.direction);
      }
      gScore = child.g;
    }
    return directions.reverse();
  }

  printParents(tile) {
    if (tile.parent != null) {
      console.log(tile.parent);
      this.printParents(tile.parent);
    }
  }

  calculateDistance(tileX, tileY, targetX, targetY) {
    var xDistance = tileX - targetX;
    var yDistance = tileY - targetY;

    if (xDistance < 0) {
      xDistance = xDistance - (xDistance * 2)
    }

    if (yDistance < 0) {
      yDistance = yDistance - (yDistance * 2);
    }

    return xDistance + yDistance;
  }

  getLowestFScoreTile(open) {
    var lowestScore = 100;
    var bestTile;
    open.forEach(function(tile) {
      if (tile.f < lowestScore) {
        lowestScore = tile.f;
        bestTile = tile;
      }
    });
    return bestTile;
  }

  getAdjacentTiles(currentTile) {
    var tiles = [];
    if (this.gameWorld.tilemap[currentTile.y][currentTile.x - 1] === 10) {
      tiles.push({
        x: currentTile.x - 1,
        y: currentTile.y,
        direction: "left"
      })
    }

    if (this.gameWorld.tilemap[currentTile.y][currentTile.x + 1] === 10) {
      tiles.push({
        x: currentTile.x + 1,
        y: currentTile.y,
        direction: "right"
      })
    }

    if (this.gameWorld.tilemap[currentTile.y - 1][currentTile.x] === 10) {
      tiles.push({
        x: currentTile.x,
        y: currentTile.y - 1,
        direction: "up"
      })
    }

    if (this.gameWorld.tilemap[currentTile.y + 1][currentTile.x] === 10) {
      tiles.push({
        x: currentTile.x,
        y: currentTile.y + 1,
        direction: "down"
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
    var target = this.getClosestEntity(entity, this.gameWorld.entities, "dots")
    var directions = this.calculatePath(target, entity);
    this.move(directions[0], entity);
  }

  moveToHero(io, entity) {
    var target = this.getHero(entity)
    var directions = this.calculatePath(target, entity);
    this.move(directions[0], entity);
  }

  moveToPowerUp(io, entity) {
    // TODO:
  }

  avoidGhost(io, entity) {
    // TODO:
  }

}
