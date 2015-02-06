'use strict';

var path = require('path'),
    fs = require('fs'),
    del = require('del'),
    gulp = require('gulp'),
    eslint = require('gulp-eslint'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    umdWrap = require('gulp-wrap-umd'),
    runSequence = require('run-sequence'),
    gitdown = require('gitdown');

var src = './src/',
    dist = './dist/',
    umdTemplate = fs.readFileSync('./.gulp/umd.jst', 'utf-8'),
    paths = {
        scripts: [
            path.join(src, '**/*.js'),
            'gulpfile.js'
        ]
    };

gulp.task('lint', function() {
    return gulp.src(paths.scripts)
        .pipe(eslint())
        .pipe(eslint.format());
});

gulp.task('clean', function(callback) {
    del([dist + '**/*.*'], callback);
});

gulp.task('docs', ['gitdown']);

gulp.task('gitdown', function() {
    return gitdown.read('.gitdown/README.md').write('README.md');
});

gulp.task('compress', function() {
    return gulp.src([dist + '**/*.js', '!' + dist + '**/*.min.js'])
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(gulp.dest(dist));
});

gulp.task('bundle', function() {
    return gulp.src([src + '**/*.js'])
        .pipe(umdWrap({
            namespace: null,
            template: umdTemplate,
            deps: [{
                name: 'angular', globalName: 'angular', paramName: 'angular'
            }]
        }))
        .pipe(gulp.dest(dist));
});

gulp.task('build', [], function(callback) {
    runSequence('clean', ['lint', 'docs', 'bundle'], 'compress', callback);
});

gulp.task('default', function(callback) {
    runSequence('build', callback);
});
