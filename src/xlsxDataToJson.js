// const json = {};	
// 	json.iSAFFile
// 	json.Header = {};
// 	json.Header.FileDescription = {};
// 	const fd = json.Header.FileDescription;
// 	fd.FileVersion = '';
// 	fd.FileDateCreated = dateFormat(Date.now(), 'isoUtcDateTime');
// 	fd.DataType = '';
// 	fd.SoftwareCompanyName = '';
// 	fd.SoftwareName = '';
// 	fd.SoftwareVersion='';
// 	fd.RegistrationNumber='';
// 	fd.NumberOfParts='';
// 	fd.NumberOfParts='';
// 	fd.PartNumber='';
// 	fd.SelectionCriteria ={};
// 	fd.SelectionCriteria.SelectionStartDate = dateFormat(Date.now(),'isoDate');
// 	fd.SelectionCriteria.SelectionEndDate =  dateFormat(Date.now(),'isoDate');


const XLSX = require('xlsx');
const config = require('config');
const dateFormat = require('dateformat');

const genrateJson = function (path, startDate, endDate) {
    const workbook = XLSX.readFile(path);
    const sheets = config.get('Workbook.sheets');
    const credentialsSheet = workbook.Sheets[sheets.credentials];
    const credentials = getCredentials(credentialsSheet);
    const operationsSheet = workbook.Sheets[sheets.operations];
    const invoices = getInvoices(operationsSheet, startDate, endDate);

    return invoices;
};


const getCellOrEmpty = function (worksheet, address, field) {
    field = field || "v";
    return worksheet[address] ? worksheet[address][field] : "";

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

const getTaxes = function (worksheet, row) {
    const SFcolumns = config.get('Workbook.invoiceColumns.taxesSF');
    const KScolumns = config.get('Workbook.invoiceColumns.taxesKS');
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

const getInvoices = function (worksheet, startDate, endDate) {

    const keys = Object.keys(worksheet);
    const idKeys = keys
        .filter(key => key.startsWith("D"))


    const invoices = [];

    idKeys.forEach(key => {
        const row = key.substr(1);
        const columns = config.get('Workbook.invoiceColumns');

        const dateString = getCellOrEmpty(worksheet, columns.date + row, "w");
        const date = getDateOrNull(dateString);

        if (date == null || date < startDate || date > endDate)
            return;

        const taxes = getTaxes(worksheet, row);

        if (taxes.length == 0)
            return;


        const invoice = {
            "invoiceNo": getCellOrEmpty(worksheet, columns.no + row),
            "invoiceDate": dateFormat(date, 'isoDate'),
            "partnerId": getCellOrEmpty(worksheet, columns.id + row),
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