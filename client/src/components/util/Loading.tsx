import { CircularProgress } from "@material-ui/core";
import React from "react";

export default function Loading() {
	return (
		<div className="d-flex justify-content-center w-100">
			<CircularProgress />
		</div>
	);
}
