import * as constants from "./currentFileTypes";


const add_url = (urls, fname, url) => {
    var c_urls = { ...urls };
    c_urls[fname] = url;
    return c_urls;
}

const initialState = {
    folderpath: "",
    filename: "untitled.wbrd",
    loading: false,
    urls: {},
}

const currentFileReducer = (state = initialState, action) => {
    switch (action.type) {
        case constants.OPEN_FILE_REQUEST:
            return {
                ...state,
                loading:true
            };
        case constants.SAVE_FILE_REQUEST:
            return {
                ...state,
                loading: true
            };
        case constants.INSERT_MEDIA_REQUEST:
            return {
                ...state,
                loading: true
            };
        case constants.OPEN_FILE_SUCCESS:
            return {
                ...state,
                loading: false,
                err: "",
                urls: {...action.payload.loaded_data.urls}
            };
        case constants.SAVE_FILE_SUCCESS:
            return {
                ...state,
                loading: false,
                err: ""
            };
        case constants.INSERT_MEDIA_SUCCESS:
            return {
                ...state,
                loading: false,
                err: ""
            };
        case constants.ADD_URL:
            const c_urls12 = add_url(state.urls, action.payload.fname, action.payload.url);
            return {
                ...state,
                urls: c_urls12
            };
        case constants.NEW_FILE:
            for (const fname in state.urls) {
                URL.revokeObjectURL(state.urls[fname]);
            }
            return {
                ...state,
                filename: "untitled.wbrd",
                loading: false,
                urls: {}
            };
        case constants.CHANGE_PATH:
            return {
                ...state,
                filename: action.payload.filename,
                folderpath: action.payload.folderpath
            };
        default: return state
    }
}

export default currentFileReducer