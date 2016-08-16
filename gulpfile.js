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
    twig          = require('gulp-twig'),
    imagemin      = require('gulp-imagemin'),
    pngquant      = require('imagemin-pngquant'),
    gulpif        = require('gulp-if'),
    del           = require('del');

var babelify      = require('babelify'); // ES6 Support for Browserify

// setup node enviorment (development or production)
var env = process.env.NODE_ENV;


// ////////////////////////////////////////////////
// JavaScript: Browserify, Watchify, Babelify
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
// Styles
// ///////////////////////////////////////////////

gulp.task('styles', function () {
    gulp.src('./src/scss/styles.scss')
        .pipe(sourcemaps.init())
        .pipe(gulpif(env === 'production', sass({ outputStyle: 'compressed' }),
            sass({ outputStyle: 'expanded' })))
        .on('error', gutil.log.bind(gutil, 'SCSS Error'))
        .pipe(autoprefixer({
            browsers: ['last 3 versions'],
            cascade: false
        }))
        .pipe(gulpif(env === 'development', sourcemaps.write('../maps')))
        .pipe(gulp.dest('./public/css'))
        .pipe(browserSync.reload({ stream: true }));
});


// ////////////////////////////////////////////////
// HTML
// ////////////////////////////////////////////////

gulp.task('templates', function () {
    return gulp.src('./src/*.html')
        .pipe(twig())
        .pipe(gulp.dest('./public'))
        .pipe(browserSync.reload({ stream: true }));
});


// ////////////////////////////////////////////////
// Images
// ////////////////////////////////////////////////

gulp.task('images', function () {
    gulp.src('./src/images/**/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('./public/images'));
});


// ////////////////////////////////////////////////
// Browser-Sync
// ////////////////////////////////////////////////

gulp.task('browserSync', function () {
  browserSync({
    server: {
      baseDir: './public/'
    }
  });
});


// ////////////////////////////////////////////////
// Delete maps folder in production mode
// ///////////////////////////////////////////////

gulp.task('clean:maps', (env === 'production', deleteMapsFolder));

function deleteMapsFolder() {
    return del([
        'public//maps/**',
    ]);
}


// ////////////////////////////////////////////////
// Watch Tasks
// ////////////////////////////////////////////////

gulp.task('watch', function () {
  gulp.watch('./src/**/*.html', ['templates']);
  gulp.watch('./src/scss/**/*.scss', ['styles']);
});


// ////////////////////////////////////////////////
// Default Tasks
// ////////////////////////////////////////////////

gulp.task('default', ['templates', 'js', 'styles', 'images', 'browserSync', 'clean:maps', 'watch']);