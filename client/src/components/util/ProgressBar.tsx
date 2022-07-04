import React, { CSSProperties } from "react";
import { integer } from "tachi-common";

export default function CustomProgressBar({
	animated,
	striped,
	style,
	max = 100,
	now = 0,
}: {
	animated?: boolean;
	striped?: boolean;
	style?: CSSProperties;
	max?: integer;
	now?: integer;
}) {
	return (
		<div className="progress">
			<div
				className={`progress-bar${animated ? " progress-bar-animated" : ""}${
					striped ? " progress-bar-striped" : ""
				}`}
				style={Object.assign(
					{
						width: `${(now / max) * 100}%`,
					},
					style
				)}
			/>
		</div>
	);
}
