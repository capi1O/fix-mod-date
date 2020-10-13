// use EXIF data. support JPEG, TIFF, PNG, HEIC/HEIF, WebP
import ExifReader from 'exifreader';
import moment from 'moment';

// use a Map because order matters
const exifDateKeys = new Map();

exifDateKeys.set('ModifyDate', 'YYYY-MM-DDTHH:mm:ssZ');
exifDateKeys.set('DateTime', 'YYYY:MM:DD HH:mm:ss'); // The date and time of image creation. In Exif standard, it is the date and time the file was changed

// 'DateTimeOriginal': '', // The date and time when the original image data was generated
// 'PreviewDateTime': '', // This tag is an ASCII string containing the name of the date/time at which the preview stored in the IFD was rendered. The date/time is encoded using ISO 8601 format
// 'DateTimeDigitized': '', // The date and time when the image was stored as digital data
// 'ICC Profile Date'
// 'MetadataDate': '',
// 'CreateDate: '',

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

		const BreakException = {};
		try {
			exifDateKeys.forEach((exifDateKeyFormat, exifDateKeyName) => {
				if (exifDateKeyName in tags) {
					const dateString = tags[exifDateKeyName].description;
					if (dateString === null) console.error(`could not find EXIF date '${exifDateKeyName}' value in ${absFilePath}`);
					else {
						if (verbose) console.log(`EXIF date '${exifDateKeyName}' for ${absFilePath} is '${dateString}'`);
						let mom;
						if (exifDateKeyName === 'DateTime') mom = moment.utc(dateString, exifDateKeyFormat); // no UTC offset is present in DateTime
						else mom = moment(dateString, exifDateKeyFormat);
						timestamp = mom.unix() * 1000;
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

const exif = { mtime }
export default exif;
