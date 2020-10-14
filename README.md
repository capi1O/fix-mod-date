# fix-mod-date [![NPM package version](https://img.shields.io/npm/v/fix-mod-date.svg?style=flat-square)](https://www.npmjs.com/package/fix-mod-date) [![NPM downloads](https://img.shields.io/npm/dm/fix-mod-date.svg?style=flat-square)](https://www.npmjs.com/package/fix-mod-date) [![Build Status](https://img.shields.io/travis/com/didrip/fix-mod-date/master?style=flat-square)](https://travis-ci.com/didrip/fix-mod-date) [![codecov.io](https://img.shields.io/coveralls/github/didrip/fix-mod-date/master.svg?style=flat-square)](http://codecov.io/github/didrip/fix-mod-date?branch=master)

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


## dependencies [![Dependency Status](https://david-dm.org/didrip/fix-mod-date.svg?style=flat-square)](https://david-dm.org/didrip/fix-mod-date) 

- [exifreader](https://github.com/mattiasw/ExifReader)
- [moment](https://github.com/moment/moment)
- [utimes](https://github.com/baileyherbert/utimes)
- [minimist](https://github.com/substack/minimist)


## toolchain [![devDependencies Status](https://david-dm.org/didrip/fix-mod-date/dev-status.svg?style=flat-square)](https://david-dm.org/didrip/fix-mod-date?type=dev)

<table align="center">
	<tr>
		<td align="center">Bundler</td>
		<td align="center"><img src="https://github.com/webpack/media/blob/master/logo/icon-square-small.svg" height="24" alt="Webpack"></td>
		<td align="center"><a href="https://github.com/webpack/webpack">Webpack&nbsp;5</a></td>
		<td align="left">live transpiler (to dist) + support additonal option node features such as <a href="https://v8.dev/features/top-level-await">top level await</a> which is not transpiled (yet) by babel itself.</td>
	</tr>
	<tr>
		<td align="center">Transpiler</td>
		<td align="center"><img src="https://github.com/babel/logo/blob/master/babel.svg" height="24" alt="Babel"></td>
		<td align="center"><a href="https://github.com/babel/babel">Babel&nbsp;7</a></td>
		<td align="left">code transpiler so experimental ES features can be used (ex : <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining">optional chaining operator</a>).</td>
	</tr>
	<tr>
		<td align="center">Test&nbsp;runner</td>
		<td align="center"><img src="https://camo.githubusercontent.com/af4bf83ab2ca125346740f9961345a24ec43b3a9/68747470733a2f2f636c6475702e636f6d2f78465646784f696f41552e737667" height="24" alt="Mocha"></td>
		<td align="center"><a href="https://github.com/mochajs/mocha">Mocha&nbsp;8</a></td>
		<td align="left">describe and organize tests.</td>
	</tr>
	<tr>
		<td align="center">Assertion&nbsp;library</td>
		<td align="center"><img src="https://camo.githubusercontent.com/431283cc1643d02167aac31067137897507c60fc/687474703a2f2f636861696a732e636f6d2f696d672f636861692d6c6f676f2e706e67" height="24" alt="Chai"></td>
		<td align="center"><a href="https://github.com/chaijs/chai">Chai&nbsp;4</a></td>
		<td align="left">CLI runner wrapper.</td>
	</tr>
	<tr>
		<td align="center">Linter</td>
		<td align="center"><img src="https://upload.wikimedia.org/wikipedia/en/thumb/e/e3/ESLint_logo.svg/128px-ESLint_logo.svg.png" height="24" alt="ESlint"></td>
		<td align="center"><a href="https://github.com/eslint/eslint">ESlint&nbsp;7</a></td>
			<td align="left">code linter.</td>
	</tr>
	<tr>
		<td align="center">CI</td>
		<td align="center"><img src="https://github.com/travis-ci/travis-web/raw/master/public/images/logos/TravisCI-Mascot-1.png" height="24" alt="Travis"></td>
		<td align="center"><a href="https://github.com/travis-ci/travis-ci">Travis</a></td>
			<td align="left">continuous integration.</td>
	</tr>
</table>

# Licence [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

[MIT](LICENSE)
