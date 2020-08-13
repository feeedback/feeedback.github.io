const { watch, series, parallel, dest, src } = require('gulp');
const { exec } = require('child_process');
const bs = require('browser-sync').create();
// const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');
const terser = require('gulp-terser');
const size = require('gulp-filesize');

const path = {
    html: ['*.html', '_includes/*.html', '_layouts/*.html'],
    scss: ['scss/**/*.scss'],
    // css: ['assets/css/*.css'],
    // posts: ['_posts/*.*', '_country-list/*.*'],
    config: ['_config.yml', '_data/*'],
};
const allPaths = Object.values(path).flat();

// gulp.task('sass', function() {
//     return gulp
//         .src('scss/main.scss')
//         .pipe(sass().on('error', sass.logError))
//         .pipe(gulp.dest('_site/assets/styles/'))
//         .pipe(bs.stream())
//         .pipe(gulp.dest('assets/styles/'));
// });

function browserSyncInit(cb) {
    bs.init({
        server: {
            baseDir: '_site',
        },
    });
    return cb();
}
function browserSyncReload(cb) {
    bs.reload();
    return cb();
}

function jekyllBuild(cb) {
    exec('jekyll build');
    return cb();
}
function watchAll(cb) {
    watch(allPaths, series(jekyllBuild, browserSyncReload));
    // gulp.watch(path.scss, ['sass']);
    return cb();
}

const minifyCss = (cb) => {
    src('_site/**/*.css')
        .pipe(cleanCSS())
        .pipe(dest('_site'));
    return cb();
};
const minifyHtml = (cb) => {
    src('_site/**/*.html')
        .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
        .pipe(dest('_site'));
    return cb();
};
const minifyJs = (cb) => {
    src('_site/**/*.js')
        .pipe(
            terser({
                keep_fnames: true,
                mangle: false,
            })
        )
        .pipe(dest('_site'));

    return cb();
};

const printSize = (cb) => {
    // src('_site/**/*.*').pipe(size());
    cb();
};

//  pipeline(gulp.src('lib/*.js'), uglify(), gulp.dest('dist'));
exports.default = series(browserSyncInit, watchAll);
exports.preBuild = series(parallel(minifyCss, minifyHtml, minifyJs), printSize);
