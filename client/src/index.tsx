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

const { PUBLIC_URL } = process.env;

console.log(process.env);

// if (!PUBLIC_URL) {
// 	throw new Error(
// 		`No PUBLIC_URL was defined in environment. Have you forgot to set it in a .env file?`
// 	);
// }

ReactDOM.render(<App basename={PUBLIC_URL!} />, document.getElementById("root"));
