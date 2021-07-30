import { CircularProgress } from "@material-ui/core";
import React, { CSSProperties } from "react";

export default function Loading({ style }: { style?: CSSProperties }) {
	return (
		<div className="d-flex justify-content-center align-items-center w-100" style={style}>
			<CircularProgress />
		</div>
	);
}
