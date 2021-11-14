// Module to control the application lifecycle and the native browser window.
const { app, BrowserWindow, dialog, ipcMain} = require("electron");
const path = require("path");
const url = require("url");
var fs = require('fs'); // Load the File System to execute our common tasks (CRUD)
const { download } = require('electron-dl');

// Create the native browser window.
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    // Set the path of an additional "preload" script that can be used to
    // communicate between node-land and browser-land.
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // In production, set the initial browser path to the local bundle generated
  // by the Create React App build process.
  // In development, set it to localhost to allow live/hot-reloading.
  const appURL = app.isPackaged
    ? new URL({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true,
      })
    : "http://localhost:3000";
  mainWindow.loadURL(appURL);

  // Automatically open Chrome's DevTools in development mode.
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.maximize();
}

// This method will be called when Electron has finished its initialization and
// is ready to create the browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS.
// There, it's common for applications and their menu bar to stay active until
// the user quits  explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// If your app has no need to navigate or only needs to navigate to known pages,
// it is a good idea to limit navigation outright to that known scope,
// disallowing any other kinds of navigation.
const allowedNavigationDestinations = "https://my-electron-app.com";
app.on("web-contents-created", (event, contents) => {
  contents.on("will-navigate", (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    if (!allowedNavigationDestinations.includes(parsedUrl.origin)) {
      event.preventDefault();
    }
  });
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const open_dialog = (options) => {
  return new Promise((resolve, reject) => {
    var result = dialog.showOpenDialogSync(options);
    if (result) {
      resolve(result);
    } else {
      reject("error opening dialog");
    }
  })
}

ipcMain.handle('open-dialog-ipc', async (event, options ) => {
    const result = await open_dialog(options);
    return result;
})

const read_file = (filepath, options) => {
  return new Promise((resolve, reject) => {
    
    fs.readFile(filepath, options, (err, data) => {
      if (err) {
        reject("An error ocurred reading the file :" + err.message);
        return;
      }

      // Change how to handle the file content
      resolve(data);
    });
  })
}


ipcMain.handle('read-file-ipc', async (event, filepath, options) => {
  const result = await read_file(filepath,options);
  return result;
})

const save_dialog = (options) => {
  return new Promise((resolve, reject) => {
    var result = dialog.showSaveDialogSync(options);
    if (result) {
      resolve(result);
    } else {
      reject("error saving dialog");
    }
  })
}

ipcMain.handle('save-dialog-ipc', async (event, options) => {
  const result = await save_dialog(options);
  return result;
})

const write_file = (filepath, data) => {
  return new Promise((resolve, reject) => {
  
    fs.writeFile(filepath, data, (err) => {
      if (err) {
        reject("An error ocurred writing the file :" + err.message);
        return;
      }

      // Change how to handle the file content
      resolve("");
    });
  })
}


ipcMain.handle('write-file-ipc', async (event, filepath, data) => {
  const result = await write_file(filepath, data);
  return result;
})

ipcMain.on('download-ipc', async (event, url, options) => {
  const win = BrowserWindow.getFocusedWindow();
  download(win, url, options);
});