'use strict';

describe('test module angular-retina', function() {
  var $window;

  describe('on high resolution displays', function() {
    var $httpBackend, scope;

    beforeEach(function() {
      module(function($provide) {
        $provide.provider('$window', function() {
          this.$get = function() {
            try {
              window.devicePixelRatio = 2;
            } catch (TypeError) {
              // in Firefox window.devicePixelRatio only has a getter
            }
            window.matchMedia = function(query) {
              return {matches: true};
            };
            return window;
          };
        });
      });
      module('ngRetina');
    });

    beforeEach(inject(function($injector, $rootScope) {
      scope = $rootScope.$new();
      $httpBackend = $injector.get('$httpBackend');
    }));

    afterEach(function() {
        window.sessionStorage.removeItem("/image.png");
        window.sessionStorage.removeItem("/picture.png");
    });

    describe('for static "ng-src" tags', function() {
      it('should set src tag with a highres image', inject(function($compile) {
        var element = angular.element('<input ng-src="/image.png" ng-retina-replace=".png for @2x.png">');
        $compile(element)(scope);
        scope.$digest();
        expect(element.attr('src')).toBe('/image@2x.png');
      }));

      it('should set src tag with a highres image with custom ng-retina-replace', inject(function($compile) {
        var element = angular.element('<input ng-src="/image.png" ng-retina-replace=".png for HD.png">');
        $compile(element)(scope);
        scope.$digest();
        expect(element.attr('src')).toBe('/imageHD.png');
      }));
    });

    describe('for marked up "ng-src" tags', function() {
      var element;

      beforeEach(inject(function($compile) {
        element = angular.element('<input ng-src="/{{image_url}}" ng-retina-replace=".png for @2x.png">');
        scope.image_url = 'image.png';
        $compile(element)(scope);
        scope.$digest();
      }));

      it('should copy content from "ng-src" to "src" tag', function() {
        expect(element.attr('src')).toBe('/image@2x.png');
      });

      describe('should observe scope.image_url', function() {
        beforeEach(function() {
          scope.image_url = 'picture.png';
          scope.$digest();
        });

        it('and replace src tag with another picture', function() {
          expect(element.attr('src')).toBe('/picture@2x.png');
        });

        it('and check if the client side cache is working', function() {
          scope.image_url = 'image.png';
          scope.$digest();
          expect(element.attr('src')).toBe('/image@2x.png');
        });
      });
    });

    describe('for marked up "ng-src" and "ng-retina-replace" tags', function() {
      var element;

      beforeEach(inject(function($compile) {
        element = angular.element('<input ng-src="/{{image_url}}" ng-retina-replace=".png for @twoX.png">');
        scope.image_url = 'image.png';
        $compile(element)(scope);
        scope.$digest();
      }));

      it('should copy content from "ng-src" to "src" tag', function() {
        expect(element.attr('src')).toBe('/image@twoX.png');
      });

      describe('should observe scope.image_url', function() {
        beforeEach(function() {
          scope.image_url = 'newpicture.png';
          scope.$digest();
        });

        it('and replace src tag with another picture', function() {
          expect(element.attr('src')).toBe('/newpicture@twoX.png');
        });

        // TODO: uncomment and solve the 'Error: No pending request to flush !'
        //it('and check if the client side cache is working', function() {
          //scope.image_url = 'image.png';
          //scope.$digest();
          //expect(element.attr('src')).toBe('/image@twoX.png');
        //});
      });
    });

    //describe('if the high resolution image is not available', function() {

      //it('should copy content from "ng-src" to "src" tag', inject(function($compile) {
        //var element = angular.element('<input ng-src="/image.png">');
        //$compile(element)(scope);
        //scope.$digest();
        //expect(element.attr('src')).toBe('/image.png');
      //}));

      //it('should copy content from scope object to "src" tag', inject(function($compile) {
        //var element = angular.element('<input ng-src="/{{image_url}}">');
        //scope.image_url = 'image.png';
        //$compile(element)(scope);
        //scope.$digest();
        //expect(element.attr('src')).toBe('/image.png');
      //}));
    //});
  });

  describe('on standard resolution displays using images in their low resolution version', function() {
    var $httpBackend, scope;

    beforeEach(function() {
      module(function($provide) {
        $provide.provider('$window', function() {
          this.$get = function() {
            try {
              window.devicePixelRatio = 1;
            } catch (TypeError) {
              // in Firefox window.devicePixelRatio only has a getter
            }
            window.matchMedia = function(query) {
              return {matches: false};
            };
            return window;
          };
        });
      });
      module('ngRetina');
    });

    beforeEach(inject(function($rootScope) {
      scope = $rootScope.$new();
    }));

    it('should copy content from "ng-src" to "src" tag', inject(function($compile) {
      var element = angular.element('<input ng-src="/image.png">');
      $compile(element)(scope);
      scope.$digest();
      expect(element.attr('src')).toBe('/image.png');
    }));

    it('should copy content from "ng-src" to "src" tag even with ng-retina-replace', inject(function($compile) {
      var element = angular.element('<input ng-src="/image.png" ng-retina-replace=".png for HD.png">');
      $compile(element)(scope);
      scope.$digest();
      expect(element.attr('src')).toBe('/image.png');
    }));

    it('should copy content from scope object to "src" tag', inject(function($compile) {
      var element = angular.element('<input ng-src="/{{image_url}}">');
      scope.image_url = 'image.png';
      $compile(element)(scope);
      scope.$digest();
      expect(element.attr('src')).toBe('/image.png');
    }));

    it('should copy content from scope object to "src" tag even with ng-retina-replace', inject(function($compile) {
      var element = angular.element('<input ng-src="/{{image_url}}" ng-retina-replace=".png for @ret.png">');
      scope.image_url = 'image.png';
      $compile(element)(scope);
      scope.$digest();
      expect(element.attr('src')).toBe('/image.png');
    }));
  });

});
