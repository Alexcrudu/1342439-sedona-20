const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const del = require("del");
const webp = require("gulp-webp");
const uglify = require("gulp-uglify")

//Copy

const copy = () => {
  return gulp.src([
  "source/fonts/**/*.{woff,woff2}",
  "source/img/**",
  "source/js/**",
  "source/*.ico",
  "source/*.html"
  ], {
    base: "source"
  })
.pipe(gulp.dest("build"))
}

exports.copy = copy;

//Clean

const clean = () => {
  return del("build");
}

exports.clean = clean;

// Image

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.mozjpeg({progressive: true}),
    imagemin.svgo()
  ]))
  .pipe(gulp.dest("build/img"))
}

exports.images = images;

//Webp

const converToWebP = ( ) => {
  return gulp.src("source/img/**/*.{png,jpg}")
  .pipe(webp({quality: 75}))
  .pipe(gulp.dest("source/img"))
}

exports.webp = converToWebP;

//jsMinification

const jsmin = () => {
  return gulp.src("source/js/**/*.js")
    .pipe(uglify())
    .pipe(gulp.dest("build/js"))
};

exports.jsmin = jsmin;

// Styles

const styles = () => {
  return gulp.src("source/less/style.less")
  .pipe(plumber())
  .pipe(sourcemap.init())
  .pipe(less())
  .pipe(postcss([
    autoprefixer()
  ]))
  .pipe(csso())
  .pipe(rename("style.min.css"))
  .pipe(sourcemap.write("."))
  .pipe( gulp.dest("build/css") )
  .pipe(sync.stream());
}

exports.styles = styles;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: "build"
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/less/**/*.less", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", sync.reload);
  gulp.watch("source/js/**/*.js").on("change", gulp.series("jsmin"));
}

const build = gulp.series(
  clean, styles, images, jsmin, converToWebP, copy
);

exports.build = build

exports.default = gulp.series(
  build, server, watcher
)
