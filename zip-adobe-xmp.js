// unzip and search for <MZ.BuildVersion.Modified>
const zlib	= require('zlib');
const xmp		= require('./adobe-xmp');


const mtime = async (zippedData, verbose, absFilePath) => {

	try {
		let timestamp = null;

		// 1. unzip
		const dataString = zlib.gunzipSync(zippedData).toString('utf8');


		// 2. try to get Adobe XMP date
		timestamp = await xmp.mtime(dataString, verbose, absFilePath);
		// console.log(timestamp);

		// 3. if not found read build find <WorkspaceDefinition> which is the build date of the Premiere software file was made with, therefore file can only be older
		if (!timestamp) {
			const match = dataString.match(/<MZ\.BuildVersion\.Modified>.*\s-\s(.*)<\/MZ\.BuildVersion\.Modified>/m); // ex 01-Oct-20 16:18:57 or 9/24/2018 2:19:21 PM
			if (match === null) console.error(`could not find <MZ.BuildVersion.Modified> in ${absFilePath}`);
			else {
				const dateString = match[1];
				if (verbose) console.log(`build date from ${absFilePath} is '${dateString}'`);
				const date = new Date(dateString);
				timestamp = date.getTime();

				// TODO : only modify date if current modified date is earlier than build date
			}
		}

		return timestamp;
	}
	catch (error) {
		console.error(`error processing file ${absFilePath} :\n`, error);
		// throw err;
		return null;
	}
};

module.exports = { mtime };
