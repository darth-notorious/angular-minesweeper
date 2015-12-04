/*globals angular*/
'use strict';

/* Controllers */

(function(angular) {
  angular.module('mswpControllers', [])
  .controller('GameCtrl', [
    '$scope', 
    'GAME_EVENTS', 
    'GAME_STATES', 
    function($scope, GAME_EVENTS, GAME_STATES) {
      $scope.GAME_STATES = GAME_STATES;
      $scope.gameStatus = GAME_STATES.RUNNING;
      
      $scope.needsBackdrop = function() {
        return ($scope.gameStatus === GAME_STATES.SETTINGS) || ($scope.gameStatus === GAME_STATES.ENDED);
      };
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
  }])
  .controller('SettingsCtrl', [
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
  }])
  .controller('FieldCtrl', [
    '$scope',
    'Vector',
    'Cell',
    '$timeout',
    'GameData',
    'GAME_EVENTS',
    '$log',
    '2dGrid',
    function($scope, Vector, Cell, $timeout, GameData, GAME_EVENTS, $log, twoDGrid) {
      $scope.gameData = GameData.getGameData();
      $scope.flagsCount = $scope.gameData.mineCount;
      $scope.tableWidth = 0;

      $scope.cells = [];

      $scope.startGame = function() {
          $scope.gameData = GameData.getGameData();
          twoDGrid.setGridDimensions({
            width: $scope.gameData.fieldWidth,
            height: $scope.gameData.fieldHeight
          });
          $scope.cells = twoDGrid.buildCellsArray(Cell);
          
          var minesLeft = $scope.flagsCount = $scope.gameData.mineCount;

          while(minesLeft > 0) {
            var randCell = $scope.cells[twoDGrid.getRandomIndex()];
            if( randCell && !randCell.charged) {
              randCell.charged = true;
              minesLeft--;
            }
          }
      };
      
      $scope.getCell = function(pos) {
        return twoDGrid.getCell(pos);
      }
      
      $scope.mark = function(cell) {
        if(cell.status === 'open') return false;
        if(cell.status === 'closed') {
          cell.status = 'marked';
           $scope.flagsCount--;
        } else if(cell.status === 'marked') {
          cell.status = 'closed';
          $scope.flagsCount++;
        }
      };
      
      $scope.checkMarks = function() {
        var markedCells = $scope.cells.filter(function(cell) {
          return cell.charged && cell.status == 'marked';
        });

        if(markedCells.length == $scope.gameData.mineCount) {
          $scope.winGame();
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
            
        if(targetCell.status === 'marked') return false;
             
        if(targetCell.charged) {
          targetCell.status = 'open';
          $timeout($scope.loseGame, 600);
          return false;
        }

        cellsToCheck.push(targetCell);
        added[twoDGrid.getIndex(targetCell)] = true;

        while(cellsToCheck.length) {
            currentCell = cellsToCheck.pop();
            neighbourCells = twoDGrid.getNeighbours(currentCell);
            chargedNum = neighbourCells.filter(function(cell){
              return cell.charged;
            }).length;
            if(chargedNum) {
                currentCell.number = chargedNum;
            } else {
                currentCell.number = '';
                neighbourCells.forEach(function(cell){
                    if(!(cell.status == 'open') && !added[twoDGrid.getIndex(cell)]) {
                        cellsToCheck.push(cell);
                        added[twoDGrid.getIndex(cell)] = true;
                    }
                });
            }

            currentCell.setStatus('open');
        }
      };
  }])
  
  .controller('FinishCtrl', ['$scope', 'GAME_EVENTS', function($scope, GAME_EVENTS) {
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
