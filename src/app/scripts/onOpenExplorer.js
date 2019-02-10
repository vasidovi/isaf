$('#open-explorer').click(function () {
	const path = window.outFilePath || window.outPath;
	window.childProcess.exec(`explorer.exe /select,"${path}"`);
});
