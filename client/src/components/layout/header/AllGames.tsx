import { TachiConfig } from "lib/config";
import React from "react";
import { FormatGame, GetGameConfig } from "tachi-common";
import NavDropdown from "react-bootstrap/NavDropdown";
import { DropdownLink } from "./MenuLink";

export default function AllGames() {
	const links = [];

	for (const game of TachiConfig.games) {
		const gameConfig = GetGameConfig(game);

		for (const playtype of gameConfig.playtypes) {
			links.push(
				<DropdownLink
					key={`${game}:${playtype}`}
					name={FormatGame(game, playtype)}
					to={`/games/${game}/${playtype}`}
				/>
			);
		}
	}

	return (
		<NavDropdown id="Global Info" title="Global Info" bsPrefix="header-link btn btn-header">
			{links}
		</NavDropdown>
	);
}
