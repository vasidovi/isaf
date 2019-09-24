document.querySelector('form').addEventListener('submit', function (event) {
	event.preventDefault();
	$('#modal-loader').show();
	$('#modal-footer').hide();
	$('#loading-dialog').modal('show');
	setTimeout(submit, 1000);
});

async function submit () {
	const ipcRenderer = require('electron').ipcRenderer;

	const dates = getDates();
	let filePath;
	if ($('#isafFile').val()) {
		const files = $('#isafFile')[0].files;
		filePath = files[0].path;
	} else {
		filePath = window.config.get('Workbook.info.defaultInput');
		if (!window.path.isAbsolute(filePath)) {
			filePath = window.path.join(__dirname, filePath);
		}
	}

	const data = {
		'startDate': dates[0],
		'endDate': dates[1],
		filePath,
		outPath: window.outPath
	};

	console.log(['sending data to main', data]);

	// send username to main.js
	ipcRenderer.send('asynchronous-message', data);

	// receive message from main.js
	// ipcRenderer.on , uziregistruoja, kaip event listener on case of asynchr-reply to do sth
	ipcRenderer.on('asynchronous-reply', (event, arg) => {
		console.log(['received response from main', arg]);
		$('#modal-loader').hide();
		$('#modal-footer').show();
		$('#modal-result').html('Suformuota įrašų: ' + (arg.purchaseInvCount + arg.salesInvCount));
		window.outFilePath = arg.outPath;
	});
}

function getDates () {
	let startDate;
	let endDate;
	var dateFields = $('#datesFields').css('display')
	if (dateFields !== null && dateFields != 'none') {
		startDate = new Date($('#from').val());
		endDate = new Date($('#to').val());
	} else {
		const month = parseInt($('#monthField option:selected').text() )- 1;
		const today = new Date();
		let year = today.getFullYear();
		if (month === 11) {
			year = today.getFullYear() - 1;
		}
		startDate = new Date(Date.UTC(year, month, 1));
		endDate = new Date(Date.UTC(year, month + 1, 0));
	}
	return [startDate, endDate];
};
