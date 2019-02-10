$('#dates').on('change', function () {
	$('#datesFields').css('display', 'block');
	$('#monthField').css('display', 'none');
});
$('#month').on('change', function () {
	$('#monthField').css('display', 'flex');
	$('#datesFields').css('display', 'none');
});
const today = new Date();
let defMonth = today.getMonth(); // retruns  0 -11
if (defMonth === 0) {
	defMonth = 12;
}

let defFromDate = new Date(Date.UTC(today.getFullYear(), today.getMonth() - 1, 1)).toISOString().substr(0, 10);
let defToDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 0)).toISOString().substr(0, 10);

// Set Default Month
$('#selectMonth').val(defMonth);

// Set Default  Start And End Dates;
$('#from').val(defFromDate);
$('#to').val(defToDate);

function setFileName (fileField, filePath) {
	const fileName = window.path.basename(filePath);
	fileField.next('.custom-file-label').html(fileName);
}

$('#isafFile').on('change', function () {
	// get the file name
	var filePath = $(this).val();
	// replace the "Choose a file" label
	setFileName($(this), filePath);
});

const filePath = window.path.join(__dirname, window.config.get('Workbook.info.defaultInput'));
setFileName($('#isafFile'), filePath);
