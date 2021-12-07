import "./whiteboard_styles.css";
import React, { useState, useRef, useCallback } from "react";
import { Stage, Layer } from 'react-konva';
import Pagination from "react-bootstrap/Pagination";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";
import Toolbox from "./toolbox.js";
import Topbar from "./file_menu.js";
import { to_canvas_elements } from "./canvas_element";

export default function Whiteboard() {

    const stageref = useRef(null);
    const stageparentref = useRef(null);
    const [tempElem, setTempElem] = useState(null);
    const [urls, setUrls] = useState({});

    // Pages


    const new_page = () => {
        return {
            items: {},
            item_order: [],
            id_count: 0,
            history: [],
            redohistory: []
        };
    }
    const [pages, setPages] = useState([new_page()]);
    const [active, setActive] = useState(0);
    const [pages_images, setPagesImages] = useState([""]);
    const get_page_image_url = () => {
        var img_url = "";
        if (stageref.current !== null) {
            img_url = stageref.current.toDataURL({ pixelRatio: 2 });
        }
        return img_url;
    }
    const update_active_image = useCallback(() => {
        var c_pages_images = pages_images.slice();
        c_pages_images[active] = get_page_image_url();
        setPagesImages(c_pages_images);
    }, [active, pages_images]);

    const insert_page = () => {
        console.log("insert page");
        var c_pages = pages.slice();
        var c_pages_images = pages_images.slice();
        if (active < pages.length - 1) {
            c_pages.splice(active + 1, 0, new_page());
            c_pages_images.splice(active + 1, 0, "");
        } else {
            c_pages.push(new_page());
            c_pages_images.push("");
        }
        c_pages_images[active] = get_page_image_url();
        setPages(c_pages);
        setPagesImages(c_pages_images);
        setActive(active + 1);
    };
    const delete_page = () => {
        console.log("delete page");
        var c_pages = pages.slice();
        var c_pages_images = pages_images.slice();
        if (pages.length === 1) {
            c_pages.splice(active, 1, new_page());
            c_pages_images.splice(active, 1, "");
        } else {
            c_pages.splice(active, 1);
            c_pages_images.splice(active, 1);
            setActive(active - 1);
        }
        setPages(c_pages);
        setPagesImages(c_pages_images);
    };
    const first_page = () => {
        console.log("first page");
        setActive(0);
        update_active_image();
    };
    const prev_page = () => {
        console.log("prev page");
        setActive(Math.max(0, active - 1));
        update_active_image();
    };
    const next_page = () => {
        console.log("next page");
        setActive(Math.min(active + 1, pages.length - 1));
        update_active_image();
    };
    const last_page = () => {
        console.log("last page");
        setActive(pages.length - 1);
        update_active_image();
    };

    // display of items
    const get_items = () => {
        return pages[active].items;
    }
    const setItems = (items) => {
        var c_pages = pages.slice();
        c_pages[active].items = items;
        setPages(c_pages);
        update_active_image();
    }
    const get_item_order = () => {
        return pages[active].item_order;
    }
    const setItemOrder = (item_order) => {
        var c_pages = pages.slice();
        c_pages[active].item_order = item_order;
        setPages(c_pages);
        update_active_image();
    }
    const get_id_count = () => {
        return pages[active].id_count;
    }
    const setIdCount = (id_count) => {
        var c_pages = pages.slice();
        c_pages[active].id_count = id_count;
        setPages(c_pages);
        update_active_image();
    }

    const add_item = (item, to_history = true, index = -1, id = -1) => {
        if (id === -1) {
            id = get_id_count();
            setIdCount(get_id_count() + 1);
        }
        var c_items = { ...get_items() };
        c_items[id] = item;
        c_items[id].id = id;
        setItems(c_items);
        if (index < 0 || index >= get_item_order().length) {
            setItemOrder(get_item_order().concat([id]));
        } else {
            var order = get_item_order().slice();
            order.splice(index, 0, id);
            setItemOrder(order);
        }

        if (to_history)
            add_to_history({ type: "add", id: id });

        return id;
    }

    const remove_item = (id, to_history = true) => {
        var c_items = { ...get_items() };
        var old_value = { ...c_items[id] };
        delete c_items[id];
        console.log("c_items:", c_items);
        setItems(c_items);
        const index = get_item_order().indexOf(id);
        var c_item_order = get_item_order().slice();
        if (index > -1) {
            c_item_order.splice(index, 1);
        }
        console.log("c_items_order:", c_item_order);
        setItemOrder(c_item_order);
        if (to_history)
            add_to_history({ type: "remove", value: old_value, index: index, id: id });
        return { value: old_value, index: index };
    }

    const change_item = (id, new_value, to_history = true) => {
        var old_value = { ...get_items()[id] };
        var c_items = { ...get_items() };
        c_items[id] = new_value;
        c_items[id].id = id;
        setItems(c_items);
        if (to_history)
            add_to_history({ type: "change", id: id, old_value: old_value });
        return new_value;
    }


    // undo and redo
    const get_history = () => {
        return pages[active].history;
    }
    const setHistory = (history) => {
        var c_pages = pages.slice();
        c_pages[active].history = history;
        setPages(c_pages);
        update_active_image();
    }
    const get_redohistory = () => {
        return pages[active].redohistory;
    }
    const setRedoHistory = (redohistory) => {
        var c_pages = pages.slice();
        c_pages[active].redohistory = redohistory;
        setPages(c_pages);
        update_active_image();
    }
    const undo = () => {
        var chistory = get_history().slice();
        var h = chistory.pop();
        let r;
        if (h) {
            switch (h.type) {
                case "add":
                    var { value, index } = remove_item(h.id, false);
                    r = { type: "remove", value: value, index: index, id: h.id };
                    break;
                case "remove":
                    var id = add_item(h.value, false, h.index, h.id);
                    r = { type: "add", id: id };
                    break;
                case "change":
                    var new_value = change_item(h.id, h.old_value, false);
                    r = { type: "change", id: h.id, new_value: new_value };
                    break;
                default:
            }
            setRedoHistory(get_redohistory().concat([r]));
            setHistory(chistory);
        }
    }
    const redo = () => {
        var rhistory = get_redohistory().slice();
        var r = rhistory.pop();
        let h;
        if (r) {
            switch (r.type) {
                case "add":
                    var { value, index } = remove_item(r.id, false);
                    h = { type: "remove", value: value, index: index, id: r.id }
                    break;
                case "remove":
                    var id = add_item(r.value, false, r.index, r.id);
                    h = { type: "add", id: id }
                    break;
                case "change":
                    var old_value = change_item(r.id, r.new_value, false);
                    h = { type: "change", id: r.id, old_value: old_value };
                    break;
                default:
            }
            setRedoHistory(rhistory);
            setHistory(get_history().concat([h]))
        }
    }
    const add_to_history = (h) => {
        setHistory(get_history().concat([h]));
        setRedoHistory([]);
    }

    // select

    const [selectedId, selectShape] = useState(null);
    const [currentShapeId, setCurrentShapeId] = useState(null);
    const menuref = useRef(null); // reference to right click menu



    // filemenu

    const topbarref = useRef(null);

    const get_image_url = () => {
        var img_url = "";
        if (stageref.current !== null) {
            img_url = stageref.current.toDataURL({ pixelRatio: 2 });
        }
        return { url: img_url, page_no: active };
    }

    const clear = () => {
        setTempElem({});
        setUrls({});
        setTool({ name: "select" });
        setIsDrawing(false);
        selectShape(null);
        setCursor("default");
        setPages([new_page()]);
        setActive(0);
    }

    const load_elements = (elements) => {
        setPages(elements);
    }

    const load_page_images = (page_images) => {
        setPagesImages(page_images);
    }

    const add_url = (name, url) => {
        urls[name] = url;
        setUrls(urls);
    }

    const get_data = () => {
        return { elements: pages, pages: pages_images, urls: urls };
    }

    const insert_image = (name) => {
        add_item({ name: "image", fname: name, id: -1, shapeProps: { x: 0, y: 0, width: -1, height: -1, rotation: 0 } });
    }

    // Toolbox 

    const [tool, setTool] = useState({ name: "brush", color: "black", radius: 5 });
    const [isDrawing, setIsDrawing] = useState(false);

    const brush = (action, point) => {
        selectShape(null);
        switch (action) {

            case "mouse_down":
                setTempElem({ ...tool, points: [point.x, point.y], id: -1 });
                break;

            case "mouse_move":
                var q = tempElem.points.concat([point.x, point.y]);
                setTempElem({ ...tool, points: q, id: -1 });
                break;

            case "mouse_up":
                if (tempElem !== null)
                    add_item(tempElem);
                setTempElem(null);
                break;

            case "mouse_leave":
                setIsDrawing(false);
                if (tempElem !== null) {
                    var p2 = tempElem.points.concat([point.x, point.y]);
                    var t2 = { ...tempElem, points: p2 };
                    add_item(t2);
                }
                setTempElem(null);
                break;
            default:
        }
    }

    const eraser = (action, point) => {
        selectShape(null);
        switch (action) {

            case "mouse_down":
                setTempElem({ ...tool, points: [point.x, point.y], id: -1 });
                break;

            case "mouse_move":
                var q = tempElem.points.concat([point.x, point.y]);
                setTempElem({ ...tool, points: q, id: -1 });
                break;

            case "mouse_up":
                if (tempElem !== null)
                    add_item(tempElem);
                setTempElem(null);
                break;

            case "mouse_leave":
                setIsDrawing(false);
                if (tempElem !== null) {
                    var p2 = tempElem.points.concat([point.x, point.y]);
                    var t2 = { ...tempElem, points: p2 };
                    add_item(t2);
                }
                setTempElem(null);
                break;
            default:
        }
    };

    const shapes = (action, point) => {
        selectShape(null);
        switch (action) {

            case "mouse_down":
                setTempElem({ ...tool, points: [point.x, point.y], id: -1 });
                break;

            case "mouse_move":
                let q;
                if (tempElem.points.length === 2) {
                    q = tempElem.points.concat([point.x, point.y]);
                } else {
                    q = tempElem.points.slice();
                    q[2] = point.x;
                    q[3] = point.y;
                }
                setTempElem({ ...tempElem, points: q, shapeProps: { x: q[0], y: q[1], width: q[2] - q[0], height: q[3] - q[1], rotation: 0 } });
                break;

            case "mouse_up":
                if (tempElem !== null && tempElem.points.length === 4) {
                    add_item(tempElem);
                }
                setTempElem(null);
                break;

            case "mouse_leave":
                setIsDrawing(false);
                if (tempElem !== null && tempElem.points) {
                    let p;
                    if (tempElem.points.length === 2) {
                        p = tempElem.points.concat([point.x, point.y]);
                    } else {
                        p = tempElem.points.slice();
                        p[2] = point.x;
                        p[3] = point.y;
                    }
                    if (tempElem !== null && p.length === 4) {
                        add_item({ ...tempElem, points: p, shapeProps: { x: p[0], y: p[1], width: p[2] - p[0], height: p[3] - p[1], rotation: 0 } });
                    }
                    setTempElem(null);
                }

                break;
            default:
        }
    };

    const select = (action, point) => {
        setTempElem(null);
    }

    const text = (action, point) => {
        switch (action) {
            case "mouse_up":
                add_item({ ...tool, text: "", id: -1, shapeProps: { x: point.x, y: point.y, width: 100, height: 100, rotation: 0 } });
                setTempElem(null);
                break;
            default:
        }
    }

    var fn_dict = {};
    fn_dict["brush"] = brush;
    fn_dict["eraser"] = eraser;
    fn_dict["shapes"] = shapes;
    fn_dict["select"] = select;
    fn_dict["text"] = text;

    const [cursor, setCursor] = useState("default");
    const set_cursor = (cursor) => {
        setCursor(cursor)
    }

    const refresh = () => {
        setTool({ name: "select" });
    }

    const on_select_id = (id) => {
        if (tool.name === "select")
            selectShape(id);
    }

    const on_shape_change = (shape, id) => {
        console.log("id:", id, " shape:", shape);
        change_item(id, shape);
        setTool({ name: "select" });
    }

    // Handlers

    const handle_container_key_down = e => {
        //handles Ctrl+N, Ctrl+O and Ctrl+S

        if ((e.ctrlKey || e.metaKey) && e.code === "KeyN") {
            if (topbarref.current) {
                topbarref.current.new();
            }
        } else if ((e.ctrlKey || e.metaKey) && e.code === "KeyO") {
            if (topbarref.current) {
                topbarref.current.open();
            }
        }
        else if ((e.ctrlKey || e.metaKey) && e.code === "KeyS") {
            if (topbarref.current) {
                topbarref.current.save();
            }
        }
    }

    const handle_stage_key_down = e => {
        // Handles Ctrl+Z and Ctrl+R

        if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ") {
            undo();
        } else if ((e.ctrlKey || e.metaKey) && e.code === "KeyR") {
            e.preventDefault();
            redo();
        }
    }

    const handle_stage_mouse_down = evt => {
        // call for the selected tool to do when mouse down
        if (evt.evt.which !== 3) { // right click is not accepted
            setIsDrawing(true);
            const action = "mouse_down";
            const stage = evt.target.getStage();
            const p = stage.getPointerPosition();
            const point = { x: p.x, y: p.y };
            fn_dict[tool.name](action, point);
            if (evt.target === evt.target.getStage()) {
                selectShape(null);
            }
            if (menuref.current) {
                menuref.current.style.display = "none";
            }
        }
    }

    const handle_stage_mouse_move = evt => {
        // call for the selected tool to do when mouse move
        if (evt.evt.which !== 3) { // right click is not accepted
            if (isDrawing) {
                const action = "mouse_move";
                const stage = evt.target.getStage();
                const p = stage.getPointerPosition();
                const point = { x: p.x, y: p.y };
                fn_dict[tool.name](action, point);
            }
        }
    }

    const handle_stage_mouse_up = evt => {
        // call for the selected tool to do when mouse up
        if (evt.evt.which !== 3) { // right click is not accepted
            setIsDrawing(false);
            const action = "mouse_up";
            const stage = evt.target.getStage();
            const p = stage.getPointerPosition();
            const point = { x: p.x, y: p.y };
            fn_dict[tool.name](action, point);
        }
    }

    const handle_stage_mouse_enter = evt => {
        // call for the selected tool to do when mouse enter the stage
        if (currentShapeId === null) {
            const action = "mouse_enter";
            const stage = evt.target.getStage();
            const p = stage.getPointerPosition();
            const point = { x: p.x, y: p.y };
            fn_dict[tool.name](action, point);
        }
    }

    const handle_stage_mouse_leave = evt => {
        // call for the selected tool to do when mouse leave the stage
        if (currentShapeId === null) {
            const action = "mouse_leave";
            const stage = evt.target.getStage();
            const p = stage.getPointerPosition();
            const point = { x: p.x, y: p.y };
            fn_dict[tool.name](action, point);
        }

    }

    const handle_stage_on_context_menu = e => {
        // call for the selected tool to do when right click
        const stage = e.target.getStage();
        if (e.target !== stage) {
            var id = Number(e.target.id());
            setCurrentShapeId(id);
            console.log("id: ", id);
            if (menuref.current) {
                var menuNode = menuref.current;
                menuNode.style.display = 'block';
                var containerRect = stage.container().getBoundingClientRect();
                menuNode.style.top =
                    containerRect.top + stage.getPointerPosition().y + 'px';
                menuNode.style.left =
                    containerRect.left + stage.getPointerPosition().x + 'px';
            }
        } else {
            setCurrentShapeId(-1);
            if (menuref.current) {
                menuref.current.style.display = "none";
            }
        }
    }

    const handle_stage_on_delete = e => {
        // handle when delete button of right click menu is pressed.
        if (menuref.current) {
            menuref.current.style.display = "none";
        }
        if (currentShapeId >= 0) {
            remove_item(currentShapeId);
            setCurrentShapeId(null);
        }
    }

    return (
        <div id="container"
            onKeyDown={e => handle_container_key_down(e)}
            tabIndex="0"
        >
            <div id="topbar">
                <Topbar
                    ref={topbarref}
                    load_elements={(elements) => load_elements(elements)}
                    load_page_images={(page_images) => load_page_images(page_images)}
                    add_url={(name, url) => add_url(name, url)}
                    get_data={() => get_data()}
                    insert_image={(name) => insert_image(name)}
                    clear={() => clear()}
                    get_image_url={() => get_image_url()}
                    page_image_urls={pages_images}
                    refresh={() => refresh()}
                />
            </div>

            <div id="toolbox">
                <Toolbox tool={tool} onToolChangeHandler={(t) => setTool(t)} />
            </div>
            <div ref={stageparentref} className="white-board"
                onKeyDown={e => handle_stage_key_down(e)}
                tabIndex="0"
            >
                <Stage ref={stageref}
                    style={{ cursor: cursor }}
                    width={stageparentref.current ? stageparentref.current.offsetWidth : 100}
                    height={stageparentref.current ? stageparentref.current.offsetHeight : 100}
                    onMouseDown={evt => handle_stage_mouse_down(evt)}
                    onMousemove={evt => handle_stage_mouse_move(evt)}
                    onMouseup={evt => handle_stage_mouse_up(evt)}
                    onMouseEnter={evt => handle_stage_mouse_enter(evt)}
                    onMouseLeave={evt => handle_stage_mouse_leave(evt)}
                    onContextMenu={e => handle_stage_on_context_menu(e)}
                >
                    <Layer>
                        {get_item_order().map((id, i) => to_canvas_elements(get_items()[id], id, selectedId,
                            on_select_id,
                            on_shape_change,
                            set_cursor,
                            urls
                        ))}
                    </Layer>
                    <Layer listening={false}>
                        {tempElem && to_canvas_elements(tempElem, 200, selectedId,
                            on_select_id,
                            on_shape_change,
                            set_cursor,
                            urls
                        )}
                    </Layer>
                </Stage>
                <div ref={menuref} id="menu">
                    <div>
                        <button id="delete-button" onClick={e => handle_stage_on_delete(e)}> Delete </button>
                    </div>
                </div>

            </div>
            <div id="pages">
                <div id="pagenav">
                    <Pagination size="sm">
                        <Pagination.First onClick={() => first_page()} />
                        <Pagination.Prev onClick={() => prev_page()} />
                        <Pagination.Item active>{active + 1}</Pagination.Item>
                        <Pagination.Next onClick={() => next_page()} />
                        <Pagination.Last onClick={() => last_page()} />
                    </Pagination>
                </div>
                <div id="pagebuttons">
                    <ButtonGroup size="sm">
                        <Button variant="outline-danger" onClick={() => delete_page()}>
                            DeletePage
                        </Button>
                        <Button variant="outline-success" onClick={() => insert_page()}>
                            Insert Page
                        </Button>
                    </ButtonGroup>
                </div>
            </div>
        </div>
    );
}