'use strict';

var angular = require('angular');

var isFunction = angular.isFunction,
    isString = angular.isString;

function StateInterceptorService($q, $injector, $cacheFactory) {
    var cache = $cacheFactory('$stateInterceptors');

    function resolveInterceptor(name) {
        var interceptor = function (result) { return result; };

        interceptor.$inject = [name];

        return $injector.invoke(interceptor);
    }

    function getInterceptor(name) {
        var interceptor = cache.get(name);

        if (!interceptor) {
            interceptor = resolveInterceptor(name);

            cache.put(name, interceptor);
        }

        return interceptor;
    }

    function getInterceptors(state) {
        var data = (state && state.data) || {},
            interceptors = data.interceptors || [];

        return interceptors.map(function(interceptor) {
            return isString(interceptor) ? getInterceptor(interceptor) : interceptor;
        }).filter(function(interceptor) {
            return interceptor && isFunction(interceptor.intercept);
        });
    }

    function interceptAll(state, params, options) {
        return getInterceptors(state).map(function(interceptor) {
            return interceptor.intercept(state, params, options);
        });
    }

    return {
        intercept: function(state, params, options) {
            return $q.all(interceptAll(state, params, options));
        }
    };
}

StateInterceptorService.$inject = [
    '$q',
    '$injector',
    '$cacheFactory'
];

module.exports = StateInterceptorService;
