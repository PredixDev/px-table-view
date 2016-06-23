'use strict';
const path = require('path');
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



gulp.task('clean', function () {
  return gulp.src(['.tmp', 'css'], {
      read: false
    })
    .pipe($.filelog())
    .pipe($.clean());
});


///-------------------------------------------------------------------------
/// Styles Tasks
///-------------------------------------------------------------------------


/// 1. Compile styles
gulp.task('sass', function () {
  return gulp.src(`./sass/${pkg.name}-sketch.scss`)
    .pipe($.filelog())
    .pipe($.sass(sassOptions).on('error', $.sass.logError))
    .pipe($.size())
    //  .pipe($.concat(pkg.name + '.css'))
    .pipe($.rename(`${pkg.name}.css`))
    .pipe(gulp.dest('./css'))
    .pipe($.filelog());
});
gulp.task('sass-row', function () {
  return gulp.src(`./sass/px-table-row-sketch.scss`)
    .pipe($.filelog())
    .pipe($.sass(sassOptions).on('error', $.sass.logError))
    .pipe($.size())
    //  .pipe($.concat(pkg.name + '.css'))
    .pipe($.rename(`px-table-row.css`))
    .pipe(gulp.dest('./css'))
    .pipe($.filelog());
});

/// 2. Document styles
gulp.task('sassdoc', function () {
  return gulp.src('sass/**/*.scss')
    .pipe(sassdoc(sassdocOptions))
    .pipe($.filelog());
});

/// 3. Prefix styles
gulp.task('autoprefixer', function () {
  return gulp.src('css/*.css')
    .pipe($.filelog())
    .pipe($.autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe($.size())
    .pipe(gulp.dest('css'))
    .pipe($.filelog());
});

/// 4. Minify styles
gulp.task('cssmin', function () {
  return gulp.src('css/*.css')
    .pipe($.sourcemaps.init())
    .pipe($.cssmin())
    .pipe($.filelog())
    //.pipe($.concat(pkg.name + '.css'))
    .pipe($.sourcemaps.write('.'))
    .pipe($.rename({
      suffix: '.min'
    }))
    .pipe($.size())
    .pipe(gulp.dest('css'))
    .pipe($.filelog());
});


/// 5. Create Polymer styles module
const stylemod = require('gulp-style-modules');


gulp.task('poly-styles', function () {
  gulp.src(`./css/${pkg.name}.css`)
    .pipe($.filelog())
    .pipe(stylemod({
      filename: 'styles',
      moduleId: function (file) {
        return path.basename(file.path, path.extname(file.path)) + '-css';
      }
    }))
    .pipe($.rename(`${pkg.name}-styles.html`))
    .pipe(gulp.dest('.'))
    .pipe($.filelog());
});
gulp.task('poly-styles-row', function () {
  gulp.src(`./css/px-table-row.css`)
    .pipe($.filelog())
    .pipe(stylemod({
      filename: 'styles',
      moduleId: function (file) {
        return path.basename(file.path, path.extname(file.path)) + '-css';
      }
    }))
    .pipe($.rename(`px-table-row-styles.html`))
    .pipe(gulp.dest('.'))
    .pipe($.filelog());
});



gulp.task('build:styles', gulpSequence('sass', 'autoprefixer'));


gulp.task('sass:watch', function () {
  gulp.watch('./sass/**/*.scss', ['sass']);
  gulp.watch('./css/**/*.css', ['autoprefixer']);
});


gulp.task('styles', gulpSequence('sass', 'sass-row', 'autoprefixer', 'cssmin', 'sassdoc', 'poly-styles', 'poly-styles-row'));
gulp.task('watch', ['sass:watch']);
gulp.task('default', ['clean', 'styles']);
