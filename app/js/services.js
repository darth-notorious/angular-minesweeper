/*globals angular, localStorage*/
'use strict';

/* Services */

(function(angular) {
  angular.module('mswpServices', [])
  .factory('GameData', ['DB_NAME', function(DB_NAME) {
    var defaults =  {
      fieldHeight: 10,
      fieldWidth: 10,
      mineCount: 10
    };
    
    var gameData = localStorage[DB_NAME] ? angular.fromJson(localStorage[DB_NAME]) : defaults;

    return {
      setGameData: function(newGameData) {
        gameData = newGameData;
        localStorage[DB_NAME] = angular.toJson(newGameData);
      },

      getGameData: function() {
        return {
          fieldHeight: gameData.fieldHeight,
          fieldWidth: gameData.fieldWidth,
          mineCount: gameData.mineCount
        };
      }
    };
  }])
  
  .factory('2dGrid',['Vector', function(Vector) {
    var width = 10,
        height = 10,
        cells = [];
        
    return {
      setGridDimensions: function(options) {
        width = options.width;
        height = options.height;
        cells = [];
      },
      buildCellsArray: function(ContentConstructor) {
        
         for(var i = 0; i < height; i++) {
            for(var j = 0; j < width; j++) {
              cells.push(new ContentConstructor(new Vector(j, i)));
            }
          }
          
          return cells;
      },
      getRandomIndex: function() {
        var xIndex = Math.round(Math.random() * width),
            yIndex = Math.round(Math.random() * height);

        return (xIndex + yIndex * width);
      },
      isInside: function(pos) {
        return (pos.x >= 0 && pos.x < width)
                &&
               (pos.y >= 0 && pos.y < height);
      },

      getCell: function(pos) {
        return cells[pos.x + pos.y * width];
      },

      getIndex: function(cell) {
        return cells.indexOf(cell);
      },

      getNeighbours: function(cell) {
        var directions = [
              new Vector(-1, -1),
              new Vector(0, -1),
              new Vector(1, -1),
              new Vector(-1, 0),
              new Vector(1, 0),
              new Vector(-1, 1),
              new Vector(0, 1),
              new Vector(1, 1)
            ],
            neighbours = [],
            neighbourCellPos;

        for(var i = 0; i < directions.length; i++) {
          neighbourCellPos = cell.pos.plus(directions[i]);
          if(this.isInside(neighbourCellPos)) {
            neighbours.push(this.getCell(neighbourCellPos));
          }
        }

        return neighbours;
      },

      checkNeighbours: function(neighbourArr, predicate) {
        var filtered = neighbourArr.filter(predicate);

        return filtered.length;
      }     
      
    }
  }]);
})(angular);
