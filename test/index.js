var expect = require('chai').expect,
    gulpRejs = require('../'),
    util = require('gulp-util'),
    LB = util.linefeed,
    File = util.File;

describe('gulp-rejs', function() {

  it('sorts JS files based on the dependencies between them.', function(done) {
    var stream = gulpRejs('out.js');

    stream.on('data', function(sortedFile) {
      expect(String(sortedFile.contents)).to.eq('var vrB;' + LB + 'function fnA() {vrB;}' + LB + 'fnA();');
    });
    stream.once('end', function () {
      done();
    });
    stream.write(new File({
      contents: new Buffer('fnA();'),
      cwd: './',
      base: '/test/',
      path: '/test/a.js'
    }));
    stream.write(new File({
      contents: new Buffer('function fnA() {vrB;}'),
      cwd: './',
      base: '/test/',
      path: '/test/b.js'
    }));
    stream.write(new File({
      contents: new Buffer('var vrB;'),
      cwd: './',
      base: '/test/',
      path: '/test/c.js'
    }));
    stream.end();
  });

  it('throws an error when filePath is not supplied', function() {
    function nopath() {
      gulpRejs();
    }
    expect(nopath).to.throw('Missing file option');
  });

});
