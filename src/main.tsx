import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { initAuthListener } from "./lib/auth";
import { initSync } from "./lib/sync";
import "katex/dist/katex.min.css";
import "./theme.css";

// Bootstrap auth + cloud sync (both no-ops when Firebase isn't configured).
initAuthListener();
initSync();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
