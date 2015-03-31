'use strict';

var angular = require('angular');

var isObject = angular.isObject;

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

module.exports = StateInterceptorRunner;
