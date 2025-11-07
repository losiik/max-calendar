import React from "react";
import ReactDOM from "react-dom/client";
import { MaxUI } from "@maxhub/max-ui";

import "@maxhub/max-ui/dist/styles.css";
import "./index.css";
import "./App.css";
import { withQueryClient } from "../providers/query/index.tsx";
import App from "./App.tsx";

const Root = withQueryClient(() => <App />);
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MaxUI  >
      <Root />
    </MaxUI>
  </React.StrictMode>
);
