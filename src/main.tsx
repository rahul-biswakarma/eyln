import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { initAuthListener } from "./lib/auth";
import { initPersistence } from "./lib/persistence";
import "katex/dist/katex.min.css";
import "./theme.css";
initAuthListener();
initPersistence();
ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>);
