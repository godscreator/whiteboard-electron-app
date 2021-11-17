import "./whiteboard_styles.css";
import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { BsCircleFill } from "react-icons/bs";
import to_draggables from './draggable.js';

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
    const canvasref3 = useRef(null);
    const canvas_width = 4096;
    const canvas_height = 2048;

    useEffect(() => {
        const canvas = canvasref.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,canvas.width,canvas.height);
    }, []);
  
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
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context2.clearRect(0, 0, canvas2.width, canvas2.height);
        img_array = [];
    };

    const load = () => {

    }

    const get_image_url = () => {
        return new Promise(async (resolve, reject) => {
            var img_url = "";
            if (canvasref.current !== null && canvasref3.current !== null) {
                const element = canvasref3.current;
                const canvas3 = await html2canvas(element,{backgroundColor:null, scale: 2});
                const canvas = canvasref.current;
                const context = canvas.getContext("2d");
                //const context3 = canvas3.getContext("2d");
                console.log("canvas: " + canvas.width + "," + canvas.height);
                //console.log("canvas3: " + canvas3.width + "," + canvas3.height);
                context.drawImage(canvas3, 0, 0, canvas.width, canvas.height);
                
                img_url = canvas.toDataURL('image/png', 1.0);
            }
            resolve(img_url);
        });
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
                context2.clearRect(0, 0, canvas2.width, canvas2.height);
                setPoints(points.concat([point]));
                draw.shape(context, points.concat([point]), tool.radius, tool.color, tool.type);
                img_array.push({ ...tool, points: points });
                setPoints([]);
                break;
            default:
        }
    };

    const select = () => {
        
    }

    const text = () => {

    }

    var fn_dict = {};
    fn_dict["brush"] = brush;
    fn_dict["eraser"] = eraser;
    fn_dict["shapes"] = shapes;
    fn_dict["select"] = select;
    fn_dict["text"] = text;

    var list_elements = [{ comp: <BsCircleFill />, left: 100, top: 100 }];

    
    return (
        <div id="container">
            <div id="topbar">
                <Topbar clear={() => clear()} load={() => load()} get_image_url={() => get_image_url()} />
            </div>

            <div id="toolbox">
                <Toolbox onToolChangeHandler={(t) => setTool(t)} />
            </div>
            <div id="boardcanvas"
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
                }}>

                <div id="canvas" className="board">
                    <canvas
                        className="white-board"
                        ref={canvasref}
                        width={canvas_width} height={canvas_height}
                        style={{ cursor: canvasCursor }}
                    />
                </div>

                <div id="canvas2" className="board">
                    <canvas
                        className="white-board"
                        ref={canvasref2}
                        
                        width={canvas_width} height={canvas_height}
                        style={{ cursor: canvasCursor }}
                    />
                </div>
                <div id="canvas3" className="board " width={canvas_width} height={canvas_height} ref={canvasref3}>
                    {to_draggables(list_elements, () => { })}
                </div>
            </div>
        </div>
    );
}