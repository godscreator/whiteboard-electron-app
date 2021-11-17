import "./App.css";
import React from "react";
import Whiteboard from "./whiteboard.js";
import { BsCircleFill } from "react-icons/bs";
import to_draggables from './draggable.js';

export default function App() {

  var list_elements = [{ comp: <BsCircleFill />, left: 100, top: 100 }];

  return (
    <div className="App">
      <Whiteboard />
      < div id="my-canvas">
        {to_draggables(list_elements, () => { })}
      </div>
    </div>
  );
}
