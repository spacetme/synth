
var gulp = require('gulp')
var jade = require('jade')
var gj = require('gulp-jade')
var sass = require('node-sass')
var pleeease = require('pleeease')
var path = require('path')
var merge = require('merge-stream')

jade.filters.es6 = require('jade-6to5')({})
jade.filters.scss = function(src, options) {
  var ipath = path.dirname(options.filename)
  var css = sass.renderSync({ data: src, includePaths: [ipath] }).css
  return pleeease.process(css)
}

gulp.task('compile', function() {
  return merge(
    gulp.src('src/**/*.jade')
      .pipe(gj({ jade: jade, pretty: true }))
      .pipe(gulp.dest('dist')),
    gulp.src('src/**/*.jpg')
      .pipe(gulp.dest('dist'))
  )
})

var srcs = [
  'src/**/*.jade',
  'src/**/*.js',
  'src/**/*.scss',
]

gulp.task('watch', function() {
  gulp.watch(srcs, ['compile'])
})

gulp.task('default', ['compile', 'watch'])
