// ////////////////////////////////////////////////
// Required
// ////////////////////////////////////////////////

var gulp          = require('gulp'),
    watchify      = require('watchify'),
    browserify    = require('browserify'),
    source        = require('vinyl-source-stream'),
    buffer        = require('vinyl-buffer'),
    gutil         = require('gulp-util'),
    uglify        = require('gulp-uglify'),
    sourcemaps    = require('gulp-sourcemaps'),
    assign        = require('lodash.assign'),
    browserSync   = require('browser-sync'),
    sass          = require('gulp-sass'),
    autoprefixer  = require('gulp-autoprefixer'),
    gulpif        = require('gulp-if');

// setup node enviorment (development or production)
var env = process.env.NODE_ENV;


// ////////////////////////////////////////////////
// JavaScript: Browserify, Watchify
// https://github.com/gulpjs/gulp/blob/master/docs/recipes/fast-browserify-builds-with-watchify.md
// ////////////////////////////////////////////////

var customOpts = {
  entries: ['./src/js/main.js'],
  debug: true
};
var opts = assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts));

gulp.task('js', bundle);
b.on('update', bundle);
b.on('log', gutil.log);

function bundle() {
  return b.bundle()

    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('main.js'))

    // optional, remove if you don't need to buffer file contents
    .pipe(buffer())
    .pipe(gulpif(env === 'production', uglify()))

    // optional, remove if you dont want sourcemaps
    .pipe(sourcemaps.init({ loadMaps: true })) // loads map from browserify file
    // Add transformation tasks to the pipeline here.
    // writes .map file
    .pipe(gulpif(env === 'development', sourcemaps.write('../maps')))
    .pipe(gulp.dest('./public/js'))
    .pipe(browserSync.reload({ stream: true }));
}


// ////////////////////////////////////////////////
// Browser-Sync Tasks
// ////////////////////////////////////////////////

gulp.task('browserSync', function () {
  browserSync({
    server: {
      baseDir: './public/'
    },
  });
});


// ////////////////////////////////////////////////
// HTML Tasks
// ////////////////////////////////////////////////

gulp.task('html', function () {
  return gulp.src('public/**/*.html')
    .pipe(browserSync.reload({ stream: true }));
});


// ////////////////////////////////////////////////
// Styles Tasks
// ///////////////////////////////////////////////

gulp.task('styles', function () {
  gulp.src('src/scss/styles.scss')
    .pipe(sourcemaps.init())

      .pipe(gulpif(env === 'production', sass({ outputStyle: 'compressed' }),
        sass({ outputStyle: 'expanded' })))
      .on('error', gutil.log.bind(gutil, 'SCSS Error'))
      .pipe(autoprefixer({
        browsers: ['last 3 versions'],
        cascade: false
      }))
    .pipe(gulpif(env === 'development', sourcemaps.write('../maps')))
.pipe(gulp.dest('public/css'))
.pipe(browserSync.reload({ stream: true }));
});


// ////////////////////////////////////////////////
// Watch Tasks
// ////////////////////////////////////////////////

gulp.task('watch', function () {
  gulp.watch('public/**/*.html', ['html']);
  gulp.watch('src/scss/**/*.scss', ['styles']);
});

gulp.task('default', ['js', 'styles', 'browserSync', 'watch']);