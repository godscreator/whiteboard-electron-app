import "./App.css";
import React from "react";
import Whiteboard from "./components/whiteboard.js";
import { Provider } from 'react-redux';
import store from './redux/store';

export default function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <Whiteboard />
      </div>
    </Provider>
  );
}
