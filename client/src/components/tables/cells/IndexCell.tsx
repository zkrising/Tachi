import React from "react";
import { integer } from "tachi-common";

const COLORS = ["rgba(212,175,55,0.2)", "rgba(192,192,192,0.2)", "rgba(139,69,19,0.2)"];

export default function IndexCell({ index }: { index: integer }) {
	return (
		<td
			style={{
				backgroundColor: index < 3 ? COLORS[index] : undefined,
			}}
		>
			<span className="text-muted" style={{ marginRight: "1px" }}>
				#
			</span>
			<span
				style={{
					fontWeight: index < 10 ? "bold" : undefined,
				}}
			>
				{index + 1}
			</span>
		</td>
	);
}
