import React from "react";

export default function TitleCell({ title, artist }: { title: string; artist: string }) {
	return (
		<td style={{ textAlign: "left", minWidth: "140px" }}>
			{title}
			<br />
			<small>{artist}</small>
		</td>
	);
}
