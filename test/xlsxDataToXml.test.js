const chai = require('chai');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
chai.use(deepEqualInAnyOrder);

const expect = chai.expect;

const fs = require('fs');
const path = require('path');
const sinon = require('sinon');
const parseString = require('xml2js').parseString;

const xlsxDataToJson = require('../src/xlsxDataToJson.js');
const jsonToXml = require('../src/jsonToXml.js').jsonToXml;

const testDataPath = 'test/personalData';

function promiseParseString (xml) {
	return new Promise(function (resolve, reject) {
		parseString(xml, function (err, result) {
			err ? reject(err) : resolve(result);
		});
	});
}

// requires test files in personal data
// xml and xlsx files' names should be equal
describe('xlsxDataToXml @prod', function () {
	let jsonOutputExample;
	let sandbox;
	let clock;

	let testCases = [];
	if (process.env.NODE_ENV === 'production' && fs.existsSync(testDataPath)) {
		const fileNames = fs.readdirSync(testDataPath).filter(f => !f.startsWith('~'));
		const files = {};
		fileNames.forEach(name => {
			const extension = path.extname(name).substr(1);
			const baseName = name.substring(0, name.length - extension.length - 1);

			if (!files[baseName]) {
				files[baseName] = {};
			}

			files[baseName][extension] = name;
		});

		// each test case is a matching name file pair
		testCases = Object.values(files).filter(f => Object.keys(f).length === 2);
	}

	before(() => {
		sandbox = sinon.createSandbox();
	});

	after(() => {
		sandbox.restore();
		if (clock) {
			clock.restore();
			clock = undefined;
		}
	});

	// test each maching name file pair
	testCases.forEach(testCase => {
		it(`should generate ${testCase.xml} from  ${testCase.xlsx}`, async function () {
			const xmlOutputExample = fs.readFileSync(path.join(testDataPath, testCase.xml), 'utf8');
			jsonOutputExample = await promiseParseString(xmlOutputExample);

			// need to use the same time
			const now = new Date(jsonOutputExample.iSAFFile.Header[0].FileDescription[0].FileDateCreated[0]);
			clock = sinon.useFakeTimers(now.getTime());

			// need to parse the same range of invoices based on date
			const fileDescriptionEl = jsonOutputExample.iSAFFile.Header[0].FileDescription[0].SelectionCriteria[0];
			const startDate = new Date(fileDescriptionEl.SelectionStartDate[0]);
			const endDate = new Date(fileDescriptionEl.SelectionEndDate[0]);

			const jsonInput = xlsxDataToJson.genrateJson(path.join(testDataPath, testCase.xlsx), startDate, endDate);
			const xml = jsonToXml(jsonInput);

			// cannot compare xmls because of different orderings
			const jsonParsed = await promiseParseString(xml);

			fs.writeFileSync(`test/out/out_${testCase.xlsx}`, xml);
			expect(jsonParsed).to.deep.equalInAnyOrder(jsonOutputExample);
		});
	}); ;
});
