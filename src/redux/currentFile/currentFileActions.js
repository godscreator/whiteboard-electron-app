import { SAVE_FILE, OPEN_FILE } from "./currentFileTypes";

export const saveFile = (folder,filename) => {
    return {
        type: SAVE_FILE,
        payload: {folder:folder,filename:filename}
    }
}
export const openFile = (folder,filename) => {
    return {
        type: OPEN_FILE,
        payload: { folder: folder, filename: filename }
    }
}