import React from "react";
import { JustChildren } from "types/react";

export default function CenterPage({ children }: JustChildren) {
	return (
		<div className="container d-flex flex-column flex-root justify-content-center align-items-center">
			{children}
		</div>
	);
}
