const expect = require('chai').expect;
const fs = require('fs');
const xlsxDataToJson = require('../src/xlsxDataToJson.js');



describe('xlsxDataToJson', function () {
	it('should generate json from xlsx data', function () {

		const jsonOutputExample = JSON.parse(fs.readFileSync('test/data/isaf-structure.json', 'utf8'));

		const path = "test/data/sample.xlsx";
		const startDate = new Date(2019, 0, 1);
		const endDate = new Date(startDate);
		endDate.setMonth(endDate.getMonth() + 1);
		endDate.setDate(endDate.getDate() - 1);

		const json = xlsxDataToJson.genrateJson(path, startDate, endDate);

		fs.writeFileSync('test/out/out.json', JSON.stringify(json));
		expect(json).to.deep.equal(jsonOutputExample);
	});
});