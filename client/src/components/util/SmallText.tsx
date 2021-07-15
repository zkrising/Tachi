import React from "react";

export default function SmallText({ small, large }: { small: string; large: string }) {
	return (
		<>
			<span className="d-none d-lg-block">{large}</span>
			<span className="d-block d-lg-none">{small}</span>
		</>
	);
}
