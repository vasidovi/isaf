document.querySelector('form').addEventListener('submit', function (event) {
	event.preventDefault();
	const { ipcRenderer } = require('electron');

	const data = 'heya';
	console.log(['sending data to main', data]);

	// send username to main.js
	ipcRenderer.send('asynchronous-message', data);

	// receive message from main.js
	ipcRenderer.on('asynchronous-reply', (event, arg) => {
		console.log(['received response from main', arg]);
	});
});
