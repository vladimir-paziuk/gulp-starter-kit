var
    gulp          = require('gulp'),
    babel         = require('gulp-babel'),
    gutil         = require('gulp-util'),
    rename        = require('gulp-rename'),
    sourcemaps    = require('gulp-sourcemaps'),
    sass          = require('gulp-sass'),
    sassCompiler  = require('node-sass'),
    autoprefixer  = require('gulp-autoprefixer'),
    twig          = require('gulp-twig'),
    imagemin      = require('gulp-imagemin'),
    pngquant      = require('imagemin-pngquant'),
    gulpif        = require('gulp-if'),
    del           = require('del'),
    sync          = require('browser-sync'),
    webpack       = require('webpack-stream');

// ////////////////////////////////////////////////
// Settings
// ////////////////////////////////////////////////

var env = process.env.NODE_ENV; // 'development' || 'production'
var isDev = env === 'development';

var syncOptions = {
    server: {
        baseDir: './public/'
    }
};

var sourcePaths = {
    public: './public',
    writeMaps: '../maps',
};

var paths = {
    scripts: {
        entry: './src/js/main.js',
        watch: './src/js/**/*.js',
        dest: './public/js'
    },
    styles: {
        entry: './src/scss/styles.scss',
        watch: './src/scss/**/*.scss',
        dest: './public/css',
    },
    templates: {
        entry: './src/*.html',
        watch: './src/**/*.html',
        dest: './public',
    },
    images: {
        entry: './src/images/**/*',
        dest: './public/images',
    },
};

// ////////////////////////////////////////////////
// JavaScript
// ////////////////////////////////////////////////

function scripts() {
    return gulp.src(paths.scripts.entry)
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(webpack({
            mode: env
        }))
        .pipe(rename('main.js'))
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(sync.stream());
}

// ////////////////////////////////////////////////
// Styles
// ///////////////////////////////////////////////

sass.compiler = sassCompiler;

function styles() {
    return gulp.src(paths.styles.entry)
        .pipe(sourcemaps.init())
        .pipe(gulpif(
            isDev,
                sass({ outputStyle: 'expanded' }),
                sass({ outputStyle: 'compressed' })
        ))
        .on('error', gutil.log.bind(gutil, 'SCSS Error'))
        .pipe(autoprefixer({ cascade: false }))
        .pipe(gulpif(isDev, sourcemaps.write(sourcePaths.writeMaps)))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(sync.stream());
}

// ////////////////////////////////////////////////
// Templates
// ////////////////////////////////////////////////

function templates() {
    return gulp.src(paths.templates.entry)
        .pipe(twig())
        .pipe(gulp.dest(paths.templates.dest))
        .pipe(sync.stream());
}

// ////////////////////////////////////////////////
// Images
// ////////////////////////////////////////////////

function images() {
    return gulp.src(paths.images.entry)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(paths.images.dest));
}

// ////////////////////////////////////////////////
// Delete maps folder
// ///////////////////////////////////////////////

function clean() {
    return del([sourcePaths.public]);
}

// ////////////////////////////////////////////////
// Browser sync
// ////////////////////////////////////////////////

function syncLive() {
    sync(syncOptions);
}

// ////////////////////////////////////////////////
// Watch Tasks
// ////////////////////////////////////////////////

function watch () {
    syncLive();

    gulp.watch(paths.scripts.watch, scripts);
    gulp.watch(paths.styles.watch, styles);
    gulp.watch(paths.templates.watch, templates);
}

// ////////////////////////////////////////////////
// Run & Build
// ////////////////////////////////////////////////

var compileSources = gulp.parallel(scripts, styles, templates, images);

exports.default = gulpif(
    isDev,
        gulp.series(clean, compileSources, watch),
        gulp.series(clean, compileSources)
);
