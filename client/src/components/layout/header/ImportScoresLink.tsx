import React from "react";
import { FormatGame, GetGameConfig } from "tachi-common";
import { TachiConfig } from "lib/config";
import NavDropdown from "react-bootstrap/NavDropdown";
import { NavLink } from "react-router-dom";

export default function ImportScoresLink({ onClick }: { onClick?: () => void }) {
	const links = [];

	for (const game of TachiConfig.games) {
		const gameConfig = GetGameConfig(game);

		links.push(
			<NavDropdown.Item
				className="rounded my-1"
				onClick={() => {
					onClick?.();
				}}
				as={NavLink}
				key={game}
				to={`/import?game=${game}`}
			>
				{gameConfig.name}
			</NavDropdown.Item>
		);
	}

	return (
		<NavDropdown id="import-scores" title="Import Scores" className="header-dropdown">
			{links}
			<NavDropdown.Item
				onClick={() => {
					onClick?.();
				}}
				as={NavLink}
				to={"/import/batch-manual"}
			>
				Batch Manual
			</NavDropdown.Item>
		</NavDropdown>
	);
}
