/*globals angular*/
'use strict';

/* Directives */

(function(angular){
	angular.module('mswpDirectives', [])
		.directive('ngRightClick', function($parse) {
			return function(scope, element, attrs) {
				var fn = $parse(attrs.ngRightClick);
				element.bind('contextmenu', function(event) {
					scope.$apply(function() {
						event.preventDefault();
						fn(scope, {$event:event});
					});
				});
			};
		});
})(angular)