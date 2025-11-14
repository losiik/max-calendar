import React from "react";
import ReactDOM from "react-dom/client";

import "@maxhub/max-ui/dist/styles.css";
import "./index.css";
import "./App.css";

import MaxUIRoot from "./MaxUIRoot";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MaxUIRoot />
  </React.StrictMode>
);
