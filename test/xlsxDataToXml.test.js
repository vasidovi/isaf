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

const startDate = new Date(2018, 10, 1);
const endDate = new Date(startDate);
endDate.setMonth(endDate.getMonth() + 1);
endDate.setDate(endDate.getDate() - 1);
const testDataPath = 'test/personalData';

function parseStringSync (xml) {
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
	if (process.env.NODE_ENV === 'production') {
		const fileNames = fs.readdirSync(testDataPath).filter(f => !f.startsWith('~'));
		const files = {};
		fileNames.forEach(name => {
			const extension = path.extname(name).substr(1);
			const baseName = name.substring(0, name.length - extension.length - 1);

			if (!files[baseName]) {
				files[baseName] = {};
			}

			files[baseName][extension] = path.join(testDataPath, name);
		});
		testCases = Object.values(files);
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
			const xmlOutputExample = fs.readFileSync(testCase.xml, 'utf8');
			jsonOutputExample = await parseStringSync(xmlOutputExample);

			// need to use the same time
			const now = new Date(jsonOutputExample.iSAFFile.Header[0].FileDescription[0].FileDateCreated[0]);
			clock = sinon.useFakeTimers(now.getTime());

			const jsonInput = xlsxDataToJson.genrateJson(testCase.xlsx, startDate, endDate);
			const xml = jsonToXml(jsonInput);

			// cannot compare xmls because of different orderings
			const jsonParsed = await parseStringSync(xml);

			fs.writeFileSync('test/out/out_prod.xml', xml);
			expect(jsonParsed).to.deep.equalInAnyOrder(jsonOutputExample);
		});
	}); ;
});
