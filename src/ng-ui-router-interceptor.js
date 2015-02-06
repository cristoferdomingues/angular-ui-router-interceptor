'use strict';

var copy = angular.copy,
    extend = angular.extend,
    isFunction = angular.isFunction,
    isString = angular.isString,
    isObject = angular.isObject;

function StateInterceptorDecorator($delegate, $stateParams, stateInterceptor) {
    var transitionTo = $delegate.transitionTo;

    $delegate.transitionTo = function (to, toParams, options) {
        var stateParams = extend({}, copy($delegate.params), copy($stateParams), copy(toParams)),
            state = $delegate.get(to, toParams);

        return stateInterceptor.intercept(state, stateParams).then(function (interceptions) {
            state.$interceptions = interceptions;

            return transitionTo(to, toParams, options);
        });
    };

    return $delegate;
}

StateInterceptorDecorator.$inject = [
    '$delegate',
    '$stateParams',
    'stateInterceptor'
];

function StateInterceptorConfig($provide) {
    $provide.decorator('$state', StateInterceptorDecorator);
}

StateInterceptorConfig.$inject = [
    '$provide'
];

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
        var data = state.data || {},
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

function StateInterceptorRunner($rootScope, $state) {
    $rootScope.$on('$stateChangeStart', function(event, toState) {
        var interceptions = toState.$interceptions || [],
            interception = interceptions.find(isObject);

        if (interception) {
            event.preventDefault();

            $state.go(interception.state, interception.params, interception.options);

            delete toState.$interceptions;
        }
    });
}

StateInterceptorRunner.$inject = [
    '$rootScope',
    '$state'
];

angular.module('ui.router.interceptor', ['ui.router'])
    .config(StateInterceptorConfig)
    .service('stateInterceptor', StateInterceptorService)
    .run(StateInterceptorRunner);
