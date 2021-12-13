import {
    ADD_ITEM,
    REMOVE_ITEM,
    CHANGE_ITEM,
    PUT_LAST,
    INSERT_PAGE,
    REMOVE_PAGE,
    CHANGE_PAGE,
    UPDATE_IMAGE,
    UNDO,
    REDO,
    LOAD,
    RESET,
    ADD_URL
} from "./pagesTypes";

export const addItem = (item) => {
    return {
        type: ADD_ITEM,
        payload: { item: item }
    }
}
export const removeItem = (id) => {
    return {
        type: REMOVE_ITEM,
        payload: { id: id }
    }
}
export const changeItem = (id, item) => {
    return {
        type: CHANGE_ITEM,
        payload: {id:id, item:item}
    }
}
export const putLast = (id) => {
    return {
        type: PUT_LAST,
        payload: { id: id }
    }
}
export const insertPage = () => {
    return {
        type: INSERT_PAGE
    }
}
export const removePage = () => {
    return {
        type: REMOVE_PAGE
    }
}
export const changePage = (index) => {
    return {
        type: CHANGE_PAGE,
        payload: { index: index }
    }
}
export const updatePageImage = (dataUrl) => {
    return {
        type: UPDATE_IMAGE,
        payload: { dataUrl: dataUrl }
    }
}
export const undo = () => {
    return {
        type: UNDO
    }
}
export const redo = () => {
    return {
        type: REDO
    }
}
export const load = (elements,pages_images) => {
    return {
        type: LOAD,
        payload: {elements: elements, pages_images: pages_images}
    }
}
export const reset = () => {
    return {
        type: RESET
    }
}
export const addUrl = (fname,url) => {
    return {
        type: ADD_URL,
        payload: {fname:fname,url:url}
    }
}
