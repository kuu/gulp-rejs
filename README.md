gulp-rejs
=========

Gulp support for [ReJS](https://github.com/Moncader/rejs), a tool for concatenating JavaScript files based on their dependencies.
*Issues with the output should be reported on the [ReJS issue tracker] (https://github.com/Moncader/rejs/issues).*

##Install
```
$ npm install --save-dev gulp-rejs
```

##Usage
```javascript
var gulp = require('gulp');
var rejs = require('gulp-rejs');

gulp.task('default', function () {
    return gulp.src('src/**/*.js')
        .pipe(traceur())
        .pipe(rejs('output.js'))
        .pipe(gulp.dest('dist'));
});
```

##API
###rejs(outputFileName, options)
Options are passed through to ReJS, except for options.newLine which is set for you.
####outputFileName
####options

#####newLine

Type: string
Default: gulp-util.linefeed

The string will be used to separate each file content.

##License
MIT
