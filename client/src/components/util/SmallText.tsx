import React from "react";

export default function SmallText({ small, large }: { small: string; large: string }) {
	return (
		<>
			<span className="d-none d-lg-inline">{large}</span>
			<span className="d-inline d-lg-none">{small}</span>
		</>
	);
}
