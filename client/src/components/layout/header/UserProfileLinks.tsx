import { AllLUGPTStatsContext } from "context/AllLUGPTStatsContext";
import { UserContext } from "context/UserContext";
import { TachiConfig } from "lib/config";
import React, { useContext } from "react";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link } from "react-router-dom";
import { FormatGame, GetGameConfig } from "tachi-common";

export default function UserProfileLinks({
	onClick,
	disabled = true,
}: {
	onClick?: () => void | null;
	disabled: boolean;
}) {
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
					className="rounded my-1"
					as={Link}
					key={`${e.game}:${e.playtype}`}
					to={`/u/${user?.username}/games/${e.game}/${e.playtype}`}
					onClick={() => {
						onClick?.();
					}}
				>
					{FormatGame(e.game, e.playtype)}
				</NavDropdown.Item>
			);
		}
	}

	return (
		<NavDropdown
			disabled={disabled}
			className="header-dropdown"
			id="your-profiles"
			title="Your Profiles"
		>
			{links}
		</NavDropdown>
	);
}
