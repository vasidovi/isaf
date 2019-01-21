document.querySelector('form').addEventListener('submit', function (event) {
	event.preventDefault();

	const ipcRenderer = require('electron').ipcRenderer;

	const data = getDates();
	console.log(['sending data to main', data]);

	// send username to main.js
	ipcRenderer.send('asynchronous-message', data);

	// receive message from main.js
	// ipcRenderer.on , uziregistruoja, kaip event listener on case of asynchr-reply to do sth
	ipcRenderer.on('asynchronous-reply', (event, arg) => {
		console.log(['received response from main', arg]);
	});
});

function getDates () {
	let startDate;
	let endDate;
	if ($('#datesFields').css('display') !== null) {
		startDate = new Date($('#from').val());
		endDate = new Date($('#to').val());
	} else {
		const month = $('#month').val() - 1;
		const today = new Date();
		let year = today.getFullYear();
		if (month === 11) {
			year = today.getFullYear() - 1;
		}
		startDate = new Date(year, month, 1);
		endDate = new Date(year, month - 1, 0);
	}
	return [startDate, endDate];
};
