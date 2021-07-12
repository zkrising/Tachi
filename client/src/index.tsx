/**
 * Create React App entry point. This and `public/index.html` files can not be
 * changed or moved.
 */
import React from "react";
import ReactDOM from "react-dom";
import App from "./app/App";
import "./index.scss";
import "./_metronic/_assets/plugins/keenthemes-icons/font/ki.css";
import "socicon/css/socicon.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./_metronic/_assets/plugins/flaticon/flaticon.css";
import "./_metronic/_assets/plugins/flaticon2/flaticon.css";
import "react-datepicker/dist/react-datepicker.css";

const { PUBLIC_URL } = process.env;

ReactDOM.render(<App basename={PUBLIC_URL} />, document.getElementById("root"));
