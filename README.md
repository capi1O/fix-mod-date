# fix-mod-date [![NPM package version](https://img.shields.io/npm/v/fix-mod-date.svg?style=flat-square)](https://www.npmjs.com/package/fix-mod-date) [![NPM downloads](https://img.shields.io/npm/dm/fix-mod-date.svg?style=flat-square)](https://www.npmjs.com/package/fix-mod-date) [![Build Status](https://img.shields.io/travis/com/didrip/fix-mod-date/master?style=flat-square)](https://travis-ci.com/didrip/fix-mod-date) [![codecov.io](https://img.shields.io/codecov/c/github/didrip/fix-mod-date/master.svg?style=flat-square)](http://codecov.io/github/didrip/fix-mod-date?branch=master)

`fix-mod-date` is a CLI tool which reads & updates the modification date of various file types by parsing their contents. Of course it does not work with any file because the date must be saved in the file somehow.

The directories modification times will then match the modification time of the latest file it contains. (it is not updated directly by `fix-mod-date`, this is managed by filesystem)

*It can happen that the modification date of a file is incorrect for various reasons, ex. if a file has been copied without preserving modification dates, such as when it is moved from one filesystem to another.*

# compatibilty

Node.JS >= 10

*Note: run `export NODE_NO_WARNINGS=1` before `fix-mod-date` to avoid fs.promises API ExperimentalWarning on Node 10.x.*

# install

[available on npm](https://www.npmjs.com/package/fix-mod-date).

`npm install -g fix-mod-date`

# use

`fix-mod-date /some/file.ai /some/other/file.ai /some/directory`

## options

- `--version`: outputs version
- `t` or `--test`: test mode. date will not be modified.
- `v` or `--verbose`: verbose logging.
- `q` or `--quiet`: no output at all.
- `r` or `--recursive`: recursive level for processing directories. default = `1`;

# supported file types

- `ai` (Adobe Illustrator)
- `psd` (Adobe Photoshop)
- `eps` (Encapsulated Postscript)
- `aep` (Adobe After Effects project)
- `jpg/jpeg` *needs EXIF data*
- `tiff` *needs EXIF data*
- `heic` *needs EXIF data*
- `heif` *needs EXIF data*
- `webp` *needs EXIF data*
- `mp4/mpg4` (MPEG-4 Part 14)
- `m4a` (MPEG-4 Part 14 Audio)
- `zip` (ZIP compressed file)

# develop

## setup

- `git clone https://github.com/didrip/fix-mod-date && cd fix-mod-date`
- `npm install`
- `npm run build`
- `npm link`

## live changes

`npm run dev`

## test

`npm run test`

## toolchain

- [babel](https://github.com/babel/babel) => code transpiler so experimental ES features can be used (ex : [optional chaining operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining))
- [webpack](https://github.com/webpack/webpack) => live transpiler (to dist) + support additonal option node features such as [top level await](https://v8.dev/features/top-level-await) which is not transpiled (yet) by babel itself.
- [mocha](https://github.com/mochajs/mocha) => run tests runner.
- [chai](https://github.com/chaijs/chai) => assertion library + CLI runner wrapper.
- [eslint](https://github.com/eslint/eslint) => code linter.