import React from "react";
import { UGPT } from "./react";

export interface GPTUtility {
	urlPath: string;
	name: string;
	description: React.ReactChild;
	component: (ugpt: UGPT) => JSX.Element;
	personalUseOnly?: boolean;
}
