import { AllLUGPTStatsContext } from "context/AllLUGPTStatsContext";
import { UserContext } from "context/UserContext";
import { TachiConfig } from "lib/config";
import React, { useContext } from "react";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link } from "react-router-dom";
import { FormatGame, GetGameConfig } from "tachi-common";

export default function UserProfileLinks() {
	const { user } = useContext(UserContext);
	const { ugs } = useContext(AllLUGPTStatsContext);
	const links = [];

	const ugsMap = new Map();
	for (const s of ugs || []) {
		ugsMap.set(`${s.game}:${s.playtype}`, s);
	}

	for (const game of TachiConfig.games) {
		for (const playtype of GetGameConfig(game).playtypes) {
			const e = ugsMap.get(`${game}:${playtype}`);

			if (!e) {
				continue;
			}

			links.push(
				<NavDropdown.Item
					as={Link}
					key={`${e.game}:${e.playtype}`}
					to={`/u/${user?.username}/games/${e.game}/${e.playtype}`}
				>
					{FormatGame(e.game, e.playtype)}
				</NavDropdown.Item>
			);
		}
	}

	// I don't think escaping bootstrap is necessary but it was how i felt like doing it at the time... maybe I'll fix it at some point. maybe not
	return (
		<NavDropdown id="Your Profiles" title="Your Profiles" bsPrefix="header-link btn btn-header">
			{links}
		</NavDropdown>
	);
}
