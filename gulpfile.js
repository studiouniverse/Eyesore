var gulp = require("gulp");
var concat = require("gulp-concat");
// var uglify = require("gulp-uglify");
var watch = require("gulp-watch");

gulp.task("minify-js", function() {
  return gulp.src([
      "src/_header.js",

      "src/util.js",

      "src/variables.js",
      "src/blocks.js",
      "src/level.js",

      "src/mountains.js",
      "src/water.js",

      "src/player.js",
      "src/controls.js",
      "src/collisions.js",

      "src/entities.js",
      "src/eyes.js",
      "src/lightning.js",

      "src/text.js",

      "src/gamestate.js",

      "src/_footer.js"
    ])
    .pipe(concat("l-concat.js"))
    // .pipe(uglify({
    //   toplevel: true,
    //   mangleProperties: ["rightBlock"]
    // }))
    .pipe(gulp.dest("./"));
});

gulp.task('watch-js', function() {
  gulp.watch(["./src/*.js"], ['minify-js']);
});

gulp.task('default', ['minify-js', 'watch-js']);
