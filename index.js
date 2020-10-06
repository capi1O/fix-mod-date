#!/usr/bin/env node

const path				= require('path');
const ai					= require('./ai');
const xml					= require('./xml');
const { utimes }	= require('utimes');

const filename = process.argv.length >= 3 ? process.argv[2] : false;

if (!filename) { console.error('filename argument required'); process.exit(1); }
if (typeof filename !== 'string' && !(filename instanceof String)) { console.error('invalid filename'); process.exit(1); }

const absoluteFilepath = path.resolve(process.cwd(), filename);
console.log(absoluteFilepath);

const extension = path.extname(absoluteFilepath);

(async function() {
	let timestamp;
	switch (extension) {
		case '.ai':
			console.log(`parsing Illustrator file ${absoluteFilepath}`);
			timestamp = await ai.timestamp(absoluteFilepath);
			break;

		case '.xml':
			console.log(`parsing XML file ${absoluteFilepath}`);
			timestamp = xml.timestamp(absoluteFilepath)
			break;

		default:
			console.error(`unsupported file type ${absoluteFilepath}`);
			break;
	}
	console.log(timestamp);
	if (timestamp) utimes(absoluteFilepath, { mtime: timestamp });
	process.exit(0);
}());
