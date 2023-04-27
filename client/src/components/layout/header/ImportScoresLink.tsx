import React from "react";
import { FormatGame, GetGameConfig } from "tachi-common";
import { TachiConfig } from "lib/config";
import NavDropdown from "react-bootstrap/NavDropdown";
import { DropdownLink } from "./MenuLink";

export default function ImportScoresLink() {
	const links = [];

	for (const game of TachiConfig.games) {
		const gameConfig = GetGameConfig(game);

		links.push(<DropdownLink key={game} name={gameConfig.name} to={`/import?game=${game}`} />);
	}

	return (
		<NavDropdown id="ImportScores" title="Import Scores" bsPrefix="header-link btn btn-header">
			{links}
			<DropdownLink name={"Batch Manual"} to={"/import/batch-manual"} />
		</NavDropdown>
	);
}
