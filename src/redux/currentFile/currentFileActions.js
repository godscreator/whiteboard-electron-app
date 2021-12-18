import * as constants from "./currentFileTypes";
import { load, addItem } from "../pages/pagesActions";
var JSZip = require("jszip");
var JSZipUtils = require("jszip-utils");

const save = async (filepath, filedata, dispatch) => {
    var zip = new JSZip();
    const { elements, pages, urls } = filedata;
    zip.file("elements.json", JSON.stringify(elements));
    zip.file("pages.json", JSON.stringify(pages));
    var arr_urls = [];
    for (const fname in urls) {
        arr_urls.push(fname);
    }
    zip.file("media.json", JSON.stringify(arr_urls));
    var media = zip.folder("media");
    var errs = [];
    for (const fname in urls) {
        const url = urls[fname];
        try {
            var data = await JSZipUtils.getBinaryContent(url);
            console.log(fname, " added.");
            media.file(fname, data, { binary: true });
        } catch (err) {
            errs.push(err);
            console.log(err);
        }
    };
    zip.generateAsync({ type: "nodebuffer" })
        .then(function (content) {
            window.electron.write_file(filepath, content,
                result => {
                    console.log("file saved");
                    dispatch(saveFileSuccess());
                },
                err => {
                    errs.push(err);
                    dispatch(saveFileFailure(errs));
                    console.log(err);
                }
            );
        }).catch(err => {
            errs.push(err);
            dispatch(saveFileFailure(errs));
            console.log(err);
        });
}

export const saveFile = (folderpath, filename, filedata) => {
    return (dispatch) => {
        
        if (folderpath === "") {
            window.electron.save_dialog({
                filters: [
                    { name: "WhiteBoard File", extensions: ['wbrd'] },
                ],
                defaultPath: filename
            },
                (filepath) => {
                    dispatch(saveFileRequest());
                    dispatch(changePath(window.electron.path_dirname(filepath), window.electron.path_basename(filepath)));
                    save(filepath, filedata, dispatch);
                },
                err => {
                    dispatch(saveFileFailure(err));
                    console.log(err);
                }
            );
        } else {
            dispatch(saveFileRequest());
            save(window.electron.path_join(folderpath, filename), filedata, dispatch);
        }
    }
}

export const saveFileRequest = () => {
    return {
        type: constants.SAVE_FILE_REQUEST
    };
}
export const saveFileSuccess = () => {
    return {
        type: constants.SAVE_FILE_SUCCESS
    };
}
export const saveFileFailure = (err) => {
    return {
        type: constants.SAVE_FILE_FAILURE,
        payload: { err: err }
    };
}

export const openFile = () => {
    return (dispatch) => {
        
        window.electron.open_dialog({
            properties: ['openFile'],
            filters: [
                { name: "WhiteBoard File", extensions: ['wbrd'] },
            ]
        },
            result => {
                dispatch(openFileRequest());
                var filepath = result[0];
                dispatch(changePath(window.electron.path_dirname(filepath), window.electron.path_basename(filepath)));

                window.electron.read_file(filepath, null,
                    result => {
                        console.log("reading file");
                        JSZip.loadAsync(result)
                            .then(zip => {
                                zip.file("elements.json").async("string")
                                    .then(result => {
                                        const elements = JSON.parse(result);
                                        console.log("read elements");
                                        zip.file("pages.json").async("string")
                                            .then(pages => {
                                                const pages_images = JSON.parse(pages);
                                                console.log("read pages images");
                                                zip.file("media.json").async("string")
                                                    .then(_fnames => {
                                                        const fnames = JSON.parse(_fnames);
                                                        console.log("read fnames:",fnames.length);

                                                        var count = 0;
                                                        var urls = {};
                                                        if (fnames.length > 0) {
                                                            zip.folder("media").forEach(function (filepath, file) {
                                                                var uri = null;
                                                                var fname = filepath;

                                                                zip.folder("media").file(filepath).async("blob").then(function (blob) {
                                                                    uri = URL.createObjectURL(blob);
                                                                    if (uri !== null) {
                                                                        console.log("loaded: ", fname, uri);
                                                                        urls[fname] = uri;
                                                                    }
                                                                    count += 1;
                                                                    if (count === fnames.length) {
                                                                        console.log("The file is loading.");
                                                                        dispatch(openFileSuccess({ urls: urls }));
                                                                        dispatch(load(elements, pages_images));
                                                                        console.log("The file is loaded.");
                                                                    }
                                                                });
                                                            });
                                                        } else {
                                                            console.log("The file is loading.");
                                                            dispatch(openFileSuccess({ urls: urls }));
                                                            dispatch(load(elements, pages_images));
                                                            console.log("The file is loaded.");
                                                        }
                                                        
                                                    }).catch(err => {
                                                        console.log(err);
                                                        dispatch(openFileFailure(err));
                                                    });
                                            }).catch(err => {
                                                console.log(err);
                                                dispatch(openFileFailure(err));
                                            });
                                    }).catch(err => {
                                        console.log(err);
                                        dispatch(openFileFailure(err));
                                    });
                            }).catch(err => {
                                console.log(err);
                                dispatch(openFileFailure(err));
                            });
                    },
                    err => {
                        console.log(err);
                        dispatch(openFileFailure(err));
                    }
                );
            },
            err => {
                console.log(err);
                dispatch(openFileFailure(err));
            }
        );
    };
};

