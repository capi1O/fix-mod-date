// search for <xmp:ModifyDate> or <xap:ModifyDate>

/**
 * Retrieves the creation time of Adobe XMP file
 * @param {Buffer} data
 * @param {Bool} verbose
 * @param {String} absFilePath
 * @return {(Number | null)} timestamp the creation time or null
 */
const mtime = async (data, verbose, absFilePath) => {

	try {
		let timestamp = null;
		const match = data.match(/<x[am]p:ModifyDate>(.*)<\/x[am]p:ModifyDate>/m);
		if (match === null) console.error(`could not find ModifyDate in ${absFilePath}`);
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
};

const xmp = { mtime }
export default xmp;

