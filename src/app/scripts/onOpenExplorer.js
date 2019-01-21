const childProcess = require('child_process');
$('#open-explorer').click(function (event) {
	const files = $('#isafFile')[0].files;
	if (!files.length) {
		return;
	}

	// DEMO ONLY. This should open outfile, not selected file
	childProcess.exec(`explorer.exe /select,"${files[0].path}"`);
});
