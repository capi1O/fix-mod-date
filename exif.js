// use EXIF data. support JPEG, TIFF, PNG, HEIC/HEIF, WebP
const ExifReader 	= require('exifreader');

// order matters
const exifDateKeys = [
	'ModifyDate',
	'MetadataDate',
	// 'CreateDate',
	'DateTimeOriginal', // The date and time when the original image data was generated.
	'DateTime', // The date and time of image creation. In Exif standard, it is the date and time the file was changed.
	'PreviewDateTime', // This tag is an ASCII string containing the name of the date/time at which the preview stored in the IFD was rendered. The date/time is encoded using ISO 8601 format.
	'DateTimeDigitized', // The date and time when the image was stored as digital data.
	// 'ICC Profile Date'
];

/**
 * Retrieves the creation time of file with EXIF data
 * @param {Buffer} data
 * @param {Bool} verbose
 * @param {String} absFilePath
 * @return {(Number | null)} timestamp the creation time or null
 */
const mtime = async (data, verbose, absFilePath) => {

	try {
		let timestamp = null;

		const tags = ExifReader.load(data); //, {expanded: true});
		// console.log(tags);


		const BreakException = {};

		try {
			exifDateKeys.forEach(exifDateKey => {
				if (exifDateKey in tags) {
					if (verbose) console.log(`found EXIF date ${exifDateKey}`);
					const dateString = tags[exifDateKey].description;
					if (dateString === null) console.error(`could not find EXIF date in ${absFilePath}`);
					else {
						if (verbose) console.log(`EXIF date for ${absFilePath} is '${dateString}'`);
						const date = new Date(dateString); // 'yyyy:MM:dd HH:mm:ss'
						timestamp = date.getTime();
						throw BreakException; // break the loop
					}
				}
			});
		}
		catch (e) {
			if (e !== BreakException) throw e;
		}
		return timestamp;
	}
	catch (error) {
		console.error(`error reading file ${absFilePath} :\n`, error);
		// throw err;
		return null;
	}
};

module.exports = { mtime };
