'use strict';

// for electron application
if (window) {
	window.$ = window.jQuery = require('jquery');
	window.Tether = require('tether');
	window.Bootstrap = require('bootstrap');
	window.config = require('config');
	window.path = require('path');
	window.childProcess = require('child_process');

	window.outPath = window.config.get('Workbook.info.defaultOutputDir');
	if (!window.path.isAbsolute(window.outPath)) {
		window.outPath = window.path.join(__dirname, window.outPath);
	}
}
