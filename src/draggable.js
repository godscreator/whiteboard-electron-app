import React, { useRef, useState } from "react";
import "./draggable_styles.css";
import { RiDragMove2Line } from "react-icons/ri";

export function Draggable(props) {
    const draggableref = useRef(null);
    const [left, setLeft] = useState(props.left);
    const [top, setTop] = useState(props.top);

    const closeDragElement = () => {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }

    const elementDrag = e => {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    };
    const dragMouseDown = (e) => {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }
    return (
        <div ref={draggableref} id="mydiv" style={{left:left+"px",top:top+"px"}}>
            <div id="mydivheader">Click here to move</div>
                {props.children}
        </div>
    );
}

export function DragArea(props) {
    const arearef = useRef(null);
    var drag_listener = (left, top) => { };
    const on_mouse_move = evt => {
        const area = arearef.current;
        drag_listener(evt.clientX-area.offsetLeft, evt.clientY-area.offsetTop);
    }
    var c = 0;
    const draggable_children =  React.Children.map(props.children, child => {
        if (React.isValidElement(child)) {
            c++;
            return React.cloneElement(child, { key: child.key + " draggable: " + c, set_drag_listener: listener => { drag_listener = listener;} });
        }
        return child;
    });
    return (
        <div ref={arearef} className="drag-area"
            onMouseMove={evt => on_mouse_move(evt)}
            onMouseUp={evt => drag_listener = (left, top) => { }}
            style={{ width: "100%", height: "100%" }}>
            {draggable_children}
        </div>
    );
}

const to_draggables = (list_elements,on_drag_stop) => {
    var c = 1;
    var els = list_elements.map(el => {
        if (React.isValidElement(el.comp)) {
            c++;
            return { comp: React.cloneElement(el.comp, { key: "comp: " + c }), left: el.left, top: el.top };
        }
        return el;
    });
    var comps = els.map(el => {
        var comp = el.comp;
        return (
            <Draggable key={comp.key + "_draggable"} left={el.left} top={el.top} on_drag_stop={(left, top) => { el.left = left; el.top = top; on_drag_stop();}}>
                {comp}
            </Draggable>
        );
    });
    return <DragArea>{comps}</DragArea>;
};


const to_draggables = () => {
    
}
export default to_draggables;