const XLSX = require('xlsx');
const config = require('config');
const dateFormat = require('dateformat');

const configuration = config.get('Workbook');

function retrieveDataFromXlsx (path, startDate, endDate) {
	const workbook = XLSX.readFile(path);
	const credentialsSheet = workbook.Sheets[configuration.sheets.credentials];

	const credentials = getCredentials(credentialsSheet);

	const invoicesMetadata = configuration.invoices;
	let invoices = [];

	invoicesMetadata.forEach((metadata) => {
		const worksheet = workbook.Sheets[metadata.sheetName];
		const currentInvoices = getInvoices(worksheet, startDate, endDate, metadata);
		invoices = invoices.concat(currentInvoices);
	});

	return { credentials, invoices };
}

const getCredentials = function (worksheet) {
	const keys = Object.keys(worksheet);
	const idKeys = keys.filter(key => key.startsWith('A'));
	const credentials = [];

	idKeys.forEach(key => {
		const row = key.substr(1);

		const credential = {
			'id': worksheet['A' + row].v,
			'name': getCellOrEmpty(worksheet, 'B' + row),
			'code': getCellOrEmpty(worksheet, 'C' + row)
		};
		credentials.push(credential);
	});

	return credentials;
};

const getInvoices = function (worksheet, startDate, endDate, metadata) {
	const keys = Object.keys(worksheet);

	const keyLetter = metadata.no;
	const idKeys = keys
		.filter(key => key.startsWith(keyLetter));

	const invoices = [];

	idKeys.forEach(key => {
		const row = key.substr(1);

		const dateString = getCellOrEmpty(worksheet, metadata.date + row, 'w');
		const date = getDateOrNull(dateString);

		if (date == null || date < startDate || date > endDate) { return; }

		const taxes = getTaxes(worksheet, metadata, row);

		if (taxes.length == 0) { return; }

		const invoice = {
			'invoiceNo': getCellOrEmpty(worksheet, metadata.no + row),
			'invoiceDate': dateFormat(date, 'isoDate'),
			'partnerId': getCellOrEmpty(worksheet, metadata.id + row),
			'taxes': taxes
		};
		if (invoice.invoiceNo) { invoices.push(invoice); }
	});

	return invoices;
};

const getCellOrEmpty = function (worksheet, address, field) {
	field = field || 'v';
	return worksheet[address] ? '' + worksheet[address][field] : '';
};

const getTaxes = function (worksheet, invoiceMetadata, row) {
	const taxesMetadata = invoiceMetadata.taxes || [];
	const taxes = [];

	taxesMetadata.forEach(taxMetadata => {
		const taxInstance = getTax(worksheet, row, taxMetadata);
		if (taxInstance) { taxes.push(taxInstance); }
	});

	return taxes;
};

const getTax = function (worksheet, row, taxMetadata) {
	let taxableValue = getCellOrEmpty(worksheet, taxMetadata.taxableValue + row);
	// checks is not 0, '', NaN etc.
	if (!taxableValue || !parseFloat(taxableValue)) { return null; }

	let taxAmount = getCellOrEmpty(worksheet, taxMetadata.taxAmount + row);
	if (taxAmount === '') { taxAmount = 0; }

	let taxCode = taxMetadata.taxCode ? getCellOrEmpty(worksheet, taxMetadata.taxCode + row) : '';

	if (!taxCode && taxMetadata.defaultTaxCode) { taxCode = taxMetadata.defaultTaxCode; }

	const isCredit = taxMetadata.isCredit;

	return {
		taxableValue,
		taxAmount,
		taxCode,
		isCredit
	};
};

const getDateOrNull = function (dateString) {
	const timestamp = Date.parse(dateString);

	if (isNaN(timestamp) == false) {
		return new Date(timestamp);
	} else {
		return null;
	}
};

exports.retrieveDataFromXlsx = retrieveDataFromXlsx;
