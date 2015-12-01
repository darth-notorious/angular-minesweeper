/*globals angular*/
'use strict';

/* Controllers */

(function(angular) {
  var minerControllers = angular.module('minerControllers', []);

  minerControllers.controller('GameCtrl', ['$scope', 'GAME_EVENTS', 'GAME_STATES', function($scope, GAME_EVENTS, GAME_STATES) {
    $scope.GAME_STATES = GAME_STATES;
    $scope.gameStatus = GAME_STATES.RUNNING;
    

    $scope.changeStatus = function(newStatus) {
      $scope.gameStatus = newStatus;
    };

    $scope.triggerNew = function() {
      $scope.$broadcast(GAME_EVENTS.NEW_GAME);
    };

    $scope.$on(GAME_EVENTS.SETTINGS_CLOSED, function(_, needsRestart) {
        if(needsRestart) {
          $scope.triggerNew();
        }
        $scope.changeStatus(GAME_STATES.RUNNING);
    });

    $scope.$on(GAME_EVENTS.GAME_OVER, function(_, result) {
      $scope.changeStatus(GAME_STATES.ENDED);
      $scope.$broadcast(result);
    });

    $scope.$on(GAME_EVENTS.RESTART, function(_, withConfig) {
      if(withConfig) {
        $scope.changeStatus(GAME_STATES.SETTINGS);
      } else {
        $scope.triggerNew();
        $scope.changeStatus(GAME_STATES.RUNNING);
      }
    });
    
    $scope.range = function(n) {
        return new Array(n);
    };
  }]);

  minerControllers.controller('SettingsCtrl', [
    '$scope', 
    'GameData', 
    'GAME_EVENTS',
    function($scope, GameData, GAME_EVENTS) {
      $scope.gameData = GameData.getGameData();
      $scope.buttonText = 'Start New Game';
      
      $scope.convertDataToInt = function() {
        Object.keys($scope.gameData).forEach(function(key) {
          $scope.gameData[key] = parseInt($scope.gameData[key], 10)
        });
      };
      
      $scope.closePan = function(cancel) {
        GameData.setGameData($scope.gameData);
        $scope.$emit(GAME_EVENTS.SETTINGS_CLOSED , !cancel);
      }; 
  }]);

  minerControllers.controller('FieldCtrl', [
    '$scope',
    'Vector',
    'Cell',
    '$timeout',
    'GameData',
    'GAME_EVENTS',
    function($scope, Vector, Cell, $timeout, GameData, GAME_EVENTS) {
      $scope.gameData = GameData.getGameData();
      $scope.flagsCount = $scope.gameData.mineCount;
      $scope.tableWidth = 0;

      $scope.cells = [];

      $scope.isInside = function(pos) {
        return (pos.x >= 0 && pos.x < $scope.gameData.fieldWidth)
                &&
               (pos.y >= 0 && pos.y < $scope.gameData.fieldHeight);
      };

      $scope.getCell = function(pos) {
        return $scope.cells[pos.x + pos.y * $scope.gameData.fieldWidth];
      }

      $scope.getIndex = function(cell) {
        return $scope.cells.indexOf(cell);
      }

      $scope.getNeighbours = function(cell) {
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
          if($scope.isInside(neighbourCellPos)) {
            neighbours.push($scope.getCell(neighbourCellPos));
          }
        }

        return neighbours;
      }

      $scope.checkNeighbours = function(neighbourArr) {
        var chargedNeighbours = neighbourArr.filter(function(cell) {
          return cell.charged;
        });

        return chargedNeighbours.length;
      };

      $scope.checkMarks = function() {
        var markedCells = $scope.cells.filter(function(cell) {
          return cell.charged && cell.status == 'marked';
        });

        if(markedCells.length == $scope.gameData.mineCount) {
          $scope.winGame();
        }
      };

      $scope.getRandomIndex = function() {
        var xIndex = Math.round(Math.random() * $scope.gameData.fieldWidth),
            yIndex = Math.round(Math.random() * $scope.gameData.fieldHeight);

        return (xIndex + yIndex * $scope.gameData.fieldWidth);
      };

      $scope.startGame = function() {
          $scope.gameData = GameData.getGameData();
          $scope.cells = [];
          var minesLeft = $scope.flagsCount = $scope.gameData.mineCount;
          
          for(var i = 0; i < $scope.gameData.fieldHeight; i++) {
            for(var j = 0; j < $scope.gameData.fieldWidth; j++) {
              $scope.cells.push(new Cell(new Vector(j, i)));
            }
          }

          while(minesLeft > 0) {
            var randCell = $scope.cells[$scope.getRandomIndex()];
            if( randCell && !randCell.charged) {
              randCell.charged = true;
              minesLeft--;
            }
          }
      };

      $scope.startGame();
      $scope.$on(GAME_EVENTS.NEW_GAME, $scope.startGame);
      
      $scope.showMines = function() {
        $scope.cells.forEach(function(cell){
          if(cell.charged && cell.status === 'closed') cell.status = 'open';
        });
      };

      $scope.loseGame = function() {
        $scope.showMines();
        $timeout(function(){$scope.$emit(GAME_EVENTS.GAME_OVER, GAME_EVENTS.GAME_LOST);}, 300);
      };

      $scope.winGame = function() {
        $scope.$emit(GAME_EVENTS.GAME_OVER, GAME_EVENTS.GAME_WON);
      };

      $scope.handleClick = function(targetCell) {
        var cellsToCheck = [],
            added = {},
            targetCell,
            currentCell,
            neighbourCells,
            chargedNum;

        if(targetCell.charged) {
          targetCell.status = 'open';
          $timeout($scope.loseGame, 600);
          return false;
        }

        cellsToCheck.push(targetCell);
        added[$scope.getIndex(targetCell)] = true;

        while(cellsToCheck.length) {
            currentCell = cellsToCheck.pop();
            neighbourCells = $scope.getNeighbours(currentCell);
            chargedNum = $scope.checkNeighbours(neighbourCells);
            if(chargedNum) {
                currentCell.number = chargedNum;
            } else {
                currentCell.number = '';
                neighbourCells.forEach(function(cell){
                    if(!(cell.status == 'open') && !added[$scope.getIndex(cell)]) {
                        cellsToCheck.push(cell);
                        added[$scope.getIndex(cell)] = true;
                    }
                });
            }

            currentCell.setStatus('open');
        }
      };

      $scope.mark = function(targetCell) {
        
        if(targetCell.status === 'marked') {
          targetCell.status = 'closed';
          $scope.flagsCount++;
        } else if(targetCell.status === 'closed' && $scope.flagsCount > 0) {
          targetCell.status = 'marked';
          $scope.flagsCount--;
        }
        
        $scope.checkMarks();
      };
  }]);

  minerControllers.controller('FinishCtrl', ['$scope', 'GAME_EVENTS', function($scope, GAME_EVENTS) {
    $scope.message = '';

    $scope.$on(GAME_EVENTS.GAME_WON, function() {
      $scope.message = 'Congratulations! You`ve won the game!';
    });

    $scope.$on(GAME_EVENTS.GAME_LOST, function() {
      $scope.message = 'You`ve lost this time. Try to play once more!';
    });

    $scope.triggerRestart = function(withConfig) {
      $scope.$emit(GAME_EVENTS.RESTART, withConfig);
    };

  }]);
})(angular);
