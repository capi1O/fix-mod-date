// heavily inspired from https://github.com/nadr0/mp4-metadata/blob/master/source/index.js

// mp4 file creation time is in File Header section in movie header box (mvhd)
// File Header section in mp4 can be either at start or end but
// > Typically mp4 video encoders will write the moov atom to the back of the file because they can write the mp4 video in one pass when encoding the file format
// source : https://kevinnadro.com/blog/parsing-creation-time-from-mp4-metadata-in-javascript
// movie header box hex representation (hex)
// 0100b80:6f6f760000006c6d766864000000007c25b080cff058
//                       ________ <-- mvhd 4x [8-bit] (ASCII string)
//                               __ <-- version : 0 or 1 1x [8-bit] (unsigned)
//                                 ______ <-- 3x [8-bits] (hex flag)
//                                       ________-------- <-- time 1x 32 bits (unsigned) or 1x 64bits (unsigned)
// Note : time is value in seconds since beginning 1904 but can be either 4 bytes or 8 bytes depending on version byte
// version = 0 : 4 bytes (Uint32)
// version = 1 : 8 bytes (Uint64)

const mvhdStringLength = 4;
const versionLength = 1;
const flagsLength = 3;
const v1TimeLength = 4;
const v2TimeLength = 8;


/**
 * Retrieves the creation time of the mp4 video/audio
 * @param {Buffer} data
 * @param {Bool} verbose
 * @param {String} absFilePath
 * @param options configuration options for the parser
 * @param options.readFromEnd
 * @return {(Number | null)} timestamp the creation time or null
 */
const mtime = async (dataBuffer, verbose, absFilePath) => {

	try {
		
		// 0. get mvhd box position in buffer
		const mvhdFileIndex = dataBuffer.toString().search(/mvhd/);
		if (!mvhdFileIndex || mvhdFileIndex === -1) {
			if (verbose) console.log(`mvhd index not found in file ${absFilePath}.`);
			return null;
		}
		else if (verbose) console.log(`mvhd index found at ${mvhdFileIndex} in file ${absFilePath}.`);

		// 1. read date format version
		const version = dataBuffer.readInt8(mvhdFileIndex + mvhdStringLength);

		// 2. get mvhd box data (skip first 4 bytes and go to
		const timeLength = version === 0 ? v1TimeLength : v2TimeLength;
		const timeBuffer = dataBuffer.slice(
			mvhdFileIndex + mvhdStringLength,
			mvhdFileIndex + mvhdStringLength + versionLength + flagsLength + timeLength
		);

		// 3. read date bytes
		let macHFSPlusTime;
		if (version === 0) {
			if (verbose) console.log(`file ${absFilePath} created time is on v0 format => 32 bits :\n`, timeBuffer.toString('hex'));
			macHFSPlusTime = timeBuffer.readUInt32BE(versionLength + flagsLength);
		}
		else if (version === 1) {
			if (verbose) console.log(`file ${absFilePath} created time is on v1 format => 64 bits :\n`, timeBuffer.toString('hex'));
			macHFSPlusTime = timeBuffer.readUIntBE(versionLength + flagsLength);
		}

		// 4. convert to unix timestamp (offset seconds and multipled by 1000).
		const unixMsTimestamp = (macHFSPlusTime - 2082844800) * 1000;

		return unixMsTimestamp;
	}
	catch (error) {
		console.error(`error reading file ${absFilePath} :\n`, error);
		// throw err;
		return null;
	}
};


const mp4 = { mtime }
export default mp4;
