// heavily inspired from https://github.com/nadr0/mp4-metadata/blob/master/source/index.js

// central directory record is at the end of the file
// Offset		Bytes 	Description
// 0				4 	Central directory file header signature = 0x02014b50
// 4				2 	Version made by
// 6				2 	Version needed to extract (minimum)
// 8				2 	General purpose bit flag
// 10				2 	Compression method
// 12				2 	File last modification time
// 14				2 	File last modification date
// 16				4 	CRC-32 of uncompressed data
// 20				4 	Compressed size
// 24				4 	Uncompressed size
// 28				2 	File name length (n)
// 30				2 	Extra field length (m)
// 32				2 	File comment length (k)
// 34				2 	Disk number where file starts
// 36				2 	Internal file attributes
// 38				4 	External file attributes
// 42				4 	Relative offset of local file header. This is the number of bytes between the start of the first disk on which the file occurs, and the start of the local file header. This allows software reading the central directory to locate the position of the file inside the ZIP file.
// 46				n 	File name
// 46+		 	m 	Extra field
// 46+n+m		k 	File comment 

// File modification time is stored in standard MS-DOS format:
// Bits 00-04: seconds divided by 2
// Bits 05-10: minute
// Bits 11-15: hour

// File modification date 	stored in standard MS-DOS format:
// Bits 00-04: day
// Bits 05-08: month
// Bits 09-15: years from 1980 

const timeOffset = 12; // modification time data offset in CDR (in bytes)
const dateOffset = 14; // modification date data offset in CDR (in bytes)


// from https://github.com/antelle/node-stream-zip/pull/33/files
const unixMsTimestampFromZipTime = (timebytes, datebytes) => {
	var bits = function(dec, size) {
			var b = (dec >>> 0).toString(2);
			while( b.length < size ) b = '0' + b;
			return b.split('');
	}
	var timebits = bits(timebytes, 16);
	var datebits = bits(datebytes, 16);

	var mt = {
			h: parseInt(timebits.slice(0,5).join(''), 2),
			m: parseInt(timebits.slice(5,11).join(''), 2),
			s: parseInt(timebits.slice(11,16).join(''), 2) * 2,
			Y: parseInt(datebits.slice(0,7).join(''), 2) + 1980,
			M: parseInt(datebits.slice(7,11).join(''), 2),
			D: parseInt(datebits.slice(11,16).join(''), 2),
	};
	var dt_str = [mt.Y, mt.M, mt.D].join('-') + ' ' + [mt.h, mt.m, mt.s].join(':') + ' GMT+0';
	return new Date(dt_str).getTime();
};

/**
 * Retrieves the creation time of zip file
 * @param {Buffer} data
 * @param {Bool} verbose
 * @param {String} absFilePath
 * @return {(Number | null)} timestamp the creation time or null
 */
const mtime = async (dataBuffer, verbose, absFilePath) => {

	try {
		
		// 0. get mvhd box position in buffer
		// require('fs').writeFileSync('zip-hex', dataBuffer.toString('hex'));
		const cdrHexIndex = dataBuffer.toString('hex').search(/504b0102/); // 0x504b0102
		const cdrIndex = cdrHexIndex / 2;
		if (!cdrIndex || cdrIndex === -1) {
			if (verbose) console.log(`central directory record not found in file ${absFilePath}.`);
			return null;
		}
		else if (verbose) console.log(`central directory record found at ${cdrIndex} in file ${absFilePath}.`);

		// 1. read date/time bytes
		const timeBuffer = dataBuffer.slice(cdrIndex + timeOffset, cdrIndex + timeOffset + 2);
		const dateBuffer = dataBuffer.slice(cdrIndex + dateOffset, cdrIndex + dateOffset + 2);
		const timeBytes = timeBuffer.readUInt16LE(0);
		const dateBytes = dateBuffer.readUInt16LE(0);

		// 2. convert to unix timestamp
		const unixMsTimestamp = unixMsTimestampFromZipTime(timeBytes, dateBytes);

		return unixMsTimestamp;
	}
	catch (error) {
		console.error(`error reading file ${absFilePath} :\n`, error);
		// throw err;
		return null;
	}
};

const zip = { mtime }
export default zip;