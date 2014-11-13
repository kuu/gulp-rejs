'use strict';
var util = require('gulp-util'),
    path = require('path'),
    through = require('through2'),
    rejs = require('rejs'),
    PluginError = util.PluginError,
    File = util.File;

module.exports = function (filePath, options) {
  var firstFile = null,
      fileName = filePath,
      blobs = {},
      resolver = null;

  if (!filePath) {
    throw new PluginError('gulp-rejs', 'Missing file option');
  }

  options = options || {};

  // to preserve existing |undefined| behaviour and to introduce |newLine: ""| for binaries
  if (typeof options.newLine !== 'string') {
    options.newLine = util.linefeed;
  }

  if (typeof filePath !== 'string') {
    if (typeof filePath.path !== 'string') {
      throw new PluginError('gulp-rejs', 'Missing path in file options');
    }
    fileName = path.basename(filePath.path);
    firstFile = new File(filePath);
  }

  resolver = new rejs.Resolver(options || {});

  function bufferContents(file, enc, cb) {

    if (file.isNull()) {
      return; // ignore
    }

    if (file.isStream()) {
      cb(new PluginError('gulp-rejs', 'Only Buffers are supported'));
      return;
    }

    if (!firstFile) {
      firstFile = file;
    }

    blobs[file.path] = file.contents.toString();
    cb();
  }

  function endStream(cb) {

    var buffer = new Buffer(0),
        sortedFiles = resolver.resolve(blobs),
        joinedFile;

    if (firstFile) {
      for (var i = 0, il = sortedFiles.length; i < il; i++) {
        buffer = Buffer.concat([
          buffer,
          i > 0 ? new Buffer(options.newLine) : buffer,
          new Buffer(blobs[sortedFiles[i]])
        ]);
      }

      joinedFile = firstFile;

      if (typeof filePath === 'string') {
        joinedFile = firstFile.clone({contents: false});
        joinedFile.path = path.join(firstFile.base, filePath);
      }

      joinedFile.contents = buffer;

      this.push(joinedFile);
    }
    cb();
  }

  return through.obj(bufferContents, endStream);
};
