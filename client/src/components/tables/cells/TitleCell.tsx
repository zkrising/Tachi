import React from "react";

export default function TitleCell({ title, artist }: { title: string; artist: string }) {
	return (
		<td style={{ textAlign: "left" }}>
			{title}
			<br />
			<small>{artist}</small>
		</td>
	);
}
