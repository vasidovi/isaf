
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

$('#isafFile').on('change', function () {
	// get the file name
	var fileName = $(this).val();
	// replace the "Choose a file" label
	$(this).next('.custom-file-label').html(fileName);
});