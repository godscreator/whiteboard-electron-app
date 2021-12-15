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
} from "./pagesTypes";


const new_page = () => {
    return {
        items: {},
        item_order: [],
        id_count: 0,
        history: [],
        redohistory: []
    };
}

const update_active_image = (pages_images,active,dataUrl) => {
    var c_pages_images = pages_images.slice();
    c_pages_images[active] = dataUrl;
    return c_pages_images;
};

const reset_pages = () => {
    return {
        pages: [new_page()],
        active: 0,
        pages_images: [""]
    };
}

const insert_page = (pages,active,pages_images) => {
    var c_pages = pages.slice();
    var c_pages_images = pages_images.slice();
    if (active < pages.length - 1) {
        c_pages.splice(active + 1, 0, new_page());
        c_pages_images.splice(active + 1, 0, "");
    } else {
        c_pages.push(new_page());
        c_pages_images.push("");
    }
    return { pages: c_pages, pages_images: c_pages_images, active: active + 1 };
};

const delete_page = (pages,active,pages_images) => {
    var c_pages = pages.slice();
    var c_pages_images = pages_images.slice();
    if (pages.length === 1) {
        c_pages.splice(active, 1, new_page());
        c_pages_images.splice(active, 1, "");
        return {pages:c_pages,active:active,pages_images:c_pages_images}
    } else {
        c_pages.splice(active, 1);
        c_pages_images.splice(active, 1);
        return { pages: c_pages, active: active - 1, pages_images: c_pages_images }
    }
};
const change_page = (pages_length, active, index) => {
    switch (index) {
        case "first":
            return 0;
        case "last":
            return pages_length - 1;
        case "prev":
            return Math.max(0, active - 1);
        case "next":
            return Math.min(active + 1, pages_length - 1);
        default:
            return Math.max(Math.min(index, pages_length - 1), 0);
    }
}

// display of items

const add_item = (pages,active,item) => {
    const id = pages[active].id_count;
    var c_items = { ...pages[active].items };
    c_items[id] = item;
    c_items[id].id = id;
    var c_item_order = pages[active].item_order.concat([id]);
    var c_history = pages[active].history.concat([{ items: pages[active].items, item_order: pages[active].item_order }]);
    var c_pages = pages.slice();
    c_pages[active] = { ...pages[active], items: c_items, item_order: c_item_order, history: c_history, id_count: id + 1 };
    return c_pages;
}

const remove_item = (pages,active,id) => {
    var c_items = { ...pages[active].items };
    delete c_items[id];
    var c_item_order = pages[active].item_order.slice();
    const index = c_item_order.indexOf(id);
    if (index > -1) {
        c_item_order.splice(index, 1);
    }
    var c_history = pages[active].history.concat([{ items: pages[active].items, item_order: pages[active].item_order }]);
    var c_pages = pages.slice();
    c_pages[active] = { ...pages[active], items: c_items, item_order: c_item_order, history: c_history};
    return c_pages;
}

const change_item = (pages, active,id, new_value) => {
    var c_items = { ...pages[active].items };
    c_items[id] = new_value;
    c_items[id].id = id;
    var c_history = pages[active].history.concat([{ items: pages[active].items, item_order: pages[active].item_order }]);
    var c_pages = pages.slice();
    c_pages[active] = { ...pages[active], items: c_items, history: c_history };
    return c_pages;
}

const put_last = (pages, active, id) => {
    var c_item_order = pages[active].item_order.slice();
    const index = c_item_order.indexOf(id);
    if (index > -1) {
        c_item_order.splice(index, 1);
    }
    c_item_order.push(id);
    var c_history = pages[active].history.concat([{ items: pages[active].items, item_order: pages[active].item_order }]);
    var c_pages = pages.slice();
    c_pages[active] = { ...pages[active], item_order: c_item_order , history: c_history };
    return c_pages;
}



// undo and redo

const undo = (pages,active) => {
    var c_history = pages[active].history.slice();
    var h = c_history.pop();
    if (h) {
        var c_redohistory = pages[active].redohistory.concat([h]);
        var c_items = h.items;
        var c_item_order = h.item_order;
        var c_pages = pages.slice();
        c_pages[active] = { ...pages[active], items: c_items, item_order: c_item_order, history: c_history, redohistory: c_redohistory };
        return c_pages;
    }
    return pages;
}
const redo = (pages,active) => {
    var c_redohistory = pages[active].redohistory.slice();
    var h = c_redohistory.pop();
    if (h) {
        var c_history = pages[active].history.concat([h]);
        var c_items = h.items;
        var c_item_order = h.item_order;
        var c_pages = pages.slice();
        c_pages[active] = { ...pages[active], items: c_items, item_order: c_item_order, history: c_history, redohistory: c_redohistory };
        return c_pages;
    }
    return pages;
}

const load = (elements,pages_images) => {
    var c_pages = [];
    for (let e = 0; e < elements.length; e++) {
        const page = elements[e];
        var tmp = new_page();
        var c = 0;
        for (let i = 0; i < page.length; i++) {
            var item = page[i];
            tmp.item_order.push(c);
            item.id = c;
            tmp.items[c] = item;
            c += 1;
        }
        tmp.id_count = c;
        c_pages.push(tmp);
    }
    return { pages: c_pages, active: Math.max(0, c_pages.length - 1), pages_images: pages_images.slice()};
}

const initialState = {
    pages: [new_page()],
    active: 0,
    pages_images: [""],
};

const pagesReducer = (state = initialState, action) => {
    const { pages, active, pages_images } = state;
    switch (action.type) {
        case UPDATE_IMAGE:
            const c_pages_images0 = update_active_image(pages_images, active, action.payload.dataUrl);
            return {
                ...state,
                pages_images: c_pages_images0
            };
        case INSERT_PAGE:
            const state1 = insert_page(pages, active, pages_images);
            return state1;
        case REMOVE_PAGE:
            const state2 = delete_page(pages, active, pages_images);
            return state2;
        case CHANGE_PAGE:
            const c_active3 = change_page(pages.length, active, action.payload.index);
            return {
                ...state,
                active: c_active3
            };
        case ADD_ITEM:
            const c_pages4 = add_item(pages,active,action.payload.item);
            return {
                ...state,
                pages: c_pages4
            };
        case REMOVE_ITEM:
            const c_pages5 = remove_item(pages, active, action.payload.id);
            return {
                ...state,
                pages: c_pages5
            };
        case CHANGE_ITEM:
            const c_pages6 = change_item(pages, active, action.payload.id, action.payload.item);
            return {
                ...state,
                pages: c_pages6
            };
        case PUT_LAST:
            const c_pages7 = put_last(pages, active, action.payload.id);
            return {
                ...state,
                pages: c_pages7
            };
        case UNDO:
            const c_pages8 = undo(pages, active);
            return {
                ...state,
                pages: c_pages8
            };
        case REDO:
            const c_pages9 = redo(pages, active);
            return {
                ...state,
                pages: c_pages9
            };
        case LOAD:
            const c_state10 = load(action.payload.elements, action.payload.pages_images);
            return c_state10;
        case RESET:
            const c_state11 = reset_pages();
            return c_state11;
        
        
        default: return state
    }
}

export default pagesReducer