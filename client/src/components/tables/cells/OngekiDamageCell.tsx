import React from "react";
import { COLOUR_SET } from "tachi-common";

export default function OngekiDamageCell({ damage }: { damage: number | null | undefined }) {
	return (
		<td>
			<strong>
				<span style={{ color: COLOUR_SET.red }}>{damage ?? "?"}</span>
			</strong>
		</td>
	);
}
