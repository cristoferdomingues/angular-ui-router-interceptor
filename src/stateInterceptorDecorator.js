'use strict';

var angular = require('angular');

var copy = angular.copy,
    extend = angular.extend;

function StateInterceptorDecorator($delegate, $stateParams, stateInterceptor) {
    var transitionTo = $delegate.transitionTo;

    $delegate.transitionTo = function (to, toParams, options) {
        var stateParams = extend({}, copy($delegate.params), copy($stateParams), copy(toParams)),
            state = $delegate.get(to, toParams);

        return stateInterceptor.intercept(state, stateParams).then(function (interceptions) {
            if (state) {
                state.$interceptions = interceptions;
            }

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

module.exports = StateInterceptorDecorator;
