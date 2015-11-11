'use strict';

/* App Module */

(function(angular) {
  var minerApp = angular.module('minerApp', [
    'minerAnimations',
    'minerControllers',
    'minerFilters',
    'minerServices',
    'minerClasses'
  ]);

  minerApp.directive('ngRightClick', function($parse) {
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

})(angular);
