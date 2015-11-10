'use strict';

/* Services */

(function() {
  var minerServices = angular.module('minerServices', ['ngResource']);

  minerServices.factory('GameData', function() {
    var gameData = {
      fieldHeight: 10,
      fieldWidth: 10,
      mineCount: 10
    };

    return {
      setGameData: function(newGameData) {
        gameData = newGameData;
      },

      getGameData: function() {
        return {
          fieldHeight: gameData.fieldHeight,
          fieldWidth: gameData.fieldWidth,
          mineCount: gameData.mineCount
        };
      }
    };
  });
})();
