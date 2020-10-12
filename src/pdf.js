// search for ModDate(D:
import moment from 'moment';

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
		const match = data.match(/\/ModDate\(D:(\d\d\d\d\d\d\d\d\d\d\d\d\d\d)([-+Z]\d\d'\d\d')\)/m);
		if (match === null) console.error(`could not find ModDate in ${absFilePath}`);
		else {
			const dateString = match[1]; // format YYYYMMDDHHmmssOHH'mm' ASN.1 ISO/IEC 8824
			const gmtOffset = match[2];
			if (verbose) console.log(`date from ${absFilePath} is '${dateString}${gmtOffset}'`);
			const isoGmtOffsetMatch = gmtOffset.match(/([-+Z]\d\d)'(\d\d)'/);
			const isoGmtOffset = `${isoGmtOffsetMatch[1]}:${isoGmtOffsetMatch[2]}`;
			const mom = moment(`${dateString}${isoGmtOffset}`, 'YYYYMMDDHHmmssZ'); // .toDate();
			// const date = new Date(`${dateString}${isoGmtOffset}`);
			timestamp = mom.unix() * 1000;
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

