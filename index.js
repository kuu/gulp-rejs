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
      errors = [],
      resolver = null;

  var mVerbosity = 0;

  if (!filePath) {
    throw new PluginError('gulp-rejs', 'Missing file option');
  }

  options = options || {};

  // to preserve existing |undefined| behaviour and to introduce |newLine: ""| for binaries
  if (typeof options.newLine !== 'string') {
    options.newLine = util.linefeed;
  }

  function readSource(pKey) {
    return blobs[pKey];
  }

  if (typeof options.readSource !== 'function') {
    options.readSource = readSource;
  }

  if (typeof options.verbosity !== 'number') {
    options.verbosity = mVerbosity;
  } else {
    mVerbosity = options.verbosity;
  }

  function log(pVerbosity) {
    if (mVerbosity >= pVerbosity) {
      util.log.apply(util, Array.prototype.slice.call(arguments, 1));
    }
  }

  if (typeof options.log !== 'function') {
    options.log = log;
  }

  if (typeof options.globalClosureReferences !== 'object') {
    options.globalClosureReferences = ['window'];
  }

  if (typeof filePath !== 'string') {
    if (typeof filePath.path !== 'string') {
      throw new PluginError('gulp-rejs', 'Missing path in file options');
    }
    fileName = path.basename(filePath.path);
    firstFile = new File(filePath);
  }

  resolver = new rejs.Resolver(options);

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

    try {
      resolver.add(file.path);
    } catch (e) {
      errors.push({
        key: file.path,
        error: e
      });
    }

    cb();
  }

  function endStream(cb) {
    if (errors.length) {
      var errorMessages = [];

      errors.forEach(function(pError) {
        errorMessages.push('\n' + pError.key + ':');
        errorMessages.push(pError.error);

        if (mVerbosity > 1 && pError.error.stack) {
          errorMessages.push(pError.error.stack);
        }
      });

      cb(new PluginError('gulp-rejs', errorMessages.join('\n')));

      return;
    }

    var buffer = new Buffer(0),
        sortedFiles = resolver.resolve(),
        joinedFile;

    if (firstFile) {
      resolver.log(2, sortedFiles.join('\n'));

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
