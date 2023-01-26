import React from "react";
import { FormatGame, GetGameConfig } from "tachi-common";
import { TachiConfig } from "lib/config";
import MenuLink from "./MenuLink";
import MenuDropdown from "./MenuDropdown";

export default function ImportScoresLink() {
	const links = [];

	for (const game of TachiConfig.games) {
		const gameConfig = GetGameConfig(game);

		links.push(<MenuLink key={game} name={gameConfig.name} to={`/import?game=${game}`} />);
	}

	return <MenuDropdown name="Import Scores">{links}</MenuDropdown>;
}
