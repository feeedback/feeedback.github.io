const { watch, series, parallel, dest, src } = require('gulp');
const { execSync } = require('child_process');
const bs = require('browser-sync').create();
const htmlmin = require('gulp-htmlmin');
const terser = require('gulp-terser');
// const gulpPrintSize = require('gulp-size');
// const del = require('del');

const webp = require('gulp-webp');
const imageResize = require('gulp-image-resize');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const pngToJpeg = require('png-to-jpeg');

const gulpPostcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssDeclarationSorter = require('css-declaration-sorter');
const cssnano = require('cssnano');
const postcssFlexbugsFixes = require('postcss-flexbugs-fixes');
const postcssCustomProperties = require('postcss-custom-properties');
const postcssCalc = require('postcss-calc');
const postcssMergeRules = require('postcss-merge-rules');
// const postcssScssParser = require('postcss-scss');
const purgecss = require('@fullhuman/postcss-purgecss');

const sass = require('gulp-sass');
sass.compiler = require('node-sass');

const paths = {
  imgRawData: 'src/_data/img_src',
  imgSrc: 'src/assets/img',
  cssSrc: 'src/assets/css',
  sassSrc: 'src/assets/sass',
  build: '_site',
  bootstrapFrom: 'node_modules/bootstrap/dist/css/bootstrap.min.css',
  bootstrapTo: `_site/assets/css/bootstrap/`,
  animateCSSFrom: 'node_modules/animate.css/animate.min.css',
  animateCSSTo: `_site/assets/css/animate.css/`,
};

// const forWidthAvatar = [360, 375, 451, 768, 992, 1200];
const resizeAvatar = (cb) => {
  [268, 280, 303, 175, 200, 256].forEach((size) => {
    src(`${paths.imgRawData}/**/avatar.{jpg,jpeg,png}`)
      .pipe(imageResize({ width: size }))
      .pipe(rename({ suffix: `_${size}w` }))
      .pipe(dest(paths.imgRawData));
  });
  cb();
};
// const forWidthProject = [320, 360, 375, 411, 580, 768, 992, 1200];
const resizeProjectImage = (cb) => {
  // for [320w, 360w, 375w, 411w, 580w+, 768w+, 2X 992w+, 3X 1200w+]
  [272, 312, 327, 363, 492, 672, 445, 349].forEach((size) => {
    src([
      `${paths.imgRawData}/**/project-*+([^0-9][^w]).{jpg,jpeg,png}`,
      `${paths.imgRawData}/**/!*_fallback.{jpg,jpeg,png}`,
    ])
      .pipe(imageResize({ width: size }))
      .pipe(rename({ suffix: `_${size}w` }))
      .pipe(dest(paths.imgRawData));
  });
  cb();
};
const resizeImage = parallel(resizeAvatar, resizeProjectImage);

const minifyImage = (cb) => {
  src([`${paths.imgRawData}/**/*_*.{jpg,jpeg,png}`, `${paths.imgRawData}/**/!*_fallback.{jpg,jpeg,png}`])
    .pipe(webp({ quality: 92, method: 6 }))
    .pipe(dest(paths.imgSrc));
  cb();
};

const minifyImageJPGForFallback = (cb) => {
  const defaultWidth = 312;
  src([
    `${paths.imgRawData}/**/avatar.{jpg,jpeg,png}`,
    `${paths.imgRawData}/**/project-*+([^0-9][^w]).{jpg,jpeg,png}`,
    `${paths.imgRawData}/**/!*_fallback.{jpg,jpeg,png}`,
  ])
    .pipe(imageResize({ width: defaultWidth }))
    .pipe(imagemin({ plugins: [pngToJpeg({ quality: 100 })] }))
    .pipe(imagemin([imagemin.mozjpeg({ quality: 80, progressive: true })]))
    .pipe(rename({ suffix: `_fallback`, extname: '.jpg' }))
    .pipe(dest(paths.imgSrc));
  cb();
};

const browserSyncReload = (cb) => {
  bs.reload();
  cb();
};

const copyBootstrapCSSToProject = () => src(paths.bootstrapFrom).pipe(dest(paths.bootstrapTo));
const copyAnimateCSSToProject = () => src(paths.animateCSSFrom).pipe(dest(paths.animateCSSTo));

