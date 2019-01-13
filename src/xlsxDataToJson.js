const XLSX = require('xlsx');
const config = require('config');
const dateFormat = require('dateformat');
const getJson = require('./jsonToTemplate').getJson;

const configuration = config.get("Workbook");

function getInvoicePartner(invoice, credentials) {
    const customer = {};
    customer.id = invoice.partnerId;
   
    const cred = credentials.find(c => c.id === customer.id);
    if (cred.code.startsWith("LT")) {
        customer.VATregistrationNumber = cred.code;
    } else {
        customer.registrationNumber = cred.code;
    }
    customer.name = cred.name;

    return customer;
}

function genrateJson(path, startDate, endDate) {
    const workbook = XLSX.readFile(path);
    const sheets = configuration["sheets"];
    const credentialsSheet = workbook.Sheets[sheets.credentials];
    const credentials = getCredentials(credentialsSheet);

    // invoicesSheets =[];
    // configuration.invoices === configuration["invoices"];
    const invoicesMetadata = configuration.invoices;
    let invoices = [];
    invoicesMetadata.forEach((metadata) => {

        const worksheet = workbook.Sheets[metadata.sheetName];
        const currentInvoices = getInvoices(worksheet, startDate, endDate, metadata);
        invoices = invoices.concat(currentInvoices);
    })

    const purchaseInvoices = invoices.filter(invoice =>
        !invoice["invoiceNo"].startsWith(configuration.info.invoicePrefix)
    );
    const salesInvoices = invoices.filter(invoice =>
        invoice["invoiceNo"].startsWith(configuration.info.invoicePrefix)
    );

    const customers = [];

    purchaseInvoices.forEach(invoice => {

         //  if there is a customer with this id in customers []
         // return works like continue inside forEach loop
        if (customers.some(c => c.id === invoice.partnerId))
        return;
        
        const customer = getInvoicePartner(invoice, credentials);
        
       
        customers.push(customer);
    });

    const suppliers = [];

    salesInvoices.forEach(invoice => {

         if (suppliers.some(s => s.id === invoice.partnerId))
         return;

        const supplier = getInvoicePartner(invoice, credentials);
        suppliers.push(supplier);
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

    console.log(customers);

    return json;
};

const getCellOrEmpty = function (worksheet, address, field) {
    field = field || "v";
    return worksheet[address] ? "" + worksheet[address][field] : "";

}

const getDateOrNull = function (dateString) {
    const timestamp = Date.parse(dateString);

    if (isNaN(timestamp) == false) {
        return new Date(timestamp);
    } else {
        return null;
    }
}



const getTax = function (worksheet, row, tax) {
    const taxableValue = getCellOrEmpty(worksheet, tax.taxableValue + row);

    if (!taxableValue)
        return null;

    const taxAmount = getCellOrEmpty(worksheet, tax.taxAmount + row);
    const taxCode = tax.taxCode ? getCellOrEmpty(worksheet, tax.taxCode + row) : "";

    return {
        taxableValue,
        taxAmount,
        taxCode
    };

}

const getTaxes = function (worksheet, metadata, row) {
    const SFcolumns = metadata.taxesSF || [];
    const KScolumns = metadata.taxesKS || [];
    const taxes = [];

    SFcolumns.forEach(tax => {

        const taxInstance = getTax(worksheet, row, tax);
        if (taxInstance)
            taxes.push(taxInstance);

    });

    if (taxes.length == 0) {

        KScolumns.forEach(tax => {

            const taxInstance = getTax(worksheet, row, tax);
            if (taxInstance)
                taxes.push(taxInstance);

        });
    };
    return taxes;

}

const getInvoices = function (worksheet, startDate, endDate, metadata) {

    const keys = Object.keys(worksheet);

    const keyLetter = metadata.no;
    const idKeys = keys
        .filter(key => key.startsWith(keyLetter))


    const invoices = [];

    idKeys.forEach(key => {
        const row = key.substr(1);

        const dateString = getCellOrEmpty(worksheet, metadata.date + row, "w");
        const date = getDateOrNull(dateString);

        if (date == null || date < startDate || date > endDate)
            return;

        const taxes = getTaxes(worksheet, metadata, row);

        if (taxes.length == 0)
            return;


        const invoice = {
            "invoiceNo": getCellOrEmpty(worksheet, metadata.no + row),
            "invoiceDate": dateFormat(date, 'isoDate'),
            "partnerId": getCellOrEmpty(worksheet, metadata.id + row),
            "taxes": taxes
        };
        invoices.push(invoice);
    });


    return invoices;
};


const getCredentials = function (worksheet) {

    const keys = Object.keys(worksheet);
    const idKeys = keys.filter(key => key.startsWith("A"));
    const credentials = [];

    idKeys.forEach(key => {
        const row = key.substr(1);

        const credential = {
            "id": worksheet["A" + row].v,
            "name": getCellOrEmpty(worksheet, "B" + row),
            "code": getCellOrEmpty(worksheet, "C" + row)
        };
        credentials.push(credential);
    });

    return credentials;
};

exports.genrateJson = genrateJson;