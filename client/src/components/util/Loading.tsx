import Spinner from "react-bootstrap/Spinner";
import React from "react";

export default function Loading({ className }: { className?: string }) {
	return (
		<div
			className={`d-flex justify-content-center align-items-center w-100 ${
				className ?? `${className}`
			}`}
		>
			<Spinner animation="border" role="status" variant="primary" />
		</div>
	);
}

export function LoadingSmall() {
	return (
		<Spinner
			as={"span"}
			animation="border"
			role="status"
			variant="primary"
			size="sm"
			className="m-1"
		/>
	);
}