const sassCompile = () =>
  src(`${paths.sassSrc}/**/style.scss`)
    .pipe(
      sass({
        includePaths: `${paths.sassSrc}/sass`,
      }).on('error', sass.logError)
    )
    .pipe(dest(`${paths.build}/assets/css`));

const minifyCss = () => {
  const postcssPlugins = [
    cssDeclarationSorter({ order: 'concentric-css' }),
    postcssFlexbugsFixes(),
    postcssCustomProperties(),
    postcssCalc(),
    postcssMergeRules(),
    cssDeclarationSorter({ order: 'concentric-css' }),
    autoprefixer(),
    purgecss({
      content: ['./_site/**/*.html'],
      css: [`${paths.build}/**/*.css`, `${paths.build}/**/!*font*.css`],
      whitelist: ['html', 'body'],
    }),
    cssnano(),
  ];

  return src(`${paths.build}/**/*.css`).pipe(gulpPostcss(postcssPlugins)).pipe(dest(paths.build));
};
const minifyHtml = () =>
  src(`${paths.build}/**/*.html`)
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(dest(paths.build));
const minifyJs = () =>
  src(`${paths.build}/**/*.js`)
    .pipe(
      terser({
        keep_fnames: true,
        mangle: false,
      })
    )
    .pipe(dest(paths.build));

// const deleteUnnecessary = () => {
//     const deletedPaths = del('_site/_projects');
//     return deletedPaths;
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

const eleventyBuild = (cb) => {
  execSync('npm run build-11y');
  cb();
};

// const trueSyncSeries = (...tasks) => {
//     return (cb) => {
//         execSync(tasks.map((f) => `gulp ${f}`).join('&&'));
//         cb();
//     };
// };

const beforeBuild = series(resizeImage, minifyImage, minifyImageJPGForFallback);
const afterBuild = parallel(minifyCss, minifyHtml, minifyJs);
const build = series(
  // beforeBuild,
  parallel(eleventyBuild, copyBootstrapCSSToProject, copyAnimateCSSToProject),
  sassCompile,
  afterBuild
  // deleteUnnecessary
);

const browserSyncInit = (cb) => {
  bs.init({ server: { baseDir: paths.build } });
  cb();
};
const watchAll = (cb) => {
  const watchOptions = {
    ignored: [paths.build, paths.imgRawData, paths.imgSrc],
    delay: 300,
    awaitWriteFinish: true,
  };
  const taskWhenChange = series(build, browserSyncReload);

  watch('.', watchOptions, taskWhenChange);
  cb();
};

// const minifyCssDev = (cb) => {
//     const postcssPlugins = [
//         cssDeclarationSorter({ order: 'concentric-css' }),
//         postcssFlexbugsFixes(),
//         postcssMergeRules(),
//         cssDeclarationSorter({ order: 'concentric-css' }),
//     ];

//     src(`${paths.cssSrc}/**/*.css`)
//         .pipe(gulpPostcss(postcssPlugins))
//         .pipe(dest(paths.cssSrc));
//     cb();
// };
// const minifyScssDev = (cb) => {
//     const postcssPlugins = [
//         cssDeclarationSorter({ order: 'concentric-css' }),
//         postcssFlexbugsFixes(),
//         postcssMergeRules(),
//         cssDeclarationSorter({ order: 'concentric-css' }),
//     ];

//     src(`${paths.cssSrc}/**/*.scss`)
//         .pipe(gulpPostcss(postcssPlugins, { parser: postcssScssParser }))
//         .pipe(dest(paths.cssSrc));
//     cb();
// };

exports.resizeImage = resizeImage;
exports.minifyImage = minifyImage;
exports.minifyImageJPGForFallback = minifyImageJPGForFallback;

// exports.copyLibsCSSToProject = parallel(
//     copyBootstrapCSSToProject,
//     copyAnimateCSSToProject
// );
// exports.minifyStyleDev = series(minifyCssDev, minifyScssDev);
exports.sassCompile = sassCompile;

exports.beforeBuild = beforeBuild;
exports.eleventyBuild = eleventyBuild;
exports.afterBuild = afterBuild;
exports.build = build;
exports.default = series(build, browserSyncInit, watchAll);
