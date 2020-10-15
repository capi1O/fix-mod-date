import parseArgs from 'minimist';
import path from 'path';
import fs from 'fs';
import pdf from './pdf.js';
import xmp from './adobe-xmp.js';
import exif from './exif.js';
import zxmp from './zip-adobe-xmp.js';
import mp4 from './mp4.js';
import zip from './zip.js';
import pjson from '../package.json';
import utimesModule from 'utimes';
const { utimes } = utimesModule;


const processFile = async (absFilePath, fallback, verbose, test, quiet) => {
	const extension = path.extname(absFilePath).toLowerCase();

	// 0. check if path exists
	if (!fs.existsSync(absFilePath)) {
		console.error(`no file at path ${absFilePath}`);
		return null;
	}

	// 1. read file
	const dataBuffer = await fs.promises.readFile(absFilePath);

	// 2. get file timestamp
	let timestamp;
	let supported = true;
	switch (extension) {
		case '.pdf':
			if (verbose) console.log(`processing PDF file ${absFilePath}`);
			timestamp = await pdf.mtime(dataBuffer.toString('utf8'), verbose, absFilePath);
			// if cannot find timestamp, look for Adobe XMP mod date (in case PDF was made on Indesign for ex).
			if (!timestamp) timestamp = await xmp.mtime(dataBuffer.toString('utf8'), verbose, absFilePath);
			break;

		case '.ai':
		case '.aep':
		case '.psd':
		case '.eps':
			if (verbose) console.log(`processing Adobe XMP file ${absFilePath}`);
			timestamp = await xmp.mtime(dataBuffer.toString('utf8'), verbose, absFilePath);
			break;

		case '.jpeg':
		case '.jpg':
		case '.tif':
		case '.tiff':
		case '.heic':
		case '.heif':
		case '.webp':
			if (verbose) console.log(`processing image file ${absFilePath}`);
			timestamp = await exif.mtime(dataBuffer, verbose, absFilePath);
			break;

		case '.prproj':
			if (verbose) console.log(`processing compressed Adobe XMP file ${absFilePath}`);
			timestamp = await zxmp.mtime(dataBuffer, verbose, absFilePath);
			break;

		case '.mp4':
		case '.m4a':
		case '.mpg4':
			if (verbose) console.log(`processing mp4 file ${absFilePath}`);
			timestamp = await mp4.mtime(dataBuffer, verbose, absFilePath);
			break;

		case '.zip':
			if (verbose) console.log(`processing zip file ${absFilePath}`);
			timestamp = await zip.mtime(dataBuffer, verbose, absFilePath);
			break;

		default:
			if (!quiet) console.log(`unsupported file type '${extension}' for file ${absFilePath}`);
			supported = false;
			break;
	}

	// 3. fallback to file system modification date (file timestamp required for parent dir)
	if (timestamp == null) {
		if (fallback) {
			if (!quiet) console.log(`could not find timestamp in content for file ${absFilePath}, reading OS timestamp`);
			const fileStats = await fs.promises.stat(absFilePath);
			return fileStats?.mtimeMs;
		}
		else {
			if (supported) {
				if (!quiet) console.log(`could not find timestamp in content for file ${absFilePath}, skipping`);
			}
		}
	}

	if (timestamp != null) {
		// 4.A output timestamp (test mode)
		if (test) {
			if (supported || fallback) console.log(`file ${absFilePath} timestamp is '${timestamp}'`);
		}

		// 4.B modify file time (write mode)
		else {
			if (supported) {
				await utimes(absFilePath, { mtime: timestamp });
				if (!quiet) console.log(`modified file ${absFilePath} timestamp => '${timestamp}'`);
			}
		}
	}

	return timestamp;
};


const processPaths = async (directoryPath, names, recurseLevel, maxRecurseLevel, ignoredFiles, fallback, verbose, test, quiet) => {

	if (verbose) console.log(`processing [${names.join(',')}]`);

	let timestamp = 0;

	for (const name of names) {
		try {

			// 0. get absolute path
			const absolutePath = path.resolve(directoryPath, name);
			if (verbose) console.log(absolutePath);

			// 1. check if argument is correct
			if (typeof absolutePath !== 'string' && !(absolutePath instanceof String)) { console.error('invalid path'); process.exit(1); }

			// 2. skip system files
			if (ignoredFiles.includes(path.basename(name))) {
				if (!quiet) console.log(`skipping file '${name}'`);
			}

			// 3. process file or directory
			else {
				const stat = await fs.promises.lstat(absolutePath);
				if (stat.isDirectory()) {
					if (recurseLevel < maxRecurseLevel) {
						const subNames = await fs.promises.readdir(absolutePath);
						const dirTimestamp = await processPaths(absolutePath, subNames, recurseLevel + 1, maxRecurseLevel, ignoredFiles, fallback, verbose, test, quiet);
						if (dirTimestamp && dirTimestamp > timestamp) timestamp = dirTimestamp;

						// 3A. read dir timestamp
						if (!test) {
							// directory date is modified by OS when files times are modified
							if (!quiet) console.log(`modified dir ${absolutePath} timestamp => '${dirTimestamp}'`);
						}
						else console.log(`dir ${absolutePath} timestamp => '${dirTimestamp}'`);
					}
					else if (verbose) console.log(`maximum recurse level '${maxRecurseLevel}' reached`);
				}
				else {
					// 3B. update file timestamp
					const fileTimestamp = await processFile(absolutePath, fallback, verbose, test, quiet);
					if (fileTimestamp && fileTimestamp > timestamp) timestamp = fileTimestamp;
				}
			}
		}
		catch (error) {
			console.error(`error processing ${name} :\n`, error);
		}
	}

	return timestamp !== 0 ? timestamp : null;
}

const systemFiles = [
	'.DS_Store',
	// '.DS_Store?',
	// '._*',
	'.Spotlight-V100',
	'.Trashes',
	'ehthumbs.db',
	'Thumbs.db'
];

// main
const argsOptions = {
	boolean: ['v', 't', 'q', 'version', 'd', 'f'],
	string: ['i'],
	alias: { v: 'verbose', t: 'test', q: 'quiet', r: 'recursive-level', i: 'ignore', f: 'fallback' },
	default: { r: 1, v: false, t: false, q: false, i: [], f: false }
};
const { _: names, ...args } = parseArgs(process.argv.slice(2), argsOptions);
const { r: maxRecurseLevel, v: verbose, t: test, q: quiet, version, i: ignore, f: fallback } = args;

let ignoredFiles;
if (Array.isArray(ignore)) ignoredFiles = ignore;
else ignoredFiles = [ignore]; // in case only one argument is provided minimist default to string. see issue https://github.com/substack/minimist/issues/136

if (version) console.log(`v${pjson.version}`);
if (verbose && test) console.log('running in test mode, no files/folder will be modifed');

if (names.length > 0) await processPaths(process.cwd(), names, 0, maxRecurseLevel, [...ignoredFiles, ...systemFiles], fallback, verbose, test, quiet);

process.exit(0);
