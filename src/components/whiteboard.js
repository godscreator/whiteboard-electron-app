import "./whiteboard.css";
import React, { useState, useRef } from "react";
import { Stage, Layer } from 'react-konva';
import Pagination from "react-bootstrap/Pagination";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";
import Toolbox from "./toolbox.js";
import Topbar from "./topbar";
import { to_canvas_elements } from "../canvas_element";
import { useSelector, useDispatch } from 'react-redux';
import {
    addItem,
    removeItem,
    changeItem,
    putLast,
    insertPage,
    removePage,
    changePage,
    updatePageImage,
    undo,
    redo,
} from '../redux';

export default function Whiteboard() {

    const stageref = useRef(null);
    const stageparentref = useRef(null);
    const [tempElem, setTempElem] = useState(null);
    const get_image_url = () => {
        var img_url = "";
        if (stageref.current !== null) {
            img_url = stageref.current.toDataURL({ pixelRatio: 2 });
        }
        return { url: img_url, page_no: active };
    }

    // select
    const [selectedId, selectShape] = useState(null);
    const [currentShapeId, setCurrentShapeId] = useState(null);
    const menuref = useRef(null); // reference to right click menu

    const active = useSelector(state => state.pages.active);
    const items = useSelector(state => state.pages.pages[state.pages.active].items);
    const item_order = useSelector(state => state.pages.pages[state.pages.active].item_order);
    const urls = useSelector(state => state.pages.urls);
    
    const dispatch = useDispatch();
    const add_item = item => dispatch(addItem(item));
    const remove_item = id => dispatch(removeItem(id));
    const change_item = (id, new_value) => dispatch(changeItem(id, new_value));
    const put_last = id => dispatch(putLast(id));
    const insert_page = () => {
        dispatch(updatePageImage(get_image_url().url));
        dispatch(insertPage());
    };
    const delete_page = () => dispatch(removePage());
    const change_page = (index) => {
        dispatch(updatePageImage(get_image_url().url));
        dispatch(changePage(index));
    };

    // filemenu
    const topbarref = useRef(null);

    const clear = () => {
        setTempElem({});
        setTool({ name: "select" });
        setIsDrawing(false);
        selectShape(null);
    }

    const insert_media = (name, width, height, type) => {
        switch (type) {
            case "image":
                add_item({ name: "image", fname: name, id: -1, shapeProps: { x: 20, y: 20, width: (width * 200) / height, height: 200, rotation: 0 } });
                break;
            case "video":
                add_item({ name: "video", fname: name, id: -1, shapeProps: { x: 20, y: 20, width: (width * 200) / height, height: 200, rotation: 0 } });
                break;
            case "audio":
                add_item({ name: "audio", fname: name, id: -1, shapeProps: { x: 20, y: 20, width: 500, height: 50, rotation: 0 } });
                break;
            default:
                break;
        }

    }

    // Toolbox 

    const [tool, setTool] = useState({ name: "brush", color: "black", radius: 5 });
    const [isDrawing, setIsDrawing] = useState(false);

    const brush = (action, point) => {
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
                add_item({ ...tool, text: "", id: -1, shapeProps: { x: point.x, y: point.y, width: 100, height: 50, rotation: 0 } });
                setTempElem(null);
                setTool({ name: "select" });
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

    const refresh = () => {
        setTool({ name: "select" });
    }

    const on_select_id = (id) => {
        if (tool.name === "select") {
            selectShape(id);
            put_last(id);
        }
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
            dispatch(undo());
        } else if ((e.ctrlKey || e.metaKey) && e.code === "KeyR") {
            console.log("redo");
            e.preventDefault();
            dispatch(redo());
        }
    }

    const handle_stage_mouse_down = evt => {
        // call for the selected tool to do when mouse down

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

    const handle_stage_mouse_move = evt => {
        // call for the selected tool to do when mouse move

        if (isDrawing) {
            const action = "mouse_move";
            const stage = evt.target.getStage();
            const p = stage.getPointerPosition();
            const point = { x: p.x, y: p.y };
            fn_dict[tool.name](action, point);
        }

    }

    const handle_stage_mouse_up = evt => {
        // call for the selected tool to do when mouse up
        setIsDrawing(false);
        const action = "mouse_up";
        const stage = evt.target.getStage();
        const p = stage.getPointerPosition();
        const point = { x: p.x, y: p.y };
        fn_dict[tool.name](action, point);
    }

    const handle_stage_mouse_enter = evt => {
        // call for the selected tool to do when mouse enter the stage
        setIsDrawing(false);
    }

    const handle_stage_mouse_leave = evt => {
        // call for the selected tool to do when mouse leave the stage
        setIsDrawing(false);
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
                    insert_media={(name, width, height, type) => insert_media(name, width, height, type)}
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
                <div id="board"
                    onPointerEnter={evt => handle_stage_mouse_enter(evt)}
                    onPointerLeave={evt => handle_stage_mouse_leave(evt)}>
                    <Stage ref={stageref}
                        width={1200}
                        height={700}
                        onPointerDown={evt => handle_stage_mouse_down(evt)}
                        onPointerMove={evt => handle_stage_mouse_move(evt)}
                        onPointerUp={evt => handle_stage_mouse_up(evt)}
                        onContextMenu={e => handle_stage_on_context_menu(e)}
                    >
                        <Layer>
                            {item_order.map((id, i) => to_canvas_elements(items[id], id, selectedId,
                                on_select_id,
                                on_shape_change,
                                urls
                            ))}
                        </Layer>
                        <Layer listening={false}>
                            {tempElem && to_canvas_elements(tempElem, 200, selectedId,
                                on_select_id,
                                on_shape_change,
                                urls
                            )}
                        </Layer>
                    </Stage>
                </div>
                <div ref={menuref} id="menu">
                    <div>
                        <button id="delete-button" onClick={e => handle_stage_on_delete(e)}> Delete </button>
                    </div>
                </div>

            </div>
            <div id="pages">
                <div id="pagenav">
                    <Pagination size="sm">
                        <Pagination.First onClick={() => change_page("first")} />
                        <Pagination.Prev onClick={() => change_page("prev")} />
                        <Pagination.Item active>{active + 1}</Pagination.Item>
                        <Pagination.Next onClick={() => change_page("next")} />
                        <Pagination.Last onClick={() => change_page("last")} />
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