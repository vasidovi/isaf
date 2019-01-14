var jsonxml = require('js2xmlparser');

var jsonToXml = function (json) {

	var options = {
		declaration: {
			encoding: 'UTF-8',
			version: '1.0'
		},
		format: {
			doubleQuotes: true,
			indent: '  ',
			newline: '\r\n',
			pretty: true
		}
	};

	return jsonxml.parse('iSAFFile', json, options) + '\r\n'; // options is optional
};

exports.jsonToXml = jsonToXml;
