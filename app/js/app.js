'use strict';

/* App Module */

(function(angular) {
  var minerApp = angular.module('minerApp', [
  //  'ngRoute',
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

  /*minerApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/settings', {
      templateUrl: 'partials/settings.html',
      controller: 'SettingsCtrl'
    })
    .when('/field', {
      templateUrl: 'partials/field.html',
      controller: 'GameCtrl'
    })
    .when('/result', {
      templateUrl: 'partials/finish.html',
      controller: 'ResultCtrl'
    })
    .otherwise({
      redirectTo: '/settings'
    });
  }]);*/
})(angular);
