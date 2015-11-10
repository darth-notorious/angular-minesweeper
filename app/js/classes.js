'use strict';

/* Custom Constructor Functions */

(function(angular) {
  var minerClasses = angular.module('minerClasses', []);

  minerClasses.factory('Vector', function() {
    function Vector(x, y) {
      this.x = x;
      this.y = y;
    }

    Vector.prototype.plus = function(otherVector) {
      return new Vector(this.x + otherVector.x, this.y + otherVector.y);
    };

    Vector.prototype.minus = function(otherVector) {
      return new Vector(this.x - otherVector.x, this.y - otherVector.y);
    };

    return (Vector);
  });

  minerClasses.factory('Cell', function() {

    function Cell(pos) {
      this.pos = pos;
      this.status = 'closed';
      this.charged = false;
    }

    Cell.prototype.setStatus = function(status) {
      this.status = status;
    };

    return (Cell);

  });
})(angular);
