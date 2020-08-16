const { watch, series, parallel, dest, src } = require('gulp');
const { execSync } = require('child_process');
const bs = require('browser-sync').create();
// const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');
const terser = require('gulp-terser');
const size = require('gulp-size');
const webp = require('gulp-webp');

const fs = require('fs').promises;
const glob = require('glob');

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
const minifyImage = async (cb) => {
    src('_site/**/*.{jpg,png}')
        .pipe(webp({ quality: 92, method: 6 }))
        .pipe(dest('_site'));

    // glob('_site/**/*.{jpg,png}', {}, async (err, files) => {
    //     if (err) {
    //         console.error(err);
    //     }
    //     await Promise.all(files.map((file) => fs.unlink(file)));
    // });
    cb();
};

const printSize = (cb) => {
    src(`_site/**/*.html`).pipe(size({ title: 'html' }));
    src(`_site/**/*.css`).pipe(size({ title: 'css' }));
    src(`_site/**/*.js`).pipe(size({ title: 'js' }));
    src(`_site/**/*.webp`).pipe(size({ title: 'webp' }));
    src(`_site/**/*.jpg`).pipe(size({ title: 'jpg' }));
    src(`_site/**/*.png`).pipe(size({ title: 'png' }));
    src(`_site/**/*.ico`).pipe(size({ title: 'ico' }));
    cb();
};
const preBuild = series(
    parallel(minifyCss, minifyHtml, minifyJs, minifyImage),
    printSize
);

const jekyllBuild = (cb) => {
    execSync('bundle exec jekyll build');
    return cb();
};

const watchAll = (cb) => {
    watch(
        '.',
        { ignored: '_site', delay: 100, awaitWriteFinish: true },
        series(jekyllBuild, preBuild, browserSyncReload)
    );
    // gulp.watch(path.scss, ['sass']);
    return cb();
};
exports.preBuild = preBuild;
exports.default = series(browserSyncInit, watchAll);
