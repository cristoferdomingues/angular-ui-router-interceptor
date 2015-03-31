'use strict';

var webpack = require('webpack'),
    webpackConfig = require('webpack-config');

module.exports = webpackConfig.fromObject({
    output: {
        filename: '[name].js'
    },
    resolve: {
        root: [
            __dirname
        ],
        modulesDirectories: [
            'web_modules',
            'node_modules'
        ]
    },
    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(true)
    ]
});