export const openFileRequest = () => {
    return {
        type: constants.OPEN_FILE_REQUEST
    };
}
export const openFileSuccess = (loaded_data) => {
    return {
        type: constants.OPEN_FILE_SUCCESS,
        payload: { loaded_data: loaded_data }
    };
}
export const openFileFailure = (err) => {
    return {
        type: constants.OPEN_FILE_FAILURE,
        payload: { err: err }
    };
}


export const addUrl = (fname, url) => {
    return {
        type: constants.ADD_URL,
        payload: { fname: fname, url: url }
    }
}

const insert_media = (dispatch,name, width, height, type) => {
    switch (type) {
        case "image":
            dispatch(addItem({ name: "image", fname: name, id: -1, shapeProps: { x: 20, y: 20, width: (width * 200) / height, height: 200, rotation: 0 } }));
            break;
        case "video":
            dispatch(addItem({ name: "video", fname: name, id: -1, shapeProps: { x: 20, y: 20, width: (width * 200) / height, height: 200, rotation: 0 } }));
            break;
        case "audio":
            dispatch(addItem({ name: "audio", fname: name, id: -1, shapeProps: { x: 20, y: 20, width: 500, height: 50, rotation: 0 } }));
            break;
        default:
            break;
    }

}

export const insertMedia = () => {
    return (dispatch) => {
        
        window.electron.open_dialog({
            properties: ['openFile'],
            filters: [
                { name: "Image", extensions: ['jpg', 'png', 'jpeg'] },
                { name: "Video", extensions: ['mp4'] },
                { name: "Audio", extensions: ['mp3'] },
            ]
        },
            result => {
                dispatch(insertMediaRequest());
                var filepath = result[0];
                window.electron.read_file(filepath, null,
                    result => {
                        var uri = null;
                        var fname = null;
                        var type = null;
                        var ext = null;
                        if (filepath.endsWith(".png")) {
                            type = "image";
                            ext = "png";

                        } else if (filepath.endsWith(".jpg")) {
                            type = "image";
                            ext = "jpg";
                        }
                        else if (filepath.endsWith(".jpeg")) {
                            type = "image";
                            ext = "jpeg";
                        } else if (filepath.endsWith(".mp4")) {
                            type = "video";
                            ext = "mp4";
                        }
                        else if (filepath.endsWith(".mp3")) {
                            type = "audio";
                            ext = "mp3";
                        }
                        if (type !== null) {
                            uri = URL.createObjectURL(
                                new Blob([result.buffer], { type: type + "/" + ext }));
                            fname = uri.split('/').pop().split('#')[0].split('?')[0] + "." + ext;
                            dispatch(addUrl(fname, uri));
                            
                            switch (type) {
                                case "image":
                                    var img = new Image();
                                    img.src = uri;
                                    img.onload = function () {
                                        insert_media(dispatch, fname, img.width, img.height, "image");
                                        dispatch(insertMediaSuccess());
                                    }
                                    break;
                                case "video":
                                    var vid = document.createElement("video");
                                    vid.src = uri;
                                    vid.onloadedmetadata = function () {
                                        insert_media(dispatch, fname, vid.videoWidth, vid.videoHeight, "video");
                                        dispatch(insertMediaSuccess());
                                    }
                                    break;
                                case "audio":
                                    insert_media(dispatch, fname, 5, 1, "audio");
                                    dispatch(insertMediaSuccess());
                                    break;
                                default:
                                    break;
                            }
                        }
                    },
                    err => {
                        dispatch(insertMediaFailure(err));
                        console.log(err);
                    }
                );
            },
            err => {
                dispatch(insertMediaFailure(err));
                console.log(err);
            }
        );
    };
};

export const insertMediaRequest = () => {
    return {
        type: constants.INSERT_MEDIA_REQUEST
    };
}
export const insertMediaSuccess = (loaded_data) => {
    return {
        type: constants.INSERT_MEDIA_SUCCESS,
        payload: { loaded_data: loaded_data }
    };
}
export const insertMediaFailure = (err) => {
    return {
        type: constants.INSERT_MEDIA_FAILURE,
        payload: { err: err }
    };
}

export const changePath = (folderpath, filename) => {
    return {
        type: constants.CHANGE_PATH,
        payload: { folderpath: folderpath, filename: filename }
    };
}

export const newFile = () => {
    return {
        type: constants.NEW_FILE
    };
}