import React from "react";
import { FormatGame, GetGameConfig } from "tachi-common";
import { TachiConfig } from "lib/config";
import NavDropdown from "react-bootstrap/NavDropdown";
import { NavLink } from "react-router-dom";

export default function ImportScoresLink() {
	const links = [];

	for (const game of TachiConfig.games) {
		const gameConfig = GetGameConfig(game);

		links.push(
			<NavDropdown.Item as={NavLink} key={game} to={`/import?game=${game}`}>
				{gameConfig.name}
			</NavDropdown.Item>
		);
	}

	return (
		<NavDropdown id="ImportScores" title="Import Scores" bsPrefix="header-link btn btn-header">
			{links}
			<NavDropdown.Item as={NavLink} to={"/import/batch-manual"}>
				Batch Manual
			</NavDropdown.Item>
		</NavDropdown>
	);
}
