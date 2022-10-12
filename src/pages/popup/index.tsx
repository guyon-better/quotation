import React from "react";
import { createRoot } from "react-dom/client";
import Popup from "@pages/popup/Popup";
import "@pages/popup/index.less";

function init() {
  const root = document.querySelector("#root");
  if (!root) {
    throw new Error("Can not find root");
  }
  createRoot(root).render(<Popup />);
}

init();
