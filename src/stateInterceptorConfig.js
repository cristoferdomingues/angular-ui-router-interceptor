'use strict';

var StateInterceptorDecorator = require('./stateInterceptorDecorator');

function StateInterceptorConfig($provide) {
    $provide.decorator('$state', StateInterceptorDecorator);
}

StateInterceptorConfig.$inject = [
    '$provide'
];

module.exports = StateInterceptorConfig;
