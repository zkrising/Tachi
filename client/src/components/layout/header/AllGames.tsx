import { TachiConfig } from "lib/config";
import React from "react";
import { NavLink } from "react-router-dom";
import { FormatGame, GetGameConfig } from "tachi-common";
import NavDropdown from "react-bootstrap/NavDropdown";

export default function AllGames({ onClick }: { onClick?: () => void }) {
	const links = [];

	for (const game of TachiConfig.games) {
		const gameConfig = GetGameConfig(game);

		for (const playtype of gameConfig.playtypes) {
			links.push(
				<NavDropdown.Item
					className="rounded my-1"
					as={NavLink}
					key={`${game}:${playtype}`}
					to={`/games/${game}/${playtype}`}
					onClick={() => {
						onClick?.();
					}}
				>
					{FormatGame(game, playtype)}
				</NavDropdown.Item>
			);
		}
	}

	return (
		<NavDropdown id="global-info" title="Global Info" className="header-dropdown">
			{links}
		</NavDropdown>
	);
}
