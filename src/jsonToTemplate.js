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

const fs = require('fs');
const templateFiller = require('./templateFiller');

function getJson(dataSource) {
	let json = {};
	const isafTemplate = JSON.parse(
		fs.readFileSync('templates/isaf.json', 'utf8')
	);
	json = templateFiller.fill(isafTemplate, dataSource);
	return json;
}

exports.getJson = getJson;
