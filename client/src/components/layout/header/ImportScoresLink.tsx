import { parse } from "url";
import React from "react";
import { GetGameConfig } from "tachi-common";
import { TachiConfig } from "lib/config";
import QuickDropdown from "components/ui/QuickDropdown";
import DropdownNavLink from "components/ui/DropdownNavLink";

export default function ImportScoresLink({
	className,
	style,
}: {
	className?: string;
	style?: React.CSSProperties;
}) {
	const links = [];

	for (const game of TachiConfig.games) {
		const gameConfig = GetGameConfig(game);

		links.push(
			<DropdownNavLink
				isActive={() => {
					const queryGame = new URLSearchParams(window.location.search).get("game");
					return queryGame === game;
				}}
				key={game}
				to={`/import?game=${game}`}
			>
				{gameConfig.name}
			</DropdownNavLink>
		);
	}

	return (
		<QuickDropdown
			variant="clear"
			toggle="Import Scores"
			className={`h-14 ${className}`}
			menuStyle={style}
			caret
		>
			{links}
		</QuickDropdown>
	);
}
