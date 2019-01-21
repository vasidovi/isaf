'use strict';

// for electron application
if (window) {
	window.$ = window.jQuery = require('jquery');
	window.Tether = require('tether');
	window.Bootstrap = require('bootstrap');
}
