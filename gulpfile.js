
var gulp = require('gulp')
var jade = require('jade')
var gj = require('gulp-jade')
var sass = require('node-sass')
var pleeease = require('pleeease')

jade.filters.es6 = require('jade-6to5')({})
jade.filters.scss = function(src) {
  var css = sass.renderSync({ data: src }).css
  return pleeease.process(css)
}

gulp.task('compile', function() {
  return gulp.src('src/**/*.jade')
    .pipe(gj({ jade: jade }))
    .pipe(gulp.dest('dist'))
})

var srcs = [
  'src/**/*.jade',
  'src/**/*.js',
  'src/**/*.scss',
]

gulp.task('watch', function() {
  gulp.watch(srcs, ['compile'])
})
