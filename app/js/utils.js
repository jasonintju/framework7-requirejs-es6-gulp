define([], function () {
  'use strict';

  var Utils = {

    /**
     * Bind DOM event to some handler function in controller.
     * @param  {Array} bindings
     */
    bindEvents: function (bindings) {
      if ($$.isArray(bindings) && bindings.length > 0) {
        bindings.forEach(function (binding) {
          if (binding.target) { // Live binding
            $$(binding.element).on(binding.event, binding.target, binding.handler);
          } else {
            $$(binding.element).on(binding.event, binding.handler);
          }
        });
      }
    },

    /**
     * Unbind DOM event to some handler function in controller.
     * @param  {Array} bindings
     */
    unbindEvents: function (unbindings) {
      if ($$.isArray(unbindings) && unbindings.length > 0) {
        unbindings.forEach(function (unbinding) {
          if (unbinding.target) { // Live unbinding
            $$(unbinding.element).off(unbinding.event, unbinding.target, unbinding.handler);
          } else {
            $$(unbinding.element).off(unbinding.event, unbinding.handler);
          }
        });
      }
    },

    /**
     * Merge some JavaScript objects into one object.
     * https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
     * @param  {Object} target
     * @return {Object}
     */
    extend: function (target) {
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var output = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source !== undefined && source !== null) {
          for (var nextKey in source) {
            if (source.hasOwnProperty(nextKey)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
      }
      return output;
    },

    /**
     * Converts an object to x-www-form-urlencoded serialization.
     * http://victorblog.com/2012/12/20/make-angularjs-http-service-behave-like-jquery-ajax/
     * @param  {Object} obj
     * @return {String}
     */
    serialize: function (obj) {
      var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

      for (name in obj) {
        value = obj[name];

        if (value instanceof Array) {
          for (i = 0; i < value.length; ++i) {
            subValue = value[i];
            fullSubName = name + '[' + i + ']';
            innerObj = {};
            innerObj[fullSubName] = subValue;
            query += serialize(innerObj) + '&';
          }
        }
        else if (value instanceof Object) {
          for (subName in value) {
            subValue = value[subName];
            fullSubName = name + '[' + subName + ']';
            innerObj = {};
            innerObj[fullSubName] = subValue;
            query += serialize(innerObj) + '&';
          }
        }
        else if (value !== undefined && value !== null)
          query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
      }

      return query.length ? query.substr(0, query.length - 1) : query;
    }
  };

  return Utils;
});
