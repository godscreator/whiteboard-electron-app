import "./whiteboard_styles.css";
import React, { useState, useRef } from "react";
import { Stage, Layer } from 'react-konva';
import Toolbox from "./toolbox.js";
import Topbar from "./file_menu.js";
import { to_canvas_elements } from "./canvas_element";

export default function Whiteboard() {

    const stageref = useRef(null);
    const stageparentref = useRef(null);
    const [tempElem, setTempElem] = useState(null);
    const [urls, setUrls] = useState({});

    // display of items
    const [items, setItems] = useState({});
    const [item_order, setItemOrder] = useState([]);
    const [id_count, setIdCount] = useState(0);



    const add_item = (item, to_history = true, index = -1, id = -1) => {
        if (id === -1) {
            id = id_count;
            setIdCount(id_count + 1);
        }
        var c_items = { ...items };
        c_items[id] = item;
        c_items[id].id = id;
        setItems(c_items);
        if (index < 0 || index >= item_order.length) {
            setItemOrder(item_order.concat([id]));
        } else {
            var order = item_order.slice();
            order.splice(index, 0, id);
            setItemOrder(order);
        }

        if (to_history)
            add_to_history({ type: "add", id: id });

        return id;
    }

    const remove_item = (id, to_history = true) => {
        var c_items = { ...items };
        var old_value = { ...c_items[id] };
        delete c_items[id];
        setItems(c_items);
        const index = item_order.indexOf(id);
        var c_item_order = item_order.slice();
        if (index > -1) {
            c_item_order.splice(index, 1);
        }
        setItemOrder(c_item_order);
        if (to_history)
            add_to_history({ type: "remove", value: old_value, index: index, id: id });
        return { value: old_value, index: index };
    }

    const change_item = (id, new_value, to_history = true) => {
        var old_value = { ...items[id] };
        var c_items = { ...items };
        c_items[id] = new_value;
        c_items[id].id = id;
        setItems(c_items);
        if (to_history)
            add_to_history({ type: "change", id: id, old_value: old_value });
        return new_value;
    }


    // undo and redo

    const [history, setHistory] = useState([]);
    const [redohistory, setRedoHistory] = useState([]);
    const undo = () => {
        var chistory = history.slice();
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
            setRedoHistory(redohistory.concat([r]));
            setHistory(chistory);
        }
    }
    const redo = () => {
        var rhistory = redohistory.slice();
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
            setHistory(history.concat([h]))
        }
    }
    const add_to_history = (h) => {
        setHistory(history.concat([h]));
        setRedoHistory([]);
    }

    // select

    const [selectedId, selectShape] = useState(null);
    const [currentShapeId, setCurrentShapeId] = useState(-1);
    const [count, setCount] = useState(0);
    const menuref = useRef(null); // reference to right click menu

    const checkDeselect = (e) => {
        // deselect when clicked on empty area
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            selectShape(null);
        }
    };



    // filemenu

    const topbarref = useRef(null);

    const get_image_url = () => {
        return new Promise(async (resolve, reject) => {
            var img_url = "";
            if (stageref.current !== null) {
                img_url = stageref.current.toDataURL({ pixelRatio: 2 });
            }
            resolve(img_url);
        });
    }

    const clear = () => {
        setItems({});
        setItemOrder([]);
        setTempElem({});
        setIdCount(0);
        setCount(0);
        setUrls({});
        setTool({ name: "select" });
        setIsDrawing(false);
        selectShape(null);
        setCursor("default");
        setHistory([]);
        setRedoHistory([]);
    }

    const load_elements = (elements) => {
        clear();
        var c_items = {};
        var c_item_order = [];
        var c = 0;
        var elems = elements.slice();
        for (var i = 0; i < elems.length; i++) {
            elems[i].id = c;
            c_items[c] = elems[i];
            c_item_order.push(elems[i].id);
            c++;
        }
        setIdCount(c);
        setItems(c_items);
        setItemOrder(c_item_order);
    }

    const add_url = (name, url) => {
        urls[name] = url;
        setUrls(urls);
    }

    const get_data = () => {
        var elems = item_order.map((id, i) => items[id]);
        return { elements: elems, urls: urls };
    }

    const insert_image = (name) => {
        add_item({ name: "image", fname: name, id: count, shapeProps: { x: 0, y: 0, width: -1, height: -1, rotation: 0 } });
    }

    // Toolbox 

    const [tool, setTool] = useState({ name: "brush", color: "black", radius: 5 });
    const [isDrawing, setIsDrawing] = useState(false);

    const brush = (action, point) => {
        selectShape(null);
        switch (action) {

            case "mouse_down":
                setTempElem({ ...tool, points: [point.x, point.y], id: count });
                setCount(count + 1);
                break;

            case "mouse_move":
                var q = tempElem.points.concat([point.x, point.y]);
                setTempElem({ ...tool, points: q, id: count });
                setCount(count + 1);
                break;

            case "mouse_up":
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
                setTempElem({ ...tool, points: [point.x, point.y], id: count });
                setCount(count + 1);
                break;

            case "mouse_move":
                var q = tempElem.points.concat([point.x, point.y]);
                setTempElem({ ...tool, points: q, id: count });
                setCount(count + 1);
                break;

            case "mouse_up":
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
                setTempElem({ ...tool, points: [point.x, point.y], id: count });
                setCount(count + 1);
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
            default:
        }
    };

    const select = (action, point) => {
        setTempElem(null);
    }

    const text = (action, point) => {
        selectShape(null);
        switch (action) {
            case "mouse_up":
                var new_elem = { ...tool, text: "", id: count, shapeProps: { x: point.x, y: point.y, width: 100, height: 100, rotation: 0 } };
                add_item(new_elem);
                setTool({ name: "select" });
                selectShape(count);
                setCount(count + 1);
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
            checkDeselect(evt);
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
        const action = "mouse_enter";
        const stage = evt.target.getStage();
        const p = stage.getPointerPosition();
        const point = { x: p.x, y: p.y };
        fn_dict[tool.name](action, point);
    }

    const handle_stage_mouse_leave = evt => {
        // call for the selected tool to do when mouse leave the stage
        const action = "mouse_leave";
        const stage = evt.target.getStage();
        const p = stage.getPointerPosition();
        const point = { x: p.x, y: p.y };
        fn_dict[tool.name](action, point);
    }

    const handle_stage_on_context_menu = e => {
        // call for the selected tool to do when right click
        const stage = e.target.getStage();
        if (e.target !== stage) {
            var id = Number(e.target.id());
            setCurrentShapeId(id);
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
            setCurrentShapeId(-1);
        }
    }


    // Pages

    const [showPages, setShowPages] = useState(false);

    return (
        <div id="container"
            onKeyDown={e => handle_container_key_down(e)}
            tabIndex="0"
        >
            <div id="topbar">
                <Topbar
                    ref={topbarref}
                    load_elements={(elements) => load_elements(elements)}
                    add_url={(name, url) => add_url(name, url)}
                    get_data={() => get_data()}
                    insert_image={(name) => insert_image(name)}
                    clear={() => clear()}
                    get_image_url={() => get_image_url()}
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
                    height={650}
                    onMouseDown={evt => handle_stage_mouse_down(evt)}
                    onMousemove={evt => handle_stage_mouse_move(evt)}
                    onMouseup={evt => handle_stage_mouse_up(evt)}
                    onMouseEnter={evt => handle_stage_mouse_enter(evt)}
                    onMouseLeave={evt => handle_stage_mouse_leave(evt)}
                    onContextMenu={e => handle_stage_on_context_menu(e)}
                >
                    <Layer>
                        {item_order.map((id, i) => to_canvas_elements(items[id], i, selectedId,
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
        </div>
    );
}