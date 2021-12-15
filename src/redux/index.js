import store from "./store";

export const getPagesData = () => {
    const state = store.getState();
    const pages = state.pages.pages;
    const pages_images = state.pages.pages_images;
    const urls = state.currentFile.urls;
    var c_urls = {};
    var elements = [];
    for (let p = 0; p < pages.length; p++) {
        const page = pages[p];
        var tmp = [];
        for (let i = 0; i < page.item_order.length; i++) {
            const id = page.item_order[i];
            const c_item = page.items[id];
            if (c_item.fname) {
                c_urls[c_item.fname] = urls[c_item.fname];
            }
            tmp.push(c_item);
        }
        elements.push(tmp);
    }
    return { elements: elements, pages: pages_images, urls: c_urls };
}

export * from './pages/pagesActions'
export * from './currentFile/currentFileActions'