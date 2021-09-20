import useSetSubheader from "components/layout/header/useSetSubheader";
import React from "react";
import { FormatGame, GetGameConfig } from "tachi-common";
import { GamePT } from "types/react";

export default function GPTLeaderboardsPage({ game, playtype }: GamePT) {
	useSetSubheader(
		["Games", GetGameConfig(game).name, playtype, "Leaderboards"],
		[game, playtype],
		`${FormatGame(game, playtype)} Leaderboards`
	);

	return <div>leaderboard</div>;
}
