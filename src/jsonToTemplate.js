const fs = require('fs');
const templateFiller = require('./templateFiller');

function getJson (dataSource) {
	let json = {};
	const isafTemplate = JSON.parse(
		fs.readFileSync('templates/isaf.json', 'utf8')
	);
	json = templateFiller.fill(isafTemplate, dataSource);
	return json;
}

exports.getJson = getJson;
