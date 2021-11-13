import "./topbar_styles.css";
import React from "react";

export default function Topbar(props) {
    return (
        <div className="top-bar">
            White Board
            <div onClick={() => props.clear()}>New</div>
            <div onClick={() => props.open()}>Open</div>
            <div onClick={() => props.save()}>Save</div>
            <div onClick={() => props.export_as()}>Export</div>
        </div>
    );
};