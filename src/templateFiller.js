const _ = require('lodash');
const dateFormat = require('dateformat');

function resolveField(field, dataSource) {
	let resolvedField = {};
	const type = field["_type"];

	if (type === "date") {
		const format = field["format"];

		let date;
		if (!field["src"]){
			date = Date.now();

		} else {
			date = dataSource[field["src"]];
		}
		resolvedField = dateFormat(date, format);
	}
	return resolvedField;
}

function fill(template, dataSource) {

	const json = {};

	// template[key] // pasiekia value 

	// get array of keys
	const keys = Object.keys(template);

	keys.forEach(key => {

		const field = template[key];

		if (!isObject(field)) {
			json[key] = field;
			return;
		}

		if (field._type) {
			// resolve 
			json[key] = resolveField(field, dataSource);

		} else {
			json[key] = fill(field, dataSource);
		}

	});



	// for (let i = 0; i < keys.length; i++) {

	// 	const key = keys[i];
	// 	const field = template[key];

	// 	if (!isObject(field)) {
	// 		json[key] = field;
	// 		continue;
	// 	}
	// 	const fieldKeys = Object.keys(field);
	// 	if (fieldKeys.includes("_var")){
	// 		// resolve
	// 	} else{
	// 		json[key] = fill(field, dataSource);
	// 	}
	// }


	return json;
}

function isObject(value) {
	return value && typeof value === 'object' && value.constructor === Object;
}

exports.fill = fill;