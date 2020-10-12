import parseArgs from 'minimist';
import path from 'path';
import fs from 'fs';
import pdf from './pdf.js';
import xmp from './adobe-xmp.js';
import exif from './exif.js';
import zxmp from './zip-adobe-xmp.js';
import mp4 from './mp4.js';
import zip from './zip.js';
import utimesModule from 'utimes';
const { utimes } = utimesModule;


const processFile = async (absFilePath, verbose, test, quiet) => {
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
		case '.tiff':
		case '.heic':
		case '.heif':
		case '.webp':
			if (verbose) console.log(`processing image file ${absFilePath}`);
			timestamp = await exif.mtime(dataBuffer.toString('utf8'), verbose, absFilePath);
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
			console.error(`unsupported file type ${absFilePath}`);
			break;
	}

	// 3. fallback to file mod date (file timestamp required for parent dir)
	if (!timestamp) {
		if (verbose) console.log(`could not find timestamp for file ${absFilePath}`);
		return utimes(absFilePath)?.mtime;
	}

	// 4. modify file time
	if (verbose || test) console.log(`file ${absFilePath} timestamp is '${timestamp}'`);
	if (!test) {
		await utimes(absFilePath, { mtime: timestamp });
		if (!quiet) console.log(`modified file ${absFilePath} timestamp => '${timestamp}'`);
	}

	return timestamp;
};


const processPaths = async (directoryPath, names, recurseLevel, maxRecurseLevel, verbose, test, onlyFiles, quiet) => {

	if (verbose) console.log(`processing [${names.join(',')}]`);

	let timestamp = 0;

	for (const name of names) {
		try {

			// 0. get absolute path
			const absolutePath = path.resolve(directoryPath, name);
			if (verbose) console.log(absolutePath);

			// 1. check if argument is correct
			if (typeof absolutePath !== 'string' && !(absolutePath instanceof String)) { console.error('invalid path'); process.exit(1); }

			// 2. process file or directory
			const stat = await fs.promises.lstat(absolutePath);
			if (stat.isDirectory()) {
				if (recurseLevel < maxRecurseLevel) {
					const subNames = await fs.promises.readdir(absolutePath);
					const dirTimestamp = await processPaths(absolutePath, subNames, recurseLevel + 1, maxRecurseLevel, verbose, test, quiet);
					if (dirTimestamp && dirTimestamp > timestamp) timestamp = dirTimestamp;
					if (!onlyFiles) {
						if (!test) {
							await utimes(absolutePath, { mtime: dirTimestamp });
							if (!quiet) console.log(`modified dir ${absolutePath} timestamp => '${dirTimestamp}'`);
						}
						else console.log(`dir ${absolutePath} timestamp => '${dirTimestamp}'`);
					}
				}
				else if (verbose) console.log(`maximum recurse level '${maxRecurseLevel}' reached`);
			}
			else {
				const fileTimestamp = await processFile(absolutePath, verbose, test, onlyFiles, quiet);
				if (fileTimestamp && fileTimestamp > timestamp) timestamp = fileTimestamp;
			}
		}
		catch (error) {
			console.error(`error processing ${name} :\n`, error);
		}
	}

	return timestamp !== 0 ? timestamp : null;
}

// main
const argsOptions = {
	boolean: ['v', 't', 'q', 'version', 'd'],
	alias: { v: 'verbose', t: 'test', q: 'quiet', r: 'recursive-level', f: 'files-only' },
	default: { r: 1, v: false, t: false, q: false, f: false }
};
const { _: names, ...args } = parseArgs(process.argv.slice(2), argsOptions);
const { r: maxRecurseLevel, v: verbose, t: test, q: quiet, version, f: onlyFiles } = args;

if (version) console.log('v1.0.0');
if (verbose && test) console.log('running in test mode, no files/folder will be modifed');

await processPaths(process.cwd(), names, 0, maxRecurseLevel, verbose, test, onlyFiles, quiet);

process.exit(0);