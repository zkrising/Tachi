import "@fortawesome/fontawesome-free/css/all.min.css";
import React from "react";
import ReactDOM from "react-dom";
import "./_style/stub.scss";
import "./_assets/flaticon/flaticon.css";
import "./_assets/flaticon2/flaticon.css";
import "./_assets/keenthemes-icons/font/ki.css";
import App from "app/App";

const { PUBLIC_URL } = process.env;

ReactDOM.render(<App basename={PUBLIC_URL!} />, document.getElementById("root"));
