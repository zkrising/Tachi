import { TachiConfig } from "lib/config";
import React from "react";
import { FormatGame, GetGameConfig } from "tachi-common";
import QuickDropdown from "components/ui/QuickDropdown";
import DropdownNavLink from "components/ui/DropdownNavLink";

export default function AllGames({
	className,
	style,
}: {
	className?: string;
	style?: React.CSSProperties;
}) {
	const links = [];

	for (const game of TachiConfig.games) {
		const gameConfig = GetGameConfig(game);

		for (const playtype of gameConfig.playtypes) {
			links.push(
				<DropdownNavLink key={`${game}:${playtype}`} to={`/games/${game}/${playtype}`}>
					{FormatGame(game, playtype)}
				</DropdownNavLink>
			);
		}
	}

	return (
		<QuickDropdown
			variant="clear"
			toggle="Global Info"
			className={`h-14 ${className}`}
			menuStyle={style}
			caret
		>
			{links}
		</QuickDropdown>
	);
}
