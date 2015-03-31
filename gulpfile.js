'use strict';

var path = require('path'),
    del = require('del'),
    gulp = require('gulp'),
    eslint = require('gulp-eslint'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    webpack = require('gulp-webpack-build'),
    runSequence = require('run-sequence'),
    gitdown = require('gitdown');

var src = './src/',
    dest = './dist/',
    paths = {
        scripts: [
            path.join(src, '**/*.js'),
            'gulpfile.js'
        ]
    },
    webpackOptions = {
        debug: true,
        devtool: '#source-map',
        output: {
            pathinfo: true
        }
    },
    webpackConfig = {
        useMemoryFs: true,
        progress: true
    },
    webpackFormat = {
        version: false,
        timings: true
    },
    webpackFailAfter = {
        errors: true,
        warnings: true
    };

gulp.task('lint', function() {
    return gulp.src(paths.scripts)
        .pipe(eslint())
        .pipe(eslint.format());
});

gulp.task('clean', function(callback) {
    del([dest + '**/*.*'], callback);
});

gulp.task('docs', ['gitdown']);

gulp.task('gitdown', function() {
    return gitdown.read('.gitdown/README.md').write('README.md');
});

gulp.task('compress', function() {
    return gulp.src([dest + '**/*.js', '!' + dest + '**/*.min.js'])
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(gulp.dest(dest));
});

gulp.task('webpack', [], function() {
    return gulp.src(path.join(src, '**', webpack.config.CONFIG_FILENAME), { base: path.resolve(src) })
        .pipe(webpack.configure(webpackConfig))
        .pipe(webpack.overrides(webpackOptions))
        .pipe(webpack.compile())
        .pipe(webpack.format(webpackFormat))
        .pipe(webpack.failAfter(webpackFailAfter))
        .pipe(gulp.dest(dest));
});

gulp.task('build', [], function(callback) {
    runSequence('clean', ['lint', 'docs', 'webpack'], 'compress', callback);
});

gulp.task('ci', [], function(callback) {
    runSequence('lint', callback);
});

gulp.task('default', function(callback) {
    runSequence('build', callback);
});
