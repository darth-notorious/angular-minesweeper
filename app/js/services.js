/*globals angular, localStorage*/
'use strict';

/* Services */

(function(angular) {
  var minerServices = angular.module('minerServices', []);

  minerServices.factory('GameData', ['DB_NAME', function(DB_NAME) {
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
  }]);
})(angular);
