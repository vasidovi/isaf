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
	// win.webContents.openDevTools();

	// Emitted when the window is closed.
	win.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		win = null;
	});

	ipcMain.on('asynchronous-message', (event, arg) => {
		console.log(['received data in main', arg[0]]);
		console.log(['sending data from main', arg]);

		// send message to index.html
		event.sender.send('asynchronous-reply', arg);
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);
