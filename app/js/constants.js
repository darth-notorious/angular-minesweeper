/*globals angular*/

'use strict';

(function(){
	angular.constant('GAME_EVENTS', {
		'GAME_OVER': 'gameEnded',
		'RESTART': 'userRestart',
		'NEW_GAME': 'startNew',
		'SETTINGS_CLOSED': 'settingsClose',
		'GAME_WON': 'victory',
		'GAME_LOST': 'loss'
	});
})();