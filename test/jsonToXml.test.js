const expect = require('chai').expect;
const fs = require('fs');
const jsonToXml = require('../src/jsonToXml.js').jsonToXml;

describe('jsonToXml', function () {
	it('should convert json to xml', function () {
		const jsonInput = JSON.parse(fs.readFileSync('test/data/isaf-structure.json', 'utf8'));
		const xmlOutputExample = fs.readFileSync('test/data/isaf-structure.xml', 'utf8');

		const xml = jsonToXml(jsonInput);
		fs.writeFileSync('test/out/out.xml', xml);
		expect(xml).to.equal(xmlOutputExample);
	});
});
