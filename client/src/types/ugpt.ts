import React from "react";
import { UGPT } from "./react";

export interface GPTTool {
	urlPath: string;
	name: string;
	description: React.ReactChild;
	component: (ugpt: UGPT) => JSX.Element;
}
