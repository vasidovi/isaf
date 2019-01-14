const expect = require('chai').expect;
const fs = require('fs');
const xlsxDataToJson = require('../src/xlsxDataToJson.js');
const sinon = require('sinon');


describe('xlsxDataToJson', function () {

	const jsonOutputExample = JSON.parse(fs.readFileSync('test/data/isaf-structure.json', 'utf8'));
	const now = new Date(jsonOutputExample.Header.FileDescription.FileDateCreated);
	let sandbox;
	let clock;

	beforeEach(() => {
		sandbox = sinon.sandbox.create();
		clock = sinon.useFakeTimers(now.getTime());
	});

	afterEach(() => {
		sandbox.restore();
		clock.restore();
	});


	function sortByStringField(a, b, field) {
		if (a[field] < b[field])
			return -1;
		if (a[field] > b[field])
			return 1;
		return 0;
	}

	function recurse(obj, filter, callback) {

		if (filter(obj)) {
			callback(obj);
			return
		}
		if (typeof obj === 'object') {
			Object.keys(obj).forEach(key => {
				recurse(obj[key], filter, callback)
			})
		}
	}



	it('should generate json from xlsx data', function () {
		const path = 'test/data/sample.xlsx';
		const startDate = new Date(2019, 0, 1);
		const endDate = new Date(startDate);
		endDate.setMonth(endDate.getMonth() + 1);
		endDate.setDate(endDate.getDate() - 1);

		const json = xlsxDataToJson.genrateJson(path, startDate, endDate);
		// json.MasterFiles.Customers.Customer.sort((a, b) => sortByStringField(a, b, "Name"));
		// jsonOutputExample.MasterFiles.Customers.Customer.sort((a, b) => sortByStringField(a, b, "Name"));

		// json.MasterFiles.Suppliers.Supplier.sort((a, b) => sortByStringField(a, b, "Name"));
		// jsonOutputExample.MasterFiles.Suppliers.Supplier.sort((a, b) => sortByStringField(a, b, "Name"));

		// json.SourceDocuments.PurchaseInvoices.Invoice.sort((a, b) => sortByStringField(a, b, "InvoiceNo"));
		// jsonOutputExample.SourceDocuments.PurchaseInvoices.Invoice.sort((a, b) => sortByStringField(a, b, "InvoiceNo"));
		["Name", "InvoiceNo", "TaxableValue"].forEach(field => {
			recurse(json, f => Array.isArray(f) && f.length && f[0][field], f => f.sort((a, b) => sortByStringField(a, b, field)))
			recurse(jsonOutputExample, f => Array.isArray(f) && f.length && f[0][field], f => f.sort((a, b) => sortByStringField(a, b, field)))
		});
		// json.SourceDocuments.SalesInvoices.Invoice.sort((a, b) => sortByStringField(a, b, "InvoiceNo"));
		// jsonOutputExample.SourceDocuments.SalesInvoices.Invoice.sort((a, b) => sortByStringField(a, b, "InvoiceNo"));


		fs.writeFileSync('test/out/out.json', JSON.stringify(json));
		expect(json).to.deep.equal(jsonOutputExample);
	});
});