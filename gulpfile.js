var
    gulp          = require('gulp'),
    gutil         = require('gulp-util'),
    uglify        = require('gulp-uglify'),
    sourcemaps    = require('gulp-sourcemaps'),
    browserSync   = require('browser-sync'),
    sass          = require('gulp-sass'),
    sassCompiler  = require('node-sass'),
    autoprefixer  = require('gulp-autoprefixer'),
    twig          = require('gulp-twig'),
    imagemin      = require('gulp-imagemin'),
    pngquant      = require('imagemin-pngquant'),
    gulpif        = require('gulp-if'),
    del           = require('del');

// ////////////////////////////////////////////////
// Settings
// ////////////////////////////////////////////////

var isDev = process.env.NODE_ENV === "development"; // || production

var bSync = {
    live: {
        server: {
            baseDir: './public/'
        }
    },
    reload: { stream: true }
};

var sourceMapsPaths = {
    public: './public/maps',
    write: '../maps',
};

var paths = {
    scripts: {
        entry: './src/js/main.js',
        watch: './src/js/main.js',
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
// JavaScript: Browserify, Watchify, Babelify
// ////////////////////////////////////////////////

function scripts() {
    return gulp.src(paths.scripts.entry)
        .pipe(gulpif(!isDev, uglify()))
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(browserSync.reload(bSync.reload));
}

// var babelify      = require('babelify'); // ES6 Support for Browserify
// var opts = assign({}, watchify.args, customOpts);
// var b = watchify(browserify(opts));
// b.transform('babelify', { presets: ['es2015'] }); // ES6 Support for Browserify
// b.on('change', bundle);
// b.on('log', gutil.log);

// gulp.task('js', function () {
//     return gulp.src(customOpts.entries)
//         .on('error', gutil.log.bind(gutil, 'Browserify Error'))
//         .pipe(source('main.js'))
//         .pipe(buffer())
//         .pipe(gulpif(env === 'production', uglify()))
//         .pipe(sourcemaps.init({ loadMaps: true }))
//         .pipe(gulpif(env === 'development', sourcemaps.write(sourceMapsPaths.write)))
//         .pipe(gulp.dest('./public/js'))
//         .pipe(browserSync.reload(bSync.reload));
// });

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
        .pipe(gulpif(isDev, sourcemaps.write(sourceMapsPaths.write)))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browserSync.reload(bSync.reload));
}

// ////////////////////////////////////////////////
// Templates
// ////////////////////////////////////////////////

function templates() {
    return gulp.src(paths.templates.entry)
        .pipe(twig())
        .pipe(gulp.dest(paths.templates.dest))
        .pipe(browserSync.reload(bSync.reload));
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

function cleanMaps() {
    return del([sourceMapsPaths.public]);
}

// ////////////////////////////////////////////////
// Browser sync
// ////////////////////////////////////////////////

function browserSyncLive() {
    browserSync(bSync.live);
}

// ////////////////////////////////////////////////
// Watch Tasks
// ////////////////////////////////////////////////

function watch () {
    gulp.watch(paths.scripts.watch, scripts);
    gulp.watch(paths.styles.watch, styles);
    gulp.watch(paths.templates.watch, templates);
}

// ////////////////////////////////////////////////
// Run & Build
// ////////////////////////////////////////////////

var compileSources = gulp.parallel(styles, scripts, templates, images);
var live = gulp.parallel(browserSyncLive, watch);

var develop = gulp.series(compileSources, live);
var production = gulp.series(compileSources, cleanMaps);

gulp.task('default', gulpif(isDev, develop, production));
