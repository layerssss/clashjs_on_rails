import "../styles.css";
import React from "react";
import ReactDOM from "react-dom/client";

import ClashRender from "../components/ClashRender";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Hello World from Webpacker");
  const battleElement = document.getElementById("battle");
  if (battleElement) {
    const root = ReactDOM.createRoot(battleElement);
    root.render(
      <React.StrictMode>
        <ClashRender />
      </React.StrictMode>
    );
  }
});
