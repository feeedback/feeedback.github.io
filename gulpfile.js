const { watch, series, parallel, dest, src } = require('gulp');
const { execSync } = require('child_process');
const bs = require('browser-sync').create();
// const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');
const terser = require('gulp-terser');
// const gulpPrintSize = require('gulp-size');
const webp = require('gulp-webp');
// const fs = require('fs').promises;
// const glob = require('glob');
// const del = require('del');

const imageResize = require('gulp-image-resize');
const rename = require('gulp-rename');

// const path = {
//     html: ['*.html', '_includes/*.html', '_layouts/*.html'],
//     scss: ['scss/**/*.scss'],
//     // css: ['assets/css/*.css'],
//     // posts: ['_posts/*.*', '_country-list/*.*'],
//     config: ['_config.yml', '_data/*'],
// };
// const allPaths = Object.values(path).flat();

// gulp.task('sass', function() {
//     return gulp
//         .src('scss/main.scss')
//         .pipe(sass().on('error', sass.logError))
//         .pipe(gulp.dest('_site/assets/styles/'))
//         .pipe(bs.stream())
//         .pipe(gulp.dest('assets/styles/'));
// });

// const forWidthAvatar = [320, 360, 375, 411, 543, 580, 768, 992, 1200];
const resizeAvatar = (cb) => {
    [203, 236, 249, 280, 372, 303, 175, 255, 315].forEach((size) => {
        src('_data/img_src/**/avatar.{jpg,jpeg,png}')
            .pipe(imageResize({ width: size }))
            .pipe(rename({ suffix: `_${size}w` }))
            .pipe(dest('_data/img_src'));
    });
    cb();
};

// const forWidthProject = [320, 360, 375, 411, 580, 768, 992, 1200];
const resizeProjectImage = (cb) => {
    // for [320w, 360w, 375w, 411w, 580w+, 768w+, 2X 992w+, 3X 1200w+]
    [272, 312, 327, 363, 492, 672, 445, 349].forEach((size) => {
        src('_data/img_src/projects/project-*+([^0-9][^w]).{jpg,jpeg,png}')
            .pipe(imageResize({ width: size }))
            .pipe(rename({ suffix: `_${size}w` }))
            .pipe(dest('_data/img_src/projects'));
    });
    cb();
};
const resizeImage = series(resizeAvatar, resizeProjectImage);

const minifyImage = (cb) => {
    src('_data/img_src/**/*_*.{jpg,jpeg,png}')
        .pipe(webp({ quality: 92, method: 6 }))
        .pipe(dest('assets/img'));
    cb();
};

const browserSyncReload = (cb) => {
    bs.reload();
    cb();
};

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

// const deleteSourceImage = (cb) => {
//     glob('_site/**/*.{jpg,png}', {}, (err, files) => {
//         if (err) {
//             console.error(err);
//         }
//         setTimeout(() => Promise.all(files.map((file) => fs.unlink(file))), 2000);
//     });
//     cb();
// };
// const deleteSourceImage = (cb) => {
//     (async () => {
//         const deletedPaths = await del(['_site/assets/img/*.{jpg,png}']);

//         console.log('Deleted files and directories:\n', deletedPaths.join('\n'));
//     })();
//     cb();
// };

// const printSize = (cb) => {
//     src(`_site/**/*.html`).pipe(gulpPrintSize({ title: 'html' }));
//     src(`_site/**/*.css`).pipe(gulpPrintSize({ title: 'css' }));
//     src(`_site/**/*.js`).pipe(gulpPrintSize({ title: 'js' }));
//     src(`_site/**/*.webp`).pipe(gulpPrintSize({ title: 'webp' }));
//     src(`_site/**/*.ico`).pipe(gulpPrintSize({ title: 'ico' }));
//     cb();
// };

const jekyllBuild = (cb) => {
    execSync('bundle exec jekyll build');
    cb();
};

const trueSyncSeries = (...tasks) => {
    return (cb) => {
        execSync(tasks.map((f) => `gulp ${f}`).join('&&'));
        cb();
    };
};

const beforeBuild = trueSyncSeries('resizeImage', 'minifyImage');
const afterBuild = parallel(minifyCss, minifyHtml, minifyJs);
const build = trueSyncSeries('beforeBuild', 'jekyllBuild', 'afterBuild');

const browserSyncInit = (cb) => {
    bs.init({
        server: {
            baseDir: '_site',
        },
    });
    cb();
};
const watchAll = (cb) => {
    watch(
        '.',
        {
            ignored: ['_site', 'assets/img', '_data/img_src'],
            delay: 300,
            awaitWriteFinish: true,
        },
        series(build, browserSyncReload)
    );
    cb();
};

exports.resizeImage = resizeImage;
exports.minifyImage = minifyImage;

exports.beforeBuild = beforeBuild;
exports.jekyllBuild = jekyllBuild;
exports.afterBuild = afterBuild;
exports.default = series(build, browserSyncInit, watchAll);
