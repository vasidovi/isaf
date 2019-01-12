const expect = require('chai').expect;
const fs = require('fs');
const xlsxDataToJson = require('../src/xlsxDataToJson.js');



describe.only('xlsxDataToJson', function () {
	it('should generate json from xlsx data', function () {

		const jsonOutputExample = JSON.parse(fs.readFileSync('test/data/isaf-structure.json', 'utf8'));

		const path = "test/personalData/2018m ŪK.OP.Ž.n.xlsx";
		const startDate = new Date(2018, 10, 1);
		const endDate = new Date(startDate);
		endDate.setMonth(endDate.getMonth() + 1);
		endDate.setDate(endDate.getDate() - 1);

		const json = xlsxDataToJson.genrateJson(path, startDate, endDate);

		fs.writeFileSync('test/data/out.json', json);
		expect(json).to.deep.equal(jsonOutputExample);
	});
});