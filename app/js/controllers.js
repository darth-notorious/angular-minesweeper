'use strict';

/* Controllers */

(function() {
  var minerControllers = angular.module('minerControllers', []);

  minerControllers.controller('GameCtrl', ['$scope', function($scope, GameData) {
    $scope.gameStatus = 'running';

    $scope.changeStatus = function(newStatus) {
      $scope.gameStatus = newStatus;
    };

    $scope.triggerNew = function() {
      $scope.$broadcast('startNew');
    };

    $scope.$on('settingsClose', function(_, needsRestart) {
        if(needsRestart) {
          $scope.triggerNew();
        }
        $scope.changeStatus('running');
    });

    $scope.$on('gameEnded', function(_, result) {
      $scope.gameStatus = 'ended';
      $scope.$broadcast(result);
    });

    $scope.$on('userRestart', function(_, withConfig) {
      if(withConfig) {
        $scope.changeStatus('settings');
      } else {
        $scope.triggerNew();
        $scope.changeStatus('running');
      }
    });
  }]);

  minerControllers.controller('SettingsCtrl', ['$scope', '$log', 'GameData', function($scope, $log, GameData) {
    $scope.gameData = GameData.getGameData();
    $scope.buttonText = 'Start New Game';

    $scope.closePan = function(cancel) {
      GameData.setGameData($scope.gameData);
      $scope.$emit('settingsClose', !cancel);
    };

    $scope.range = function(n) {
      return new Array(n);
    };
  }]);

  minerControllers.controller('FieldCtrl', [
    '$scope',
    'Vector',
    'Cell',
    '$timeout',
    'GameData',
    function($scope, Vector, Cell, $timeout, GameData) {
      $scope.gameData = GameData.getGameData();
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
          $scope.tableWidth = $scope.gameData.fieldWidth;
          $scope.cells = [];
          var minesLeft = $scope.gameData.mineCount;

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
      $scope.$on('startNew', $scope.startGame);

      $scope.loseGame = function() {
        $scope.$emit('gameEnded', 'loss');
      };

      $scope.winGame = function() {
        $scope.$emit('gameEnded', 'victory');
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
        targetCell.status = 'marked';
        $scope.checkMarks();
      };
  }]);

  minerControllers.controller('FinishCtrl', ['$scope', function($scope) {
    $scope.message = '';

    $scope.$on('victory', function() {
      $scope.message = 'Congratulations! You`ve won the game!';
    });

    $scope.$on('loss', function() {
      $scope.message = 'You`ve lost this time. Try to play once more!';
    });

    $scope.triggerRestart = function(withConfig) {
      $scope.$emit('userRestart', withConfig);
    };

  }]);
})();
