import "./whiteboard_styles.css";
import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer } from 'react-konva';
import Toolbox from "./toolbox.js";
import Topbar from "./file_menu.js";
import { to_canvas_elements } from "./canvas_element";

export default function Whiteboard() {

    const [tool, setTool] = useState({ name: "brush", color: "black", radius: 5 });
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectedId, selectShape] = useState(null);
    const stageref = useRef(null);

    const [elems, setElems] = useState([]);
    const [tempElem, setTempElem] = useState(null);

    const checkDeselect = (e) => {
        // deselect when clicked on empty area
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            selectShape(null);
        }
    };

    const clear = () => {
        setElems([]);
    };

    const load = () => {

    }

    const get_image_url = () => {
        return new Promise(async (resolve, reject) => {
            var img_url = "";
            if (stageref.current !== null) {
                img_url = stageref.current.toDataURL();
            }
            resolve(img_url);
        });
    }

    const brush = (action, point) => {
        switch (action) {

            case "mouse_down":
                setTempElem({ ...tool, points: [point.x, point.y], id: elems.length });
                break;

            case "mouse_move":
                if (tempElem.points.length >= 10) {
                    var p = tempElem.points.concat([point.x, point.y]);
                    var t = { ...tempElem, points: p };
                    setElems(elems.concat(t));
                    setTempElem({ ...tool, points: [point.x, point.y], id: elems.length + 1 });
                } else {
                    var q = tempElem.points.concat([point.x, point.y]);
                    setTempElem({ ...tool, points: q, id: elems.length });
                }

                break;

            case "mouse_up":
                setElems(elems.concat(tempElem));
                setTempElem(null);
                break;
            default:
        }
    }

    const eraser = (action, point) => {
        switch (action) {

            case "mouse_down":
                setElems([...elems, { ...tool, points: [point.x, point.y], id: elems.length }]);
                break;

            case "mouse_move":
                let last = elems[elems.length - 1];
                // add point
                last.points = last.points.concat([point.x, point.y]);

                // replace last
                elems.splice(elems.length - 1, 1, last);
                setElems(elems.concat());

                break;

            case "mouse_up":
                setTempElem(null);
                break;
            default:
        }
    };

    const shapes = (action, point) => {
        switch (action) {

            case "mouse_down":
                setTempElem({ ...tool, points: [point.x, point.y], id: elems.length });
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
                setTempElem({ ...tempElem, points: q, shapeProps: { x: q[0], y: q[1], width: q[2] - q[0], height: q[3] - q[1] , rotation: 0} });
                break;

            case "mouse_up":
                setElems(elems.concat(tempElem));
                setTempElem(null);
                break;
            default:
        }
    };

    const select = (action, point) => {
    }

    const text = (action, point) => {

    }

    var fn_dict = {};
    fn_dict["brush"] = brush;
    fn_dict["eraser"] = eraser;
    fn_dict["shapes"] = shapes;
    fn_dict["select"] = select;
    fn_dict["text"] = text;

    return (
        <div id="container">
            <div id="topbar">
                <Topbar clear={() => clear()} load={() => load()} get_image_url={() => get_image_url()} />
            </div>

            <div id="toolbox">
                <Toolbox onToolChangeHandler={(t) => setTool(t)} />
            </div>
            <div id="boardcanvas" className="white-board">
                <Stage ref={stageref}
                    width={1024}
                    height={512}
                    onMouseDown={evt => {

                        setIsDrawing(true);
                        const action = "mouse_down";
                        const stage = evt.target.getStage();
                        const p = stage.getPointerPosition();
                        const point = { x: p.x, y: p.y };
                        fn_dict[tool.name](action, point);
                        checkDeselect(evt);
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
                        //console.log(elems);
                        //console.log("temp: ");
                        //console.log(tempElem);
                    }}
                >
                    <Layer>
                        {elems.map((line, i) => to_canvas_elements(line, i, selectedId,
                            (id) => {
                                selectShape(id);
                                console.log(id + " selected")
                            },
                            (shape) => {
                                console.log(shape);
                                var shapes = elems.slice();
                                shapes[i] = shape;
                                setElems(shapes);
                            }
                        ))}
                    </Layer>
                    <Layer listening={false}>
                        {tempElem && to_canvas_elements(tempElem, 200, selectedId,
                            (id) => {
                                selectShape(id);
                                console.log(id + " selected")
                            },
                            (shape) => {
                                console.log(shape);
                                setTempElem(shape);
                            }
                        )}
                    </Layer>
                </Stage>
            </div>
        </div>
    );
}