import { SAVE_FILE, OPEN_FILE } from "./currentFileTypes";

const initialState = {
    folder: "",
    filename: ""
}

const currentFileReducer = (state = initialState, action) => {
    switch (action.type) {
        case SAVE_FILE:
            return {
                ...state,
                folder: action.payload.folder,
                filename: action.payload.filename
            };
        case OPEN_FILE:
            return {
                ...state,
                folder: action.payload.folder,
                filename: action.payload.filename
            };

        default: return state
    }
}

export default currentFileReducer