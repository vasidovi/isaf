var jsonxml = require("js2xmlparser");
const fs = require('fs');


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


var generateXML = function (json) {

	var options = {
		declaration: {
			encoding: "UTF-8",
			version: "1.0"
		},
		format: {
			doubleQuotes: true,
			indent: "  ",
			newline: "\r\n",
			pretty: true
		}
	};

	return jsonxml.parse("iSAFFile", json, options) + "\r\n"; // options is optional
};

exports.generateXML = generateXML;
