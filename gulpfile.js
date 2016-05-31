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

// ES6 Support for Browserify
var babelify      = require('babelify');

// setup node enviorment (development or production)
var env = process.env.NODE_ENV;


// ////////////////////////////////////////////////
// JavaScript: Browserify, Watchify, Babalify
// ////////////////////////////////////////////////

var customOpts = {
  entries: ['./src/js/main.js'],
  debug: true
};
var opts = assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts));

b.transform('babelify', { presets: ['es2015'] }); // ES6 Support for Browserify

gulp.task('js', bundle);
b.on('update', bundle);
b.on('log', gutil.log);

function bundle() {
  return b.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(gulpif(env === 'production', uglify()))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(gulpif(env === 'development', sourcemaps.write('../maps')))
    .pipe(gulp.dest('./public/js'))
    .pipe(browserSync.reload({ stream: true }));
}


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
// HTML Tasks
// ////////////////////////////////////////////////

gulp.task('html', function () {
    return gulp.src('public/**/*.html')
        .pipe(browserSync.reload({ stream: true }));
});


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
// Watch Tasks
// ////////////////////////////////////////////////

gulp.task('watch', function () {
  gulp.watch('public/**/*.html', ['html']);
  gulp.watch('src/scss/**/*.scss', ['styles']);
});

gulp.task('default', ['js', 'styles', 'browserSync', 'watch']);