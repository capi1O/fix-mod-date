const fs			= require('fs');
const util		= require('util');

const readFile = util.promisify(fs.readFile);

const timestamp = async (absFilePath) => {

	try {
		const data = await readFile(absFilePath, 'utf8');
		// search for <xmp:ModifyDate>
		let timestamp = null;
		const match = data.match(/<xmp:ModifyDate>(.*)<\/xmp:ModifyDate>/m);
		if (match === null) console.error(`could not find <xmp:ModifyDate> in ${absFilePath}`);
		else {
			const dateString = match[1]; // format 2018-05-22T11:00:15+02:00 (ISO8601)
			console.log(dateString);
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

module.exports = { timestamp };
