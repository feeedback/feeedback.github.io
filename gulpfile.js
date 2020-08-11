const { watch, series } = require('gulp');
const { exec } = require('child_process');
const bs = require('browser-sync').create();
// const sass = require('gulp-sass');

const path = {
    html: ['*.html', '_includes/*.html', '_layouts/*.html'],
    scss: ['scss/**/*.scss'],
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

exports.default = series(browserSyncInit, watchAll);
