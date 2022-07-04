import React from "react";
import { JustChildren } from "types/react";
import Muted from "./Muted";

export default function DiscordLink({ children }: JustChildren) {
	if (!process.env.REACT_APP_DISCORD) {
		<a href="#">
			Discord <Muted>(However, no Discord has been set up yet...)</Muted>
		</a>;
	}

	return (
		<a href={process.env.REACT_APP_DISCORD} target="_blank" rel="noopener noreferrer">
			{children}
		</a>
	);
}
