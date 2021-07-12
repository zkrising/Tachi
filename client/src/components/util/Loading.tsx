import { CircularProgress } from "@material-ui/core";
import React from "react";

export default function Loading() {
	return (
		<div className="mx-auto align-self-center">
			<CircularProgress />
		</div>
	);
}
