const expect = require('chai').expect;
const fs = require('fs');
const xmlMaker = require('../src/generateISAF.js');



describe('test', function () {
	it('does test', function () {

		const jsonExample = JSON.parse(fs.readFileSync('test/data/isaf-structure.json', 'utf8'));
		const xmlTestString = fs.readFileSync('test/data/isaf-structure.xml', 'utf8');

		const xmlDataString = xmlMaker.generateXML(jsonExample);
		fs.writeFileSync('test/data/out.xml',xmlDataString);
		expect(xmlDataString).to.equal(xmlTestString);
	});
});