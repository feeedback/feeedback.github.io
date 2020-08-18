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

const imageResize = require('gulp-image-resize');
const rename = require('gulp-rename');

// function resizeAvatar(cb) {
//     [250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800].forEach(
//         function(size) {
//             src('_site/**/*.{jpg,jpeg,png}')
//                 .pipe(imageResize({ width: size }))
//                 .pipe(
//                     rename((path) => {
//                         path.basename = `${path.basename}@${size}w`;
//                     })
//                 )
//                 .pipe(dest('_site'));
//         }
//     );
//     cb();
// }
// function resizeProjectImage(cb) {
//     [100, 200, 250, 300, 350, 400, 450, 500, 550].forEach(function(size) {
//         src('_site/**/*.{jpg,jpeg,png}')
//             .pipe(imageResize({ width: size }))
//             .pipe(
//                 rename((path) => {
//                     path.basename = `${path.basename}@${size}w`;
//                 })
//             )
//             .pipe(dest('_site'));
//     });
//     cb();
// }

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
const minifyImage = (cb) => {
    src('_site/**/*.{jpg,png}')
        .pipe(webp({ quality: 90, method: 6 }))
        .pipe(dest('_site'));
    cb();
};

const deleteSourceImage = (cb) => {
    glob('_site/**/*.{jpg,png}', {}, (err, files) => {
        if (err) {
            console.error(err);
        }
        setTimeout(() => Promise.all(files.map((file) => fs.unlink(file))), 1000);
    });
    cb();
};

const printSize = (cb) => {
    src(`_site/**/*.html`).pipe(size({ title: 'html' }));
    src(`_site/**/*.css`).pipe(size({ title: 'css' }));
    src(`_site/**/*.js`).pipe(size({ title: 'js' }));
    src(`_site/**/*.webp`).pipe(size({ title: 'webp' }));
    src(`_site/**/*.ico`).pipe(size({ title: 'ico' }));
    cb();
};

const jekyllBuild = (cb) => {
    execSync('bundle exec jekyll build');
    cb();
};

exports.afterBuild = series(
    jekyllBuild,
    parallel(minifyCss, minifyHtml, minifyJs, series(minifyImage, deleteSourceImage)),
    printSize
);

const watchAll = (cb) => {
    watch(
        '.',
        { ignored: '_site', delay: 100, awaitWriteFinish: true },
        series(jekyllBuild, exports.afterBuild, browserSyncReload)
    );
    cb();
};

exports.default = series(browserSyncInit, watchAll);
