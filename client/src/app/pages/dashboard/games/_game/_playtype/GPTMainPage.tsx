import Activity from "components/activity/Activity";
import useSetSubheader from "components/layout/header/useSetSubheader";
import React from "react";
import { FormatGame, GetGameConfig } from "tachi-common";
import { GamePT } from "types/react";

export default function GPTMainPage({ game, playtype }: GamePT) {
	useSetSubheader(
		["Games", GetGameConfig(game).name, playtype],
		[game, playtype],
		FormatGame(game, playtype)
	);

	return <Activity url={`/games/${game}/${playtype}/activity`} />;
}
