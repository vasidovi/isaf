const config = require('config');
const getJson = require('./jsonToTemplate').getJson;
const retrieveDataFromXlsx = require('./retrieveDataFromXlsx').retrieveDataFromXlsx;

const configuration = config.get('Workbook');

function getInvoicePartner (invoice, credentials) {
	const customer = {};
	customer.id = invoice.partnerId;

	const cred = credentials.find(c => c.id === customer.id);
	if (cred.code.startsWith('LT')) {
		customer.VATregistrationNumber = cred.code;
	} else {
		customer.registrationNumber = cred.code;
	}
	customer.name = cred.name;
	customer.code = cred.code.replace(/[A-Za-z]/g, '');
	return customer;
}

function isOfOwner (invoice) {
	return invoice['invoiceNo'].startsWith(configuration.info.invoicePrefix);
}

function generateJson (path, startDate, endDate) {
	const data = retrieveDataFromXlsx(path, startDate, endDate);
	const invoices = data.invoices;
	const credentials = data.credentials;

	const purchaseInvoices = invoices.filter(invoice =>
		!isOfOwner(invoice)
	);

	const salesInvoices = invoices.filter(invoice =>
		isOfOwner(invoice)
	);

	const customers = [];

	salesInvoices.forEach(invoice => {
		//  if there is a customer with this id in customers []
		// return works like continue inside forEach loop
		let customer = customers.find(c => c.id === invoice.partnerId);

		invoice.type = 'SF';

		invoice.taxes.forEach(tax => {
			if (!tax.taxCode) {
				tax.taxCode = 1;
			}
			tax.taxCode = 'PVM' + tax.taxCode;
			tax.taxPercentage = configuration.info.pvmCodes[tax.taxCode];

			if (!parseInt(tax.taxPercentage)) {
				tax.taxPercentage = {
					'@': {
						'xsi:nil': 'true'
					}
				};
			}

			tax.invoiceDate = invoice.invoiceDate;
		});

		if (!customer) {
			customer = getInvoicePartner(invoice, credentials);
			const customerWithSameCodeId = customers.findIndex(c => c.code === customer.code);
			// index not found
			if (customerWithSameCodeId !== -1) {
				// customers remove customerWithSame Code
				customers.splice(customerWithSameCodeId, 1);
				// customers add customer
			}
			customers.push(customer);
		}

		invoice.customer = [customer];
	});

	const suppliers = [];

	purchaseInvoices.forEach(invoice => {
		let supplier = suppliers.find(c => c.id === invoice.partnerId);

		invoice.type = 'SF';

		// jeigu, tarp invoice taxes yra !tax.isCredit tuomet reikia ismesti
		//  tax.isCredit is invoice taxes[]
		// if invoice.taxes.some( tax => !tax.isCredit)
		const notCreditTaxes = invoice.taxes.filter(tax => !tax.isCredit);
		if (notCreditTaxes.length > 0) {
			invoice.taxes = notCreditTaxes;
		}

		invoice.taxes.forEach(tax => {
			if (!tax.taxCode) {
				tax.taxCode = 1;
			}
			tax.taxCode = 'PVM' + tax.taxCode;
			tax.taxPercentage = configuration.info.pvmCodes[tax.taxCode];

			if (!parseInt(tax.taxPercentage)) {
				tax.taxPercentage = {
					'@': {
						'xsi:nil': 'true'
					}
				};
			}

			if (tax.isCredit && !isOfOwner(invoice)) {
				tax.taxableValue = '-' + tax.taxableValue;
				tax.taxAmount = '-' + tax.taxAmount;
				invoice.type = 'KS';
			}
		});

		if (!supplier) {
			supplier = getInvoicePartner(invoice, credentials);
			const supplierWithSameCodeId = suppliers.findIndex(s => s.code === supplier.code);
			// index not found
			if (supplierWithSameCodeId !== -1) {
				// customers remove customerWithSame Code
				suppliers.splice(supplierWithSameCodeId, 1);
				// customers add customer
			}
			suppliers.push(supplier);

			if (!suppliers.some(s => s.code === supplier.code)) {
				suppliers.push(supplier);
			}
		}
		invoice.supplier = [supplier];
	});

	const json = getJson({
		configuration,
		purchaseInvoices,
		suppliers,
		salesInvoices,
		customers,
		startDate,
		endDate
	});

	return json;
}

exports.generateJson = generateJson;
