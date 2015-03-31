'use strict';

var stateInterceptorModule = require('./stateInterceptorModule'),
    stateInterceptorConfig = require('./stateInterceptorConfig'),
    stateInterceptorService = require('./stateInterceptorService'),
    stateInterceptorRunner = require('./stateInterceptorRunner');

stateInterceptorModule
    .config(stateInterceptorConfig)
    .service('stateInterceptor', stateInterceptorService)
    .run(stateInterceptorRunner);

module.exports = stateInterceptorModule;
