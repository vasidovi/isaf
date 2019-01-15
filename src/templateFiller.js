const dateFormat = require('dateformat');
const fs = require('fs');
const JSONPath = require('advanced-json-path');

function resolveSource (dataSource, field) {
	return JSONPath(dataSource, '$.' + field.src);
}

function resolveDate (field, dataSource) {
	const format = field['format'];

	let date;
	if (!field['src']) {
		date = Date.now();
	} else {
		date = resolveSource(dataSource, field);
	}
	return dateFormat(date, format);
}

function resolveArray (field, dataSource) {
	const resolvedField = [];
	const data = resolveSource(dataSource, field);
	const template = JSON.parse(
		fs.readFileSync(`templates/${field.template}.json`, 'utf8')
	);

	// forEach data instance fill template
	data.forEach(instance => {
		resolvedField.push(fill(template, instance));
	});

	return resolvedField;
}

function resolveString (field, dataSource) {
	let resolvedField = '';
	const data = resolveSource(dataSource, field);

	if ((data === undefined || data === false) && field.default) {
		resolvedField = field.default;
	} else if (field.allowOverride && typeof data === 'object') {
		resolvedField = data;
	} else {
		resolvedField = '' + data;
	}

	return resolvedField;
}

function resolveNumber (field, dataSource) {
	const data = resolveSource(dataSource, field);
	let resolvedField = parseFloat(data);

	if (field.fixed !== undefined) {
		resolvedField = resolvedField.toFixed(field.fixed);
	}
	return resolvedField;
}

const resolveMap = {
	resolveArray,
	resolveDate,
	resolveString,
	resolveNumber
};

function resolveField (field, dataSource) {
	const type = field['_type'];

	const resolveFunctionKey = `resolve${type.replace(/^\w/, c => c.toUpperCase())}`;
	const resolveFunction = resolveMap[resolveFunctionKey];
	return resolveFunction(field, dataSource);
}

function fill (template, dataSource) {
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

	return json;
}

function isObject (value) {
	return value && typeof value === 'object' && value.constructor === Object;
}

exports.fill = fill;
