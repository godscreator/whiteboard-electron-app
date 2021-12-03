import "./whiteboard_styles.css";
import React, { useState, useRef } from "react";
import { Stage, Layer } from 'react-konva';
import Toolbox from "./toolbox.js";
import Topbar from "./file_menu.js";
import { to_canvas_elements } from "./canvas_element";

export default function Whiteboard() {

    const stageref = useRef(null);
    const stageparentref = useRef(null);
    const [elems, setElems] = useState([]);
    const [tempElem, setTempElem] = useState(null);
    const [urls, setUrls] = useState({});

    // filemenu

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
        setElems([]);
        setTempElem({});
        setCount(0);
        setUrls({});
        setTool({ name: "select" });
        setIsDrawing(false);
        selectShape(null);
        setCursor("default");
    }

    const load_elements = (elements) => {
        var tmp = elements.slice();
        var c = 0;
        tmp.forEach((e, i) => {
            e.id = c;
            c++;
        })
        setCount(c);
        setElems(tmp);
    }

    const add_url = (name, url) => {
        urls[name] = url;
        setUrls(urls);
    }

    const get_data = () => {
        return { elements: elems, urls: urls };
    }

    const insert_image = (name) => {
        setElems(elems.concat([{ name: "image", fname: name, id: count, shapeProps: { x: 0, y: 0, width: -1, height: -1, rotation: 0 } }]))
        setCount(count + 1);
        console.log("image inserted");
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
                setElems(elems.concat(tempElem));
                console.log("history: id: ", tempElem.id, " prev: ", {}, " now: ", tempElem);
                setTempElem(null);
                break;

            case "mouse_leave":
                setIsDrawing(false);
                if (tempElem !== null) {
                    var p2 = tempElem.points.concat([point.x, point.y]);
                    var t2 = { ...tempElem, points: p2 };
                    setElems(elems.concat(t2));
                    console.log("history: id: ", t2.id, " prev: ", {}, " now: ", t2);
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
                setElems(elems.concat(tempElem));
                console.log("history: id: ", tempElem.id, " prev: ", {}, " now: ", tempElem);
                setTempElem(null);
                break;

            case "mouse_leave":
                setIsDrawing(false);
                if (tempElem !== null) {
                    var p2 = tempElem.points.concat([point.x, point.y]);
                    var t2 = { ...tempElem, points: p2 };
                    setElems(elems.concat(t2));
                    console.log("history: id: ", tempElem.id, " prev: ", {}, " now: ", t2);
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
                setElems(elems.concat(tempElem));
                console.log("history: id: ", tempElem.id, " prev: ", {}, " now: ", tempElem);
                setTempElem(null);
                break;
            default:
        }
    };

    const select = (action, point) => {
    }

    const text = (action, point) => {
        selectShape(null);
        switch (action) {
            case "mouse_up":
                var new_elem = { ...tool, text: "", id: count, shapeProps: { x: point.x, y: point.y, width: 100, height: 100, rotation: 0 } };
                setElems(elems.concat([new_elem]))
                console.log("history: id: ", new_elem.id, " prev: ", {}, " now: ", new_elem);
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

    // select and delete 
    const [selectedId, selectShape] = useState(null);
    const [currentShapeIndex, setCurrentShapeIndex] = useState(-1);
    const [count, setCount] = useState(0);
    const checkDeselect = (e) => {
        // deselect when clicked on empty area
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            selectShape(null);
        }
    };

    const menuref = useRef(null);

    return (
        <div id="container">
            <div id="topbar">
                <Topbar
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
            <div ref={stageparentref} id="boardcanvas" className="white-board">
                <Stage ref={stageref}
                    style={{ cursor: cursor }}
                    width={stageparentref.current ? stageparentref.current.offsetWidth : 100}
                    height={650}
                    onMouseDown={evt => {

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
                    }}
                    onMousemove={evt => {

                        if (isDrawing) {
                            const action = "mouse_move";
                            const stage = evt.target.getStage();
                            const p = stage.getPointerPosition();
                            const point = { x: p.x, y: p.y };
                            fn_dict[tool.name](action, point);
                        }
                    }}
                    onMouseup={evt => {

                        setIsDrawing(false);
                        const action = "mouse_up";
                        const stage = evt.target.getStage();
                        const p = stage.getPointerPosition();
                        const point = { x: p.x, y: p.y };
                        fn_dict[tool.name](action, point);

                    }}
                    onMouseEnter={evt => {
                        const action = "mouse_enter";
                        const stage = evt.target.getStage();
                        const p = stage.getPointerPosition();
                        const point = { x: p.x, y: p.y };
                        fn_dict[tool.name](action, point);
                    }}
                    onMouseLeave={evt => {
                        const action = "mouse_leave";
                        const stage = evt.target.getStage();
                        const p = stage.getPointerPosition();
                        const point = { x: p.x, y: p.y };
                        fn_dict[tool.name](action, point);
                    }}
                    onContextMenu={e => {
                        const stage = e.target.getStage();
                        if (e.target !== stage) {
                            var id = Number(e.target.id());
                            console.log("id: ", id);
                            elems.forEach((elem, i) => {
                                if (elem.id === id) {
                                    setCurrentShapeIndex(i);
                                    console.log("found id");
                                    if (menuref.current) {
                                        console.log("displaying menu");
                                        var menuNode = menuref.current;
                                        menuNode.style.display = 'block';
                                        var containerRect = stage.container().getBoundingClientRect();
                                        menuNode.style.top =
                                            containerRect.top + stage.getPointerPosition().y + 'px';
                                        menuNode.style.left =
                                            containerRect.left + stage.getPointerPosition().x + 'px';
                                    }
                                }
                            })
                        } else {
                            setCurrentShapeIndex(-1);
                            if (menuref.current) {
                                menuref.current.style.display = "none";
                            }
                        }
                    }}
                >
                    <Layer>
                        {elems.map((line, i) => to_canvas_elements(line, i, selectedId,
                            (k) => {
                                selectShape(elems[k].id);
                                setTool({ name: "select" });
                            },
                            (shape, k) => {
                                var shapes = elems.slice();
                                var temp_shape = shapes[k];
                                shapes[k] = shape;
                                setElems(shapes);
                                console.log("history: id: ", temp_shape.id, " prev: ", temp_shape, " now: ", shape);
                                setTool({ name: "select" });
                            }
                            , set_cursor
                            , urls
                        ))}
                    </Layer>
                    <Layer listening={false}>
                        {tempElem && to_canvas_elements(tempElem, 200, selectedId,
                            (id) => {
                                selectShape(id);
                                setTool({ name: "select" });
                            },
                            (shape) => {
                                setTempElem(shape);
                                setTool({ name: "select" });
                            }
                            , set_cursor
                            , urls
                        )}
                    </Layer>
                </Stage>
                <div ref={menuref} id="menu">
                    <div>
                        <button id="pulse-button"
                            onClick={() => {
                                console.log("pulse: ", currentShapeIndex);
                            }}
                        >
                            Pulse
                        </button>
                        <button id="delete-button"
                            onClick={() => {
                                console.log("delete: ", currentShapeIndex);
                                if (currentShapeIndex >= 0) {
                                    var shapes = elems.slice();
                                    shapes[currentShapeIndex] = {};
                                    setElems(shapes);
                                    setCurrentShapeIndex(-1);
                                    if (menuref.current) {
                                        menuref.current.style.display = "none";
                                    }
                                }
                            }}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}