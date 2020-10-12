const chai = require('chai');
const chaiExec = require('@jsdevtools/chai-exec');
const fs = require('fs');
const path = require('path');
const utimes = require('utimes').utimes;

chai.use(chaiExec);
chai.use(chai.should);

// const command = 'export NODE_NO_WARNINGS=1 && fix-mod-date';
const command = 'fix-mod-date';
const version = '1.0.0';
const pdfFilePath = 'test/samples/file.pdf';

describe('command line arguments tests', () => {

	it('should show correct version', () => {

		const res = chaiExec(`${command} --version`);
		res.stdout.should.equal(`v${version}\n`);
		res.stderr.should.be.empty;
	});

	it('should be quiet', () => {

		const res = chaiExec(`${command} -q ${pdfFilePath}`);
		res.stdout.should.be.empty;
	});
});


describe('read modification time tests', () => {

	it('should read correct PDF file modification time', () => {
		const res = chaiExec(`${command} -t ${pdfFilePath}`);
		res.stdout.should.be.equal(`file ${process.cwd()}/test/samples/file.pdf timestamp is '1408471627000'\n`);
		res.stderr.should.be.empty;
	});
});


describe('update modification time tests', () => {

	it('should modify PDF file time', async () => {

		const pdfAbsFilePath = path.resolve(process.cwd(), pdfFilePath);

		// 1. set dummy modification date
		await utimes(pdfAbsFilePath, { mtime: 1602498298000 }); // utimes(pdfFilePath)?.mtime(1602498298000);

		// 2. 
		const res = chaiExec(`${command} -q ${pdfFilePath}`);

		// 3. read the modification date
		const fileStats = await fs.promises.stat(pdfAbsFilePath);
		const updatedTime = fileStats.mtimeMs; // fileStats?.mtimeMs;

		// 4. check result
		updatedTime.should.be.equal(1408471627000);
		res.stderr.should.be.empty;
	});
});