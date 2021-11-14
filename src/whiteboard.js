import "./whiteboard_styles.css";
import React, { useState, useRef } from "react";

import Toolbox from "./toolbox.js";
import Topbar from "./file_menu.js";
import * as draw from './draw_util.js';


export default function Whiteboard() {

    const [tool, setTool] = useState({ name: "brush", color: "black", radius: 5 });
    const [canvasCursor, setCanvasCursor] = useState("pointer");
    const [isDrawing, setIsDrawing] = useState(false);
    const [points, setPoints] = useState([]);
    const canvasref = useRef(null);
    const canvasref2 = useRef(null);
  
    let img_array = [];

    const point_wrt_canvas = (pos) => {
        const canvas = canvasref.current;
        const rect = canvas.getBoundingClientRect(); // abs. size of element
        const scaleX = canvas.width / rect.width; // relationship bitmap vs. element for X
        const scaleY = canvas.height / rect.height; // relationship bitmap vs. element for Y
        const OL = rect.left;
        const OT = rect.top;
        return {
            x: Math.floor((pos.x - OL) * scaleX),
            y: Math.floor((pos.y - OT) * scaleY)
        }
    }

    const clear = () => {
        const canvas = canvasref.current;
        const context = canvas.getContext('2d');
        const canvas2 = canvasref2.current;
        const context2 = canvas2.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        context2.clearRect(0, 0, canvas2.width, canvas2.height);
        img_array = [];
    };

    const load = () => {

    }

    const get_image_url = () => {
        if (canvasref.current !== null) {
            return canvasref.current.toDataURL('image/png', 1.0);
        }
        return "";
    }

    const brush = (action, point) => {
        const canvas = canvasref.current;
        const context = canvas.getContext('2d');
        setCanvasCursor("crosshair");
        switch (action) {

            case "mouse_down":
                setPoints([point]);
                break;

            case "mouse_move":
                setPoints(points.concat([point]));
                draw.freehand(context, points, tool.radius, tool.color);
                break;

            case "mouse_up":
                img_array.push({ ...tool, points: points });
                setPoints([]);
                break;
            default:
        }
    }

    const eraser = (action, point) => {
        const canvas = canvasref.current;
        const context = canvas.getContext('2d');
        setCanvasCursor("crosshair");
        switch (action) {

            case "mouse_down":
                setPoints([point]);
                break;

            case "mouse_move":
                setPoints(points.concat([point]));
                draw.erase(context, points, tool.radius);
                break;

            case "mouse_up":
                img_array.push({ ...tool, points: points });
                setPoints([]);
                break;
            default:
        }
    };

    const shapes = (action, point) => {
        const canvas = canvasref.current;
        const context = canvas.getContext('2d');
        const canvas2 = canvasref2.current;
        const context2 = canvas2.getContext("2d");
        setCanvasCursor("crosshair");
        switch (action) {

            case "mouse_down":
                setPoints([point]);
                break;

            case "mouse_move":
                context2.clearRect(0, 0, canvas2.width, canvas2.height);
                const new_points = points.concat([point]);
                draw.shape(context2, new_points, tool.radius, tool.color, tool.type);
                break;

            case "mouse_up":
                setPoints(points.concat([point]));
                draw.shape(context, points.concat([point]), tool.radius, tool.color, tool.type);
                img_array.push({ ...tool, points: points });
                setPoints([]);
                break;
            default:
        }
    };

    var fn_dict = {};
    fn_dict["brush"] = brush;
    fn_dict["eraser"] = eraser;
    fn_dict["shapes"] = shapes;

    return (
        <div id="container">
            <div id="topbar">
                <Topbar clear={() => clear()} load={() => load()} get_image_url={() => get_image_url()} />
            </div>

            <div id="toolbox">
                <Toolbox onToolChangeHandler={(t) => setTool(t)} />
            </div>
            <div id="boardcanvas">

                <div id="canvas">
                    <canvas
                        className="white-board"
                        ref={canvasref}
                        width="4096"
                        height="3072"
                        style={{ cursor: canvasCursor }}
                    />
                </div>

                <div id="canvas2">
                    <canvas
                        className="white-board"
                        ref={canvasref2}
                        onMouseDown={evt => {
                            setIsDrawing(true);
                            const action = "mouse_down";
                            const point = point_wrt_canvas({ x: evt.clientX, y: evt.clientY });
                            fn_dict[tool.name](action, point);
                        }}
                        onMouseUp={evt => {
                            setIsDrawing(false);
                            const action = "mouse_up";
                            const point = point_wrt_canvas({ x: evt.clientX, y: evt.clientY });
                            fn_dict[tool.name](action, point);
                        }}
                        onMouseMove={evt => {
                            if (isDrawing) {
                                const action = "mouse_move";
                                const point = point_wrt_canvas({ x: evt.clientX, y: evt.clientY });
                                fn_dict[tool.name](action, point);
                            }
                        }}
                        width="4096"
                        height="3072"
                        style={{ cursor: canvasCursor }}
                    />
                </div>
            </div>
        </div>
    );
}