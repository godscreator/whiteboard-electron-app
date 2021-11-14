// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer, readFile, writeFile, showOpenDialog, showSaveDialog } = require("electron");

// As an example, here we use the exposeInMainWorld API to expose the browsers
// and node versions to the main window.
// They'll be accessible at "window.versions".
process.once("loaded", () => {
    contextBridge.exposeInMainWorld(
        "electron", {
            "open_dialog": (options, on_success, on_fail) => {
                ipcRenderer.invoke('open-dialog-ipc', options).then(filename => on_success(filename)).catch(err => on_fail(err));
            },
            "read_file": (filepath, options, on_success, on_fail) => {
                ipcRenderer.invoke('read-file-ipc', filepath, options).then(data=>on_success(data)).catch(err=>on_fail(err));
            },
            "save_dialog": (options, on_success, on_fail) => {
                ipcRenderer.invoke('save-dialog-ipc', options).then(filename=>on_success(filename)).catch(err => on_fail(err));
            },
            "write_file": (filepath, content, on_success, on_fail) => {
                ipcRenderer.invoke('write-file-ipc', filepath, content).then(result=>on_success(result)).catch(err=>on_fail(err));
            },
            "versions": process.versions
        }
    );
});