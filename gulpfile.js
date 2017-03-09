'use strict';

const gulp = require('gulp');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const nodemon = require('gulp-nodemon');
const requirejs = require('gulp-requirejs-optimize');
const header = require('gulp-header');
const cleanCSS = require('gulp-clean-css');
const stripDebug = require('gulp-strip-debug');
const rename = require("gulp-rename");
const rev = require('gulp-rev');
const glob = require('glob');
const runSequence = require('run-sequence');

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;
const day = now.getDate();

const banner = `
/**
 * app.js
 *
 * @version: <%= pkg.version %>
 * @update: ${year}-${month}-${day}
 */

`;

gulp.task('less', () => {
  gulp.src('app/css/less/app.less')
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('app/css'));
});

gulp.task('serve', () => {
  nodemon({
    script: 'server.js',
    ignore: ['app', 'less']
  });
});

gulp.task('watch', () => {
  gulp.watch('app/css/less/**/*.less', ['less']);
});

gulp.task('jsmin', () => {
  let controllers = [];
  const files = glob.sync('app/js/controllers/*.js');
  files.forEach(file => {
    file = file.replace(/app.js\//, '').replace(/\.js$/, '');
    controllers.push(file);
  });
  console.log(controllers);
  return gulp.src('app/js/main.js')
    .pipe(requirejs({
      baseUrl: 'app/js',
      mainConfigFile: 'app/js/main.js',
      name: 'main',
      include: controllers
    }))
    .pipe(stripDebug())
    .pipe(header(banner, { 'pkg': require('./package.json') }))
    .pipe(rename('main.min.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('cssmin', () => {
  return gulp.src('app/css/app.css')
    .pipe(cleanCSS())
    .pipe(header(banner, { 'pkg': require('./package.json') }))
    .pipe(rename('app.min.css'))
    .pipe(gulp.dest('dist'));
});

gulp.task('rev', function () {
  return gulp.src(['dist/main.min.js', 'dist/app.min.css'])
    .pipe(rev())
    .pipe(gulp.dest('dist'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['serve', 'less', 'watch']);
gulp.task('build', function (callback) {
  runSequence(['cssmin', 'jsmin'], 'rev', callback);
});
