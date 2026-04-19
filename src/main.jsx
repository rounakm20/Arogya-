import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import PublicQR from "./components/PublicQR";
import "./index.css";

const path = window.location.pathname;

if (path.startsWith("/p/")) {
  // Use URL API for safer parsing or just handle trailing slashes/queries
  const parts = path.split("/p/");
  const id = parts[1].split('?')[0].split('/')[0]; // strip query or trailing slashes
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <PublicQR id={id} />
    </React.StrictMode>
  );
} else {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
