const {
	app,
	BrowserWindow
} = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
	// Create the browser window.
	win = new BrowserWindow({
		width: 500,
		height: 500,
		webPreferences: {
			nodeIntegration: true
		}
	});

	// and load the index.html of the app.
	win.loadFile(__dirname +'/index.html');

	// Open the DevTools.
	// win.webContents.openDevTools();

	// Emitted when the window is closed.
	win.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		win = null;
	});
}

// let date;
// let path;
// button.onClick(()=> {
	// const json = xlsxtoJson(path, date);
	// const xml = jsonToXml(json);
	// write to file
// }


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);