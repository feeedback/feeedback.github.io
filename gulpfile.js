const { watch, series, parallel, dest, src } = require('gulp');
const { exec } = require('child_process');
const bs = require('browser-sync').create();
// const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');
const terser = require('gulp-terser');

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
    cb();
}
function browserSyncReload(cb) {
    bs.reload();
    cb();
}

function jekyllBuild(cb) {
    exec('jekyll build');
    cb();
}
function watchAll(cb) {
    watch(allPaths, series(jekyllBuild, browserSyncReload));
    // gulp.watch(path.scss, ['sass']);
    cb();
}

const minifyCss = (cb) => {
    src('_site/**/*.css')
        .pipe(cleanCSS())
        .pipe(dest('_site'));
    cb();
};
const minifyHtml = (cb) => {
    src('_site/**/*.html')
        .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
        .pipe(dest('_site'));
    cb();
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

    cb();
};
//  pipeline(gulp.src('lib/*.js'), uglify(), gulp.dest('dist'));
exports.default = series(browserSyncInit, watchAll);
exports.preBuild = parallel(minifyCss, minifyHtml, minifyJs);
