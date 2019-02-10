const generateJson = require('../../src/xlsxDataToJson.js').generateJson;
const jsonToXml = require('../../src/jsonToXml.js').jsonToXml;
const fs = require('fs');
const config = require('config');

const {
	app,
	BrowserWindow,
	ipcMain
} = require('electron');

// Keep a global reference of the window object, if you don't, the window will
const path = require('path');

// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow () {
	// Create the browser window.
	win = new BrowserWindow({
		width: 400,
		height: 450,
		webPreferences: {
			nodeIntegration: true
		}
	});

	// and load the index.html of the app.
	win.loadFile(path.join(__dirname, 'index.html'));

	// Open the DevTools.
	win.webContents.openDevTools();

	// Emitted when the window is closed.
	win.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		win = null;
	});

	// onSubmit.js ipcRenderer.send() listener that sends back response to onSubmit.js using event.sender.send()
	ipcMain.on('asynchronous-message', (event, arg) => {
		const userInput = arg;

		console.log(['received data in main', arg]);
		console.log(['sending data from main', arg]);
		const startDate = new Date(userInput.startDate);
		const endDate = new Date(userInput.endDate);

		const outPath = path.join(userInput.outPath,
			`/isaf_${startDate.getFullYear()}_${startDate.getMonth() + 1}.xml`);

		const json = generateJson(userInput.filePath, startDate, endDate);
		const purchaseInvCount = json.SourceDocuments.PurchaseInvoices.Invoice.length;
		const salesInvCount = json.SourceDocuments.SalesInvoices.Invoice.length;

		const xml = jsonToXml(json);
		fs.writeFileSync(outPath, xml);

		const appResponce = {
			outPath,
			purchaseInvCount,
			salesInvCount
		};

		// send message to index.html
		event.sender.send('asynchronous-reply', appResponce);
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);
