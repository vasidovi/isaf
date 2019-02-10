$('#open-explorer').click(function () {
	window.childProcess.exec(`explorer.exe /select,"${window.outPath}"`);
});
