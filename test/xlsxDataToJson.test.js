const chai = require('chai');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
chai.use(deepEqualInAnyOrder);

const {
	expect
} = chai;

const fs = require('fs');
const xlsxDataToJson = require('../src/xlsxDataToJson.js');
const sinon = require('sinon');

let path = 'test/data/isaf-structure.json';

describe('xlsxDataToJson', function () {
	const jsonOutputExample = JSON.parse(fs.readFileSync(path, 'utf8'));
	const now = new Date(jsonOutputExample.Header.FileDescription.FileDateCreated);
	let sandbox;
	let clock;

	beforeEach(() => {
		sandbox = sinon.createSandbox();
		clock = sinon.useFakeTimers(now.getTime());
	});

	afterEach(() => {
		sandbox.restore();
		clock.restore();
	});

	it('should generate json from xlsx data', function () {
		const path = 'test/data/sample.xlsx';
		const startDate = new Date(2019, 0, 1);
		const endDate = new Date(startDate);
		endDate.setMonth(endDate.getMonth() + 1);
		endDate.setDate(endDate.getDate() - 1);

		const json = xlsxDataToJson.generateJson(path, startDate, endDate);

		fs.writeFileSync('test/out/out.json', JSON.stringify(json));

		expect(json).to.deep.equalInAnyOrder(jsonOutputExample);
	});
});
