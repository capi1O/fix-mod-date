// search for <xmp:ModifyDate>
const fs	= require('fs').promises;


const mtime = async (absFilePath, verbose) => {

	try {
		const data = await fs.readFile(absFilePath, 'utf8');
		let timestamp = null;
		const match = data.match(/<xmp:ModifyDate>(.*)<\/xmp:ModifyDate>/m);
		if (match === null) console.error(`could not find <xmp:ModifyDate> in ${absFilePath}`);
		else {
			const dateString = match[1]; // format 2018-05-22T11:00:15+02:00 (ISO8601)
			if (verbose) console.log(`date from ${absFilePath} is '${dateString}'`);
			const date = new Date(dateString);
			timestamp = date.getTime();
		}
		return timestamp;
	}
	catch (error) {
		console.error(`error reading file ${absFilePath} :\n`, error);
		// throw err;
		return null;
	}
}

module.exports = { mtime };
