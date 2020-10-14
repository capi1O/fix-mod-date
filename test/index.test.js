const chai				= require('chai');
const chaiExec		= require('@jsdevtools/chai-exec');
const fs					= require('fs');
const path				= require('path');
const utimes			= require('utimes').utimes;
const pjson				= require('../package.json');

chai.use(chaiExec);
chai.use(chai.should);

// const command = 'export NODE_NO_WARNINGS=1 && fix-mod-date';
const command = 'fix-mod-date';
const version = pjson.version;
const filePath = 'test/samples/file';
const dirPath = 'test/samples';

describe('command line arguments tests', () => {

	it('should show correct version', () => {

		const res = chaiExec(`${command} --version`);
		res.stdout.should.equal(`v${version}\n`);
		res.stderr.should.be.empty;
		res.should.exit.with.code(0);
	});

	it('should be quiet', () => {

		const res = chaiExec(`${command} -q ${filePath}.pdf`);
		res.stdout.should.be.empty;
		res.should.exit.with.code(0);
	});
});


describe('read modification time tests', () => {

	it('should read correct PDF file modification time', () => {
		const res = chaiExec(`${command} -t ${filePath}.pdf`);
		res.stdout.should.be.equal(`file ${process.cwd()}/test/samples/file.pdf timestamp is '1408471627000'\n`);
		res.stderr.should.be.empty;
		res.should.exit.with.code(0);
	});

	it('should read correct AI file modification time', () => {
		const res = chaiExec(`${command} -t ${filePath}.ai`);
		res.stdout.should.be.equal(`file ${process.cwd()}/test/samples/file.ai timestamp is '1487143617000'\n`);
		res.stderr.should.be.empty;
		res.should.exit.with.code(0);
	});

	it('should read correct PSD file modification time', () => {
		const res = chaiExec(`${command} -t ${filePath}.psd`);
		res.stdout.should.be.equal(`file ${process.cwd()}/test/samples/file.psd timestamp is '1512476036000'\n`);
		res.stderr.should.be.empty;
		res.should.exit.with.code(0);
	});

	it('should read correct EPS file modification time', () => {
		const res = chaiExec(`${command} -t ${filePath}.eps`);
		res.stdout.should.be.equal(`file ${process.cwd()}/test/samples/file.eps timestamp is '1303077332000'\n`);
		res.stderr.should.be.empty;
		res.should.exit.with.code(0);
	});

	it('should read correct AEP file modification time', () => {
		const res = chaiExec(`${command} -t ${filePath}.aep`);
		res.stdout.should.be.equal(`file ${process.cwd()}/test/samples/file.aep timestamp is '1601641681000'\n`);
		res.stderr.should.be.empty;
		res.should.exit.with.code(0);
	});

	it('should read correct MP4 file modification time', () => {
		const res = chaiExec(`${command} -t ${filePath}.mp4`);
		res.stdout.should.be.equal(`file ${process.cwd()}/test/samples/file.mp4 timestamp is '1438938782000'\n`);
		res.stderr.should.be.empty;
		res.should.exit.with.code(0);
	});

	it('should read correct JPG file modification time', () => {
		const res = chaiExec(`${command} -t ${filePath}.jpg`);
		res.stdout.should.be.equal(`file ${process.cwd()}/test/samples/file.jpg timestamp is '1205608713000'\n`);
		res.stderr.should.be.empty;
		res.should.exit.with.code(0);
	});

	it('should read correct TIFF file modification time', () => {
		const res = chaiExec(`${command} -t ${filePath}.tiff`);
		res.stdout.should.be.equal(`file ${process.cwd()}/test/samples/file.tiff timestamp is '1594826992000'\n`);
		res.stderr.should.be.empty;
		res.should.exit.with.code(0);
	});

	it('should read correct ZIP file modification time', () => {
		const res = chaiExec(`${command} -t ${filePath}.zip`);
		res.stdout.should.be.equal(`file ${process.cwd()}/test/samples/file.zip timestamp is '1588703262000'\n`);
		res.stderr.should.be.empty;
		res.should.exit.with.code(0);
	});

	it('should not support unknown file', () => {
		const res = chaiExec(`${command} -t ${filePath}.txt`);
		res.stdout.should.be.equal(`unsupported file type '.txt' for file ${process.cwd()}/test/samples/file.txt\n`);
		res.stderr.should.be.empty;
		res.should.exit.with.code(0);
	});

	it('should not read system files', () => {
		const res = chaiExec(`${command} -t test/samples/.DS_Store`);
		res.stdout.should.be.equal(`skipping file 'test/samples/.DS_Store'\n`);
		res.stderr.should.be.empty;
		res.should.exit.with.code(0);
	});

	it('should not read ignored files', () => {
		const res = chaiExec(`${command} -t test/samples/ignore.psd -i ignore.psd`);
		res.stdout.should.be.equal(`skipping file 'test/samples/ignore.psd'\n`);
		res.stderr.should.be.empty;
		res.should.exit.with.code(0);
	});

	it('should read directory modification time', async () => {

		const dirAbsFilePath = path.resolve(process.cwd(), dirPath);

		// 1. set dummy modification on the file which have no timestamp in content
		await utimes(`${dirAbsFilePath}/file.txt`, { mtime: 971445607000 });

		// 2. execute command
		const res = chaiExec(`${command} -t -r 1 ${dirPath}`);

		// 3. check result. should be time of AEP file
		const stdoutLastLine = res.stdout.split('\n').slice(-2,-1)[0];
		stdoutLastLine.should.be.equal(`dir ${process.cwd()}/${dirPath} timestamp => '1601641681000'`);
		res.stderr.should.be.empty;
		res.should.exit.with.code(0);
	});
});


