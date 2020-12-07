const { src, dest, watch, parallel, series } = require('gulp');

const scss          = require('gulp-sass');
const concat        = require('gulp-concat');
const browserSync   = require('browser-sync').create();
const uglify        = require('gulp-uglify-es').default;
const autoprefixer  = require('gulp-autoprefixer');
const imagemin      = require('gulp-imagemin');
const del           = require('del');

function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'dev/'
        }
    });
}

function cleanDist() {
    return del('dist')
}

function images() {
    return src('dev/img/**/*')
        .pipe(imagemin(
            [
                imagemin.gifsicle({ interlaced: true }),
                imagemin.mozjpeg({ quality: 75, progressive: true }),
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.svgo({
                    plugins: [
                        { removeViewBox: true },
                        { cleanupIDs: false }
                    ]
                })
            ]
        ))
        .pipe(dest('dist/img'))
}

function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js', 
        'dev/js/main.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('dev/js'))
        .pipe(browserSync.stream())
}

function styles() {
    return src('dev/scss/style.scss')
        .pipe(scss({outputStyle: 'compressed'}))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'], 
            grid: true
        }))
        .pipe(dest('dev/css'))
        .pipe(browserSync.stream())
}

function build() {
    return src([
        'dev/css/style.min.css',
        'dev/fonts/**/*',
        'dev/js/main.min.js',
        'dev/*.html'
    ], {base: 'dev'})
        .pipe(dest('dist'));
}

function watching() {
    watch(['dev/scss/**/*.scss'], styles);
    watch(['dev/js/**/*.js', '!dev/js/main.min.js'], scripts);
    watch(['dev/*.html']).on('change', browserSync.reload);
}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;
// exports.build = build;

exports.build = series (cleanDist, images, build);
exports.default = parallel(styles, scripts, browsersync, watching);