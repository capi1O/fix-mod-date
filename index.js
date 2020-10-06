#!/usr/bin/env node

const parseArgs		= require('minimist');
const path				= require('path');
const fs					= require('fs').promises;
const ai					= require('./ai');
const xml					= require('./xml');
const { utimes }	= require('utimes');


const processFile = async (absFilePath, verbose, test, quiet) => {
	const extension = path.extname(absFilePath);

	let timestamp;
	switch (extension) {
		case '.ai':
			if (verbose) console.log(`processing Illustrator file ${absFilePath}`);
			timestamp = await ai.timestamp(absFilePath, verbose);
			break;

		case '.xml':
			if (verbose) console.log(`processing XML file ${absFilePath}`);
			timestamp = xml.timestamp(absFilePath)
			break;

		default:
			console.error(`unsupported file type ${absFilePath}`);
			break;
	}
	if (verbose || test) console.log(`file ${absFilePath} timestamp is '${timestamp}'`);
	if (!test && timestamp) {
		await utimes(absFilePath, { mtime: timestamp });
		if (!quiet) console.log(`modified ${absFilePath} timestamp => '${timestamp}'`);
	}
};


const processPaths = async (directory, names, recurseLevel, maxRecurseLevel, verbose, test, quiet) => {

	if (verbose) console.log(`processing [${names.join(',')}]`);

	for (const name of names) {
		try {
			// 0. get absolute path
			const absolutePath = path.resolve(directory, name);
			if (verbose) console.log(absolutePath);
			// 1. check if argument is correct
			if (typeof absolutePath !== 'string' && !(absolutePath instanceof String)) { console.error('invalid path'); process.exit(1); }
			// 2. process file or directory
			const stat = await fs.lstat(absolutePath);
			if (stat.isDirectory()) {
				if (recurseLevel < maxRecurseLevel) {
					const subNames = await fs.readdir(absolutePath);
					await processPaths(absolutePath, subNames, recurseLevel + 1, maxRecurseLevel, verbose, test, quiet);
				}
				else if (verbose) console.log(`maximum recurse level '${maxRecurseLevel}' reached`);
			}
			else await processFile(absolutePath, verbose, test, quiet);
		}
		catch (error) {
			console.error(`error processing ${name} :\n`, error);
		}
	}
}

// 0. Parse Arguments
const argsOptions = {
	boolean: ['v', 't', 'q', 'version'],
	alias: { v: 'verbose', t: 'test', q: 'quiet', r: 'recursive-level' },
	default: { r: 1, v: false, t: false, q: false }
};
const { _: names, ...args } = parseArgs(process.argv.slice(2), argsOptions);
const { r: maxRecurseLevel, v: verbose, t: test, q: quiet, version } = args;

if (version) console.log('v1.0.0');
if (verbose && test) console.log('running in test mode, no files/folder will be modifed');

(async function() {
	await processPaths(process.cwd(), names, 0, maxRecurseLevel, verbose, test, quiet);

	process.exit(0);
}());
