/*! angular-retina - v0.2.2 - 2013-11-14
* https://github.com/jrief/angular-retina
* Copyright (c) 2013 Jacob Rief; Licensed MIT */
(function (angular, undefined) {
  'use strict';
  angular.module('ngRetina', []).config([
    '$provide',
    function ($provide) {
      $provide.decorator('ngSrcDirective', [
        '$delegate',
        function ($delegate) {
          $delegate[0].compile = function (element, attrs) {
          };
          return $delegate;
        }
      ]);
    }
  ]).directive('ngSrc', [
    '$window',
    '$http',
    function ($window, $http) {
      var msie = parseInt((/msie (\d+)/.exec($window.navigator.userAgent.toLowerCase()) || [])[1], 10);
      var isRetina = function () {
          var mediaQuery = '(-webkit-min-device-pixel-ratio: 1.5), (min--moz-device-pixel-ratio: 1.5), ' + '(-o-min-device-pixel-ratio: 3/2), (min-resolution: 1.5dppx)';
          if ($window.devicePixelRatio > 1)
            return true;
          return $window.matchMedia && $window.matchMedia(mediaQuery).matches;
        }();
      function getHighResolutionURL(url, replaceValue, forValue) {
        var parts = url.split('.');
        if (parts.length < 2)
          return url;
        if (replaceValue && forValue) {
          return url.replace(replaceValue, forValue);
        } else {
          parts[parts.length - 2] += '@2x';
        }
        return parts.join('.');
      }
      return function (scope, element, attrs) {
        if (element[0].hasAttribute('ng-retina-replace')) {
          var replaceExpr = element[0].getAttribute('ng-retina-replace').split(' for ');
          var replaceValue = replaceExpr[0].trim();
          var forValue = replaceExpr[1].trim();
        }
        if (element[0].hasAttribute('ng-retina-config')) {
          var configExpr = element[0].getAttribute('ng-retina-config').split(':');
          var keepRetinaSize = configExpr[1].trim() === 'true';
        }
        function setImgSrc(img_url) {
          attrs.$set('src', img_url);
          if (!keepRetinaSize) {
            attrs.$set('width', '50%');
          }
          if (msie)
            element.prop('src', img_url);
        }
        function set2xVariant(img_url) {
          var img_url_2x = $window.sessionStorage.getItem(img_url);
          if (!img_url_2x) {
            img_url_2x = getHighResolutionURL(img_url, replaceValue, forValue);
            setImgSrc(img_url_2x);
            $window.sessionStorage.setItem(img_url, img_url_2x);
          } else {
            setImgSrc(img_url_2x);
          }
        }
        attrs.$observe('ngSrc', function (value) {
          if (!value)
            return;
          if (isRetina && typeof $window.sessionStorage === 'object') {
            set2xVariant(value);
          } else {
            setImgSrc(value);
          }
        });
      };
    }
  ]);
}(window.angular));