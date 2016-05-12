'use strict';
const gulp = require('gulp');
const pkg = require('./package.json');
const $ = require('gulp-load-plugins')();
const gulpSequence = require('gulp-sequence');
const sassdoc = require('sassdoc');
const filelog = require('gulp-filelog');
const importOnce = require('node-sass-import-once');
require('web-component-tester').gulp.init(gulp);
const sassdocOptions = {
  dest: 'docs',
  verbose: true,
  display: {
    access: ['public', 'private'],
    alias: true,
    watermark: true,
  },
  groups: {
    'undefined': 'Ungrouped'
  }
};

const sassOptions = {
  importer: importOnce,
  importOnce: {
    index: true,
    bower: true
  }
};

gulp.task('sassdoc', function() {
  return gulp.src('sass/**/*.scss')
    //  .pipe($.filelog())
    .pipe(sassdoc(sassdocOptions))
    .pipe($.filelog());
});

gulp.task('clean', function() {
  return gulp.src(['.tmp', 'css'], {
      read: false
    })
    .pipe($.filelog())
    .pipe($.clean());
});

gulp.task('sass', function() {
  return gulp.src('./sass/**/*.scss')
    //  .pipe($.filelog())
    .pipe($.sass(sassOptions).on('error', $.sass.logError))
    .pipe($.size())
    .pipe($.concat(pkg.name + '.css'))
    .pipe(gulp.dest('./css'))
    .pipe($.filelog());
});

gulp.task('autoprefixer', function() {
  return gulp.src('css/*.css')
    //  .pipe($.filelog())
    .pipe($.autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe($.size())
    .pipe(gulp.dest('css'))
    .pipe($.filelog());
});

gulp.task('css', function() {
  return gulp.src('css/*.css')
    .pipe($.sourcemaps.init())
    .pipe($.cssmin())
    .pipe($.filelog())
    .pipe($.concat(pkg.name + '.css'))
    .pipe($.sourcemaps.write('.'))
    .pipe($.rename({
      suffix: '.min'
    }))
    .pipe($.size())
    .pipe(gulp.dest('css'))
    .pipe($.filelog());
});



gulp.task('build:styles', gulpSequence('sass', 'autoprefixer'));


gulp.task('sass:watch', function() {
  gulp.watch('./sass/**/*.scss', ['sass']);
  gulp.watch('./css/**/*.css', ['autoprefixer']);
});


gulp.task('watch', ['sass:watch']);
gulp.task('default', gulpSequence('clean', 'sass', 'autoprefixer', 'css', 'sassdoc'));
