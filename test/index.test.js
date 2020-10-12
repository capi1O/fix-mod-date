const chai = require('chai');
const chaiExec = require("@jsdevtools/chai-exec");

chai.use(chaiExec);
chai.use(chai.should);

// const command = 'export NODE_NO_WARNINGS=1 && fix-mod-date';
const command = 'fix-mod-date';
const version = '1.0.0';

describe('command line arguments tests', () => {

	it('Should show correct version', () => {

		const res = chaiExec(`${command} --version`);
		res.stdout.should.equal(`v${version}\n`);
		res.stderr.should.be.empty;
	});

	it('should be quiet', () => {

		const res = chaiExec(`${command} -t -q test/samples/file.pdf`);
		res.stdout.should.be.empty;
	});
});

