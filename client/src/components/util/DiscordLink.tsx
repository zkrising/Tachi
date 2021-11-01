import React from "react";
import { JustChildren } from "types/react";

export default function DiscordLink({ children }: JustChildren) {
	return (
		<a href="" target="_blank" rel="noopener noreferrer">
			{children}
		</a>
	);
}
