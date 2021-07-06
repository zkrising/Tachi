import React from "react";
import { Route, RouteProps } from "react-router-dom";

export default function ExactRoute({ children, ...props }: RouteProps) {
	return (
		<Route exact {...props}>
			{children}
		</Route>
	);
}
