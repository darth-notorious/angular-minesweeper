/*globals angular*/

'use strict';

(function(angular){
	angular.module('mswpConstants', [])
	.constant('GAME_EVENTS', {
		'GAME_OVER': 'gameEnded',
		'RESTART': 'userRestart',
		'NEW_GAME': 'startNew',
		'SETTINGS_CLOSED': 'settingsClose',
		'GAME_WON': 'victory',
		'GAME_LOST': 'loss'
	})
	.constant('GAME_STATES', {
		'RUNNING': 'running',
		'SETTINGS': 'settings',
		'ENDED': 'ended'
	})
	.constant('DB_NAME', 'mswpData');
})(angular);