describe('update modification time tests', () => {

	it('should update file modification time', async () => {

		const pdfAbsFilePath = path.resolve(process.cwd(), `${filePath}.pdf`);

		// 1. set dummy modification date
		await utimes(pdfAbsFilePath, { mtime: 1602498298000 });

		// 2. execute command
		const res = chaiExec(`${command} -q ${filePath}.pdf`);

		// 3. read the modification date
		const fileStats = await fs.promises.stat(pdfAbsFilePath);
		const updatedTime = fileStats.mtimeMs; // fileStats?.mtimeMs;

		// 4. check result
		updatedTime.should.be.equal(1408471627000);
		res.stderr.should.be.empty;
		res.should.exit.with.code(0);
	});

	
	it('should not update file modification time', async () => {

		const pdfAbsFilePath = path.resolve(process.cwd(), `${filePath}.pdf`);

		// 1. set dummy modification date
		await utimes(pdfAbsFilePath, { mtime: 1602498298000 });

		// 2. execute command in test mode
		const res = chaiExec(`${command} -q -t ${filePath}.pdf`);

		// 3. read the modification date
		const fileStats = await fs.promises.stat(pdfAbsFilePath);
		const updatedTime = fileStats.mtimeMs; // fileStats?.mtimeMs;

		// 4. check result
		updatedTime.should.be.equal(1602498298000);
		res.stderr.should.be.empty;
		res.should.exit.with.code(0);
	});

	xit('should update directory modification time', async () => {

		const dirAbsFilePath = path.resolve(process.cwd(), dirPath);

		// 1. set dummy modification on the file which have no timestamp in content
		await utimes(`${dirAbsFilePath}/file.txt`, { mtime: 971445607000 });

		// 2. execute command
		const res = chaiExec(`${command} -q -r 1 ${dirPath}`);

		// 3. read the modification date
		const dirStats = await fs.promises.stat(dirAbsFilePath);
		const updatedTime = dirStats.mtimeMs; // dirStats?.mtimeMs;

		// 4. check result. should be time of AEP file
		updatedTime.should.be.equal(1601641681000);
		res.stderr.should.be.empty;
		res.should.exit.with.code(0);
	});
});