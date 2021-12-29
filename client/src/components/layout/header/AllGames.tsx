import { TachiConfig } from "lib/config";
import React from "react";
import { FormatGame, GetGameConfig } from "tachi-common";
import MenuDropdown from "./MenuDropdown";
import MenuLink from "./MenuLink";

export default function AllGames() {
	const links = [];

	for (const game of TachiConfig.supportedGames) {
		const gameConfig = GetGameConfig(game);

		for (const playtype of gameConfig.validPlaytypes) {
			links.push(
				<MenuLink
					key={`${game}:${playtype}`}
					name={FormatGame(game, playtype)}
					to={`/dashboard/games/${game}/${playtype}`}
				/>
			);
		}
	}

	return <MenuDropdown name="All Games">{links}</MenuDropdown>;
}
