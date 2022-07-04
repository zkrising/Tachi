import "@fortawesome/fontawesome-free/css/all.min.css";
import React from "react";
import ReactDOM from "react-dom";
import App from "./app/App";
import "./_assets/flaticon/flaticon.css";
import "./_assets/flaticon2/flaticon.css";
import "./_assets/keenthemes-icons/font/ki.css";
import "./_style/base.scss";

const { PUBLIC_URL } = process.env;

// if (!PUBLIC_URL) {
// 	throw new Error(
// 		`No PUBLIC_URL was defined in environment. Have you forgot to set it in a .env file?`
// 	);
// }

ReactDOM.render(<App basename={PUBLIC_URL!} />, document.getElementById("root"));
