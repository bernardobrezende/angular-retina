/*
 * angular-retina
 *
 *  Original source:
 *  https://github.com/jrief/angular-retina
 *
 *  This is a fork with specific feature for replacing the '@2x' lookup pattern.
 *
 *  Add support for Retina displays when using element attribute "ng-src".
 *  This module overrides the built-in directive "ng-src" with one which
 *  distinguishes between standard or high-resolution (Retina) displays.
 *
 *  Copyright (c) 2013 Jacob Rief
 *  Licensed under the MIT license.
 */

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
      var isRetina = (function () {
          var mediaQuery = '(-webkit-min-device-pixel-ratio: 1.5), (min--moz-device-pixel-ratio: 1.5), ' + '(-o-min-device-pixel-ratio: 3/2), (min-resolution: 1.5dppx)';
          if ($window.devicePixelRatio > 1)
            return true;
          return $window.matchMedia && $window.matchMedia(mediaQuery).matches;
      })();
      function getHighResolutionURL(url, replaceValue, forValue) {

        var parts = url.split('.');
        if (parts.length < 2)
          return url;

        if (replaceValue && forValue) {
          return url.replace(replaceValue, forValue);
        } else {
          // if replace expression is not given, search for @2x standard
          parts[parts.length - 2] += '@2x';
        }
        return parts.join('.');
      }
      return function (scope, element, attrs) {

        var replaceValue, forValue;

        if (element[0].hasAttribute('ng-retina-replace')) {
          // parsing ng-retina-replace expression.
          // e.g: <img ng-retina-replace="preview for preview_hd"></img>
          var replaceExpr = element[0].getAttribute('ng-retina-replace').split(' for ');
          replaceValue = replaceExpr[0].trim();
          forValue = replaceExpr[1].trim();
        } else {
          // if any ng-retina-replace is given, hack to keep using the same ngSrc.
          replaceValue = forValue = attrs.ngSrc;
        }

        var resizeImage;

        if (element[0].hasAttribute('ng-retina-config')) {
          // parsing config element
          // e.g: <img ng-retina-config="resizeImage: true"></img>
          var configExpr = element[0].getAttribute('ng-retina-config').split(':');
          resizeImage = configExpr[1].trim() === 'true';
        } else {
          // tell module to not resize
          resizeImage = false;
        }

        function setImgSrc(img_url) {
          attrs.$set('src', img_url);

          if (resizeImage) {
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
