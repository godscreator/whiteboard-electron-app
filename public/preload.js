// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require("electron");
const path = require("path");

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
            ipcRenderer.invoke('read-file-ipc', filepath, options).then(data => on_success(data)).catch(err => on_fail(err));
        },
        "save_dialog": (options, on_success, on_fail) => {
            ipcRenderer.invoke('save-dialog-ipc', options).then(filename => on_success(filename)).catch(err => on_fail(err));
        },
        "write_file": (filepath, content, on_success, on_fail) => {
            ipcRenderer.invoke('write-file-ipc', filepath, content).then(result => on_success(result)).catch(err => on_fail(err));
        },
        "download": (url, options) => {
            ipcRenderer.send('download-ipc', url, options);
        },
        "versions": process.versions,
        "path_basename": (filepath) => {
            return path.basename(filepath);
        },
        "path_dirname": (filepath) => {
            return path.dirname(filepath);
        },
        "path_join": (...paths) => {
            return path.join(...paths);
        }
    }
    );
});