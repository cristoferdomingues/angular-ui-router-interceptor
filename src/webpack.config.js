'use strict';

var path = require('path'),
    webpackConfig = require('webpack-config');

module.exports = webpackConfig.fromCwd().extend({
    entry: {
        'angular-ui-router-interceptor': path.join(__dirname, 'index.js')
    },
    resolve: {
        root: [
            __dirname
        ]
    },
    externals: {
        angular: 'angular'
    }
});
