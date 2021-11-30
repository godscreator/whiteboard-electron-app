import "./toolbox_styles.css";
import React, { useState, useEffect } from "react";
import { BsBrush, BsEraser, BsSquare, BsSquareFill, BsCircle, BsCircleFill } from "react-icons/bs";
import { GiArrowCursor } from "react-icons/gi";
import { CgFormatText } from "react-icons/cg";
import { AiOutlineMinus } from "react-icons/ai";
import { FaShapes } from "react-icons/fa";
import { CirclePicker } from 'react-color';

const BrushToolbox = (props) => {
    const [radius, setRadius] = useState("5");
    const [color, setColor] = useState("black");
    useEffect(() => {
        props.onToolSettingChange({ name: "brush", radius: radius, color: color });
        // eslint-disable-next-line
    }, [radius, color]);

    return (
        <div className={"icon dropdown" + (props.current_tool === "brush" ? " active" : "")}
            onClick={() => {
                props.onToolSettingChange({ name: "brush", radius: radius, color: color });
            }}
        >
            <BsBrush />
            <div className="dropdown-content">
                radius <br />
                <input type="range" min="1" max="100" value={radius} onChange={evt => setRadius(evt.target.value)} /><br />
                color <br />
                <CirclePicker onChangeComplete={value => setColor(value.hex)} />
            </div>
        </div>

    );
}

const EraserToolbox = (props) => {
    const [radius, setRadius] = useState("5");
    useEffect(() => {
        props.onToolSettingChange({ name: "eraser", radius: radius });
        // eslint-disable-next-line
    }, [radius]);

    return (
        <div className={"icon dropdown" + (props.current_tool === "eraser" ? " active" : "")}
            onClick={() => {
                props.onToolSettingChange({ name: "eraser", radius: radius });
            }}
        >
            <BsEraser />
            <div className="dropdown-content">
                radius <br />
                <input type="range" min="1" max="100" value={radius} onChange={evt => setRadius(evt.target.value)} /><br />
            </div>
        </div>

    );
}

const ShapesToolbox = (props) => {
    const [radius, setRadius] = useState("1");
    const [color, setColor] = useState("black");
    const [type, setType] = useState("rect");

    useEffect(() => {
        props.onToolSettingChange({ name: "shapes", radius: radius, color: color, type: type });
        // eslint-disable-next-line
    }, [radius, color, type]);

    return (
        <div className={"icon dropdown" + (props.current_tool === "shapes" ? " active" : "")}
            onClick={() => {
                props.onToolSettingChange({ name: "shapes", radius: radius, color: color, type: type });
            }}
        >
            <FaShapes />
            <div className="dropdown-content">
                <div className="hicon-container">

                    <div className={"hicon" + (type === "line" ? " active" : "")} onClick={() => setType("line")} >
                        < AiOutlineMinus />
                    </div>
                    <div className={"hicon" + (type === "rect" ? " active" : "")} onClick={() => setType("rect")} >
                        <BsSquare />
                    </div>
                    <div className={"hicon" + (type === "fill rect" ? " active" : "")} onClick={() => setType("fill rect")} >
                        <BsSquareFill />
                    </div>
                    <div className={"hicon" + (type === "circle" ? " active" : "")} onClick={() => setType("circle")} >
                        <BsCircle />
                    </div>
                    <div className={"hicon" + (type === "fill circle" ? " active" : "")} onClick={() => setType("fill circle")}>
                        <BsCircleFill />
                    </div>
                </div>
                <br />
                radius <br />
                <input type="range" min="1" max="100" value={radius} onChange={evt => setRadius(evt.target.value)} /><br />
                color <br />
                <CirclePicker onChangeComplete={value => setColor(value.hex)} />
            </div>
        </div>
    );
}

const SelectToolbox = (props) => {
    return (
        <div className={"icon" + (props.current_tool === "select" ? " active" : "")}
            onClick={() => {
                props.onToolSettingChange({ name: "select" });
            }}
        >
            <GiArrowCursor />
        </div>
    );
}

const TextToolbox = (props) => {
    return (
        <div className={"icon" + (props.current_tool === "text" ? " active" : "")}
            onClick={() => {
                props.onToolSettingChange({ name: "text"});
            }}
        >
            <CgFormatText />
        </div>
    );
}

export default function Toolbox({ tool, onToolChangeHandler }) {

    return (
        <div className="tool-box">
            <div className="icon-bar">
                <BrushToolbox current_tool={tool.name} onToolSettingChange={t => onToolChangeHandler(t)} />
                <EraserToolbox current_tool={tool.name} onToolSettingChange={t => onToolChangeHandler(t)} />
                <ShapesToolbox current_tool={tool.name} onToolSettingChange={t => onToolChangeHandler(t)} />
                <SelectToolbox current_tool={tool.name} onToolSettingChange={t => onToolChangeHandler(t)} />
                <TextToolbox current_tool={tool.name} onToolSettingChange={t => onToolChangeHandler(t)} />
            </div>
        </div>
    );
}