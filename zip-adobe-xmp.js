// unzip and search for <MZ.BuildVersion.Modified>
const zlib	= require('zlib');


const mtime = async (zippedData, verbose, absFilePath) => {

	try {
		let timestamp = null;

		// 1. unzip
		const data = zlib.gunzipSync(zippedData); //, { windowBits });


		// 2. find <WorkspaceDefinition> section
		const match = data.toString('utf8').match(/<MZ\.BuildVersion\.Modified>(.*)<\/MZ\.BuildVersion\.Modified>/m); // 14.0.1x71 - 01-Oct-20 16:18:57
		if (match === null) console.error(`could not find <MZ.BuildVersion.Modified> in ${absFilePath}`);
		else {
			const dateString = match[1]; // HTML encoded content
			if (verbose) console.log(`build date from ${absFilePath} is '${dateString}'`);
			// const date = new Date(dateString);
			// timestamp = date.getTime();
		}

		return timestamp;
	}
	catch (error) {
		console.error(`error processing file ${absFilePath} :\n`, error);
		// throw err;
		return null;
	}
}

module.exports = { mtime };
