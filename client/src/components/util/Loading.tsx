import Spinner from "react-bootstrap/Spinner";
import React from "react";

export default function Loading() {
	return (
		<div className="d-flex justify-content-center align-items-center w-100">
			<Spinner animation="border" role="status" variant="primary" />
		</div>
	);
}